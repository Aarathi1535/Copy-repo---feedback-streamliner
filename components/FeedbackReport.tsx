import logo from './logo.jpg';
import React from 'react';
import { EvaluationReport } from '../types';

interface FeedbackReportProps {
  report: EvaluationReport;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({ report }) => {
  const calculatedSum = report.questions?.reduce((acc: number, q: any) => acc + (Number(q.marks) || 0), 0) || 0;

  const getQuestionStatus = (q: any) => {
    const marks = Number(q.marks) || 0;
    const feedbackText = q.feedbackPoints?.join(' ').toLowerCase() || '';
    
    if (marks === 0 || feedbackText.includes('not attempted') || feedbackText.includes('skipped')) {
      return 'unattempted';
    }
    
    if (feedbackText.includes('excellent') || feedbackText.includes('perfect') || feedbackText.includes('precise') || feedbackText.includes('correct')) {
      return 'correct';
    }
    
    return 'partial';
  };

  const reportStyle: React.CSSProperties = {
    fontFamily: '"Times New Roman", Times, serif',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '900',
  };

  const contentStyle: React.CSSProperties = {
    fontSize: '14px',
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const renderBulletList = (items: string[]) => (
    <ul className="list-disc list-outside ml-10 space-y-1 mb-2">
      {items.map((item, i) => {
        // Simple regex to bold text within quotes or around key terms if needed, 
        // but the AI usually provides structured strings.
        return (
          <li key={i} className="text-slate-800 leading-tight" style={contentStyle}>
             <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="max-w-[850px] mx-auto my-10 bg-white shadow-none rounded-none border border-slate-300 report-container p-6 sm:p-12 text-[#1e1e1e]" style={reportStyle}>
      
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center gap-6">
          <div className="flex justify-center mb-8">
          <img
            src={logo}
            alt="Anatomy Guru Logo"
            className="w-48 h-48 object-contain"
          />
        </div>

          {/* <div className="text-left border-l-2 border-slate-900 pl-6">
            <div className="flex items-end gap-1 mb-1 leading-none">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">
                ANATOMY <span className="text-orange-500">GURU</span>
              </h1>
              <span className="text-xs font-bold align-top ml-1">®</span>
            </div>
            <p className="text-[16px] italic text-slate-600 font-bold mb-2">Nothing Left Undissected !!</p>
            <div className="w-64 h-6">
              <svg viewBox="0 0 200 20" className="w-full h-full">
                <path d="M0 10 H150 L190 4 L155 16 H0 Z" fill="#1e1e1e" />
                <circle cx="15" cy="10" r="2" fill="white" />
                <rect x="80" y="8" width="40" height="4" fill="white" opacity="0.3" rx="1" />
              </svg>
            </div>
          </div> */}
        </div>
      </div>

      {/* Metadata Section */}
      <div className="text-center mb-6">
        <h2 className="text-red-600 uppercase tracking-widest border-b border-red-100 pb-1 inline-block mb-3" style={headingStyle}>
          {report.testTitle || 'General Medicine Test'}
        </h2>
        <div className="space-y-1" style={contentStyle}>
          <p className="font-bold text-slate-800">Topics: {report.testTopics}</p>
          <p className="font-black text-blue-800 uppercase tracking-widest">Date: {report.testDate}</p>
        </div>
      </div>

      {/* Student Identification Row */}
      <div className="mb-4 flex items-center gap-2 border-t pt-4 border-slate-100" style={contentStyle}>
        <span className="text-red-600 font-black uppercase tracking-wide">Student Name:</span>
        <span className="font-black text-slate-900 underline underline-offset-4 decoration-2 decoration-red-600/30">{report.studentName}</span>
      </div>

      {/* Assessment Table */}
      <div className="border border-slate-400 overflow-hidden mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-400 bg-white">
              <th className="w-[10%] p-2 border-r border-slate-400 text-red-600 uppercase tracking-wide text-center" style={headingStyle}>Q No</th>
              <th className="w-[75%] p-2 border-r border-slate-400 text-red-600 uppercase tracking-wide text-center" style={headingStyle}>Feedback</th>
              <th className="w-[15%] p-2 text-red-600 uppercase tracking-wide text-center" style={headingStyle}>Marks</th>
            </tr>
          </thead>
          <tbody>
            {report.questions?.map((q, idx) => {
              const status = getQuestionStatus(q);
              return (
                <tr key={idx} className={`border-b border-slate-300 ${status === 'unattempted' ? 'bg-red-50' : status === 'correct' ? 'bg-emerald-50' : ''}`}>
                  <td className="p-2 border-r border-slate-400 text-center font-bold text-slate-800 align-top" style={contentStyle}>{q.qNo}</td>
                  <td className="p-3 border-r border-slate-400 align-top">
                    <ul className="list-disc list-outside ml-4 space-y-1" style={contentStyle}>
                      {q.feedbackPoints?.map((point, pIdx) => (
                        <li key={pIdx} className={`font-semibold leading-relaxed ${status === 'unattempted' ? 'text-red-700 font-black italic' : 'text-slate-800'}`}>
                          <span dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className={`p-2 text-center font-bold align-top ${status === 'unattempted' ? 'text-red-600' : status === 'correct' ? 'text-emerald-700' : 'text-slate-800'}`} style={contentStyle}>
                    {q.marks}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-slate-50 border-t border-slate-400">
              <td colSpan={2} className="p-3 border-r border-slate-400 text-right font-black uppercase tracking-widest text-slate-500" style={contentStyle}>
                Total Score Summation
              </td>
              <td className="p-3 text-center font-black text-red-600 bg-white" style={headingStyle}>
                {calculatedSum} / {report.maxScore || 100}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* General Feedback Section - Mirroring the Image Logic */}
      <div className="mt-6 border border-slate-900 p-6">
        <h3 className="text-red-600 font-bold mb-2 underline" style={headingStyle}>General Feedback:</h3>
        
        <div className="space-y-4">
          {/* 1) Overall Performance */}
          <div>
            <h4 style={sectionLabelStyle}>1) Overall Performance</h4>
            {renderBulletList(report.generalFeedback.overallPerformance)}
          </div>

          {/* 2) MCQs */}
          <div>
            <h4 style={sectionLabelStyle}>2) MCQs</h4>
            {renderBulletList(report.generalFeedback.mcqs)}
          </div>

          {/* 3) Content Accuracy */}
          <div>
            <h4 style={sectionLabelStyle}>3) Content Accuracy</h4>
            {renderBulletList(report.generalFeedback.contentAccuracy)}
          </div>

          {/* 4) Completeness of Answers */}
          <div>
            <h4 style={sectionLabelStyle}>4) Completeness of Answers</h4>
            {renderBulletList(report.generalFeedback.completenessOfAnswers)}
          </div>

          {/* 5) Presentation & Diagrams */}
          <div>
            <h4 style={sectionLabelStyle}>5) Presentation & Diagrams (Major drawback)</h4>
            {renderBulletList(report.generalFeedback.presentationDiagrams)}
          </div>

          {/* 6) Investigations */}
          <div>
            <h4 style={sectionLabelStyle}>6) Investigations (Must improve)</h4>
            {renderBulletList(report.generalFeedback.investigations)}
          </div>

          {/* 7) Attempting All Questions */}
          <div>
            <h4 style={sectionLabelStyle}>7) Attempting All Questions</h4>
            {renderBulletList(report.generalFeedback.attemptingQuestions)}
          </div>

          {/* 8) What to do next */}
          <div>
            <h4 style={sectionLabelStyle}>8) What to do next (Action points)</h4>
            {renderBulletList(report.generalFeedback.actionPoints)}
          </div>
        </div>
      </div>

      {/* Official Footer */}
      <div className="mt-12 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-t-2 border-slate-900 pt-8">
        <div className="flex items-center gap-6">
          <span>Digital Transcript</span>
          <span className="text-red-300">|</span>
          <span>ANATOMY GURU AUTHENTICATED</span>
        </div>
        <div className="text-slate-900 font-bold">VERIFIED © 2025</div>
      </div>
    </div>
  );
};

export default FeedbackReport;



// import React from 'react';
// import { EvaluationReport } from '../types';

// interface FeedbackReportProps {
//   report: EvaluationReport;
// }

// const FeedbackReport: React.FC<FeedbackReportProps> = ({ report }) => {
//   const calculatedSum = report.questions?.reduce((acc: number, q: any) => acc + (Number(q.marks) || 0), 0) || 0;

//   const getQuestionStatus = (q: any) => {
//     const marks = Number(q.marks) || 0;
//     const feedbackText = q.feedbackPoints?.join(' ').toLowerCase() || '';
    
//     if (marks === 0 || feedbackText.includes('not attempted') || feedbackText.includes('skipped')) {
//       return 'unattempted';
//     }
    
//     if (feedbackText.includes('excellent') || feedbackText.includes('perfect') || feedbackText.includes('precise') || feedbackText.includes('correct')) {
//       return 'correct';
//     }
    
//     return 'partial';
//   };

//   const reportStyle: React.CSSProperties = {
//     fontFamily: '"Times New Roman", Times, serif',
//   };

//   const headingStyle: React.CSSProperties = {
//     fontSize: '16px',
//     fontWeight: '900',
//   };

//   const contentStyle: React.CSSProperties = {
//     fontSize: '14px',
//   };

//   return (
//     <div className="max-w-[850px] mx-auto my-10 bg-white shadow-none rounded-none border border-slate-300 report-container p-6 sm:p-12 text-[#1e1e1e]" style={reportStyle}>
      
//       {/* Brand Header - High Fidelity Logo Reconstruction */}
//       <div className="flex flex-col items-center mb-8 no-print">
//         <div className="flex items-center justify-center gap-6">
//           <div className="relative w-32 h-32 flex items-center justify-center">
//             {/* <svg viewBox="0 0 100 100" className="w-full h-full">
//               <path d="M40 30 C25 30 15 40 15 55 C15 70 25 80 30 85 V93 H50 V85 C55 80 65 70 65 55 C65 40 55 30 40 30 Z" fill="#f8fafc" stroke="#1e1e1e" strokeWidth="1.5"/>
//               <circle cx="32" cy="55" r="5" fill="#1e1e1e" />
//               <circle cx="48" cy="55" r="5" fill="#1e1e1e" />
//               <path d="M38 68 L40 65 L42 68 Z" fill="#1e1e1e" />
//               <path d="M32 75 Q40 78 48 75" fill="none" stroke="#1e1e1e" strokeWidth="1" />
//               <path d="M12 48 L40 32 L68 48 L40 64 Z" fill="#1e1e1e" />
//               <path d="M25 55 V62 C25 62 40 66 55 62 V55" fill="#1e1e1e" />
//               <path d="M68 48 V62" stroke="#f59e0b" strokeWidth="2" />
//               <circle cx="68" cy="62" r="3" fill="#f59e0b" />
//             </svg> */}
//              <img
//                src="/components/logo.jpg"
//                alt="Anatomy Guru Logo"
//                className="w-full h-full object-contain"
//               />
//           </div>
          
//           {/* <div className="text-left border-l-2 border-slate-900 pl-6">
//             <div className="flex items-end gap-1 mb-1 leading-none">
//               <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">
//                 ANATOMY <span className="text-orange-500">GURU</span>
//               </h1>
//               <span className="text-xs font-bold align-top ml-1">®</span>
//             </div>
//             <p className="text-[16px] italic text-slate-600 font-bold mb-2">Nothing Left Undissected !!</p>
//             <div className="w-64 h-6">
//               <svg viewBox="0 0 200 20" className="w-full h-full">
//                 <path d="M0 10 H150 L190 4 L155 16 H0 Z" fill="#1e1e1e" />
//                 <circle cx="15" cy="10" r="2" fill="white" />
//                 <rect x="80" y="8" width="40" height="4" fill="white" opacity="0.3" rx="1" />
//               </svg>
//             </div>
//           </div> */}
//         </div>
//       </div>

//       {/* Metadata Section */}
//       <div className="text-center mb-6">
//         <h2 className="text-red-600 uppercase tracking-widest border-b border-red-100 pb-1 inline-block mb-3" style={headingStyle}>
//           {report.testTitle || 'General Medicine Test'}
//         </h2>
//         <div className="space-y-1" style={contentStyle}>
//           <p className="font-bold text-slate-800">Topics: {report.testTopics}</p>
//           <p className="font-black text-blue-800 uppercase tracking-widest">Date: {report.testDate}</p>
//         </div>
//       </div>

//       {/* Student Identification Row */}
//       <div className="mb-4 flex items-center gap-2 border-t pt-4 border-slate-100" style={contentStyle}>
//         <span className="text-red-600 font-black uppercase tracking-wide">Student Name:</span>
//         <span className="font-black text-slate-900 underline underline-offset-4 decoration-2 decoration-red-600/30">{report.studentName}</span>
//       </div>

//       {/* Assessment Table */}
//       <div className="border border-slate-400 overflow-hidden mb-8">
//         <table className="w-full border-collapse">
//           <thead>
//             <tr className="border-b border-slate-400 bg-white">
//               <th className="w-[10%] p-2 border-r border-slate-400 text-red-600 uppercase tracking-wide text-center" style={headingStyle}>Q No</th>
//               <th className="w-[75%] p-2 border-r border-slate-400 text-red-600 uppercase tracking-wide text-center" style={headingStyle}>Feedback</th>
//               <th className="w-[15%] p-2 text-red-600 uppercase tracking-wide text-center" style={headingStyle}>Marks</th>
//             </tr>
//           </thead>
//           <tbody>
//             {report.questions?.map((q, idx) => {
//               const status = getQuestionStatus(q);
//               return (
//                 <tr key={idx} className={`border-b border-slate-300 ${status === 'unattempted' ? 'bg-red-50' : status === 'correct' ? 'bg-emerald-50' : ''}`}>
//                   <td className="p-2 border-r border-slate-400 text-center font-bold text-slate-800 align-top" style={contentStyle}>{q.qNo}</td>
//                   <td className="p-3 border-r border-slate-400 align-top">
//                     <ul className="list-disc list-outside ml-4 space-y-1" style={contentStyle}>
//                       {q.feedbackPoints?.map((point, pIdx) => (
//                         <li key={pIdx} className={`font-semibold leading-relaxed ${status === 'unattempted' ? 'text-red-700 font-black italic' : 'text-slate-800'}`}>
//                           {point}
//                         </li>
//                       ))}
//                     </ul>
//                   </td>
//                   <td className={`p-2 text-center font-bold align-top ${status === 'unattempted' ? 'text-red-600' : status === 'correct' ? 'text-emerald-700' : 'text-slate-800'}`} style={contentStyle}>
//                     {q.marks}
//                   </td>
//                 </tr>
//               );
//             })}
//             <tr className="bg-slate-50 border-t border-slate-400">
//               <td colSpan={2} className="p-3 border-r border-slate-400 text-right font-black uppercase tracking-widest text-slate-500" style={contentStyle}>
//                 Total Score Summation
//               </td>
//               <td className="p-3 text-center font-black text-red-600 bg-white" style={headingStyle}>
//                 {calculatedSum} / {report.maxScore || 100}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* General Feedback Section */}
//       <div className="mt-12 space-y-10 no-print">
//         <section>
//           <div className="flex items-center gap-3 mb-6">
//             <div className="h-5 w-1.5 bg-red-600"></div>
//             <h3 className="text-slate-900 uppercase tracking-widest" style={headingStyle}>General Feedback</h3>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//             <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
//               <h4 className="text-blue-600 uppercase tracking-widest mb-2" style={headingStyle}>MCQ Trends</h4>
//               <p className="font-bold text-slate-700 italic" style={contentStyle}>"{report.generalFeedback.sectionAnalysis.mcqs}"</p>
//             </div>
//             <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
//               <h4 className="text-emerald-600 uppercase tracking-widest mb-2" style={headingStyle}>Short Answers</h4>
//               <p className="font-bold text-slate-700 italic" style={contentStyle}>"{report.generalFeedback.sectionAnalysis.shortAnswers}"</p>
//             </div>
//             <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
//               <h4 className="text-purple-600 uppercase tracking-widest mb-2" style={headingStyle}>Long Essays</h4>
//               <p className="font-bold text-slate-700 italic" style={contentStyle}>"{report.generalFeedback.sectionAnalysis.longEssays}"</p>
//             </div>
//           </div>

//           <p className="leading-relaxed text-slate-800 font-bold mb-8 bg-yellow-50 p-6 border-l-4 border-yellow-400 italic" style={contentStyle}>
//             "{report.generalFeedback.overallPerformance}"
//           </p>
//         </section>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           <div className="p-6 bg-emerald-50/30 rounded-xl border border-emerald-100">
//             <h4 className="text-emerald-700 font-black uppercase tracking-widest mb-4" style={headingStyle}>Core Strengths</h4>
//             <ul className="list-disc list-outside ml-4 space-y-3" style={contentStyle}>
//               {report.generalFeedback.strengths.map((s, i) => (
//                 <li key={i} className="font-bold text-slate-700">{s}</li>
//               ))}
//             </ul>
//           </div>
//           <div className="p-6 bg-rose-50/30 rounded-xl border border-rose-100">
//             <h4 className="text-rose-700 font-black uppercase tracking-widest mb-4" style={headingStyle}>Knowledge Gaps</h4>
//             <ul className="list-disc list-outside ml-4 space-y-3" style={contentStyle}>
//               {report.generalFeedback.weaknesses.map((w, i) => (
//                 <li key={i} className="font-bold text-slate-700">{w}</li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         <section className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
//            <h4 className="text-orange-400 font-black uppercase tracking-widest mb-4" style={headingStyle}>Identified Habits & Trends</h4>
//            <ul className="list-disc list-outside ml-4 space-y-2" style={contentStyle}>
//               {report.generalFeedback.repeatingTrends.map((trend, i) => (
//                 <li key={i} className="text-slate-300 font-medium">{trend}</li>
//               ))}
//            </ul>
//         </section>

//         {report.generalFeedback.unattemptedAdvice.length > 0 && (
//           <section className="bg-red-50 p-6 border border-red-100 rounded-xl">
//             <h4 className="text-red-700 font-black uppercase tracking-widest mb-4" style={headingStyle}>Gap Recovery Plan</h4>
//             <div className="space-y-4">
//               {report.generalFeedback.unattemptedAdvice.map((item, i) => (
//                 <div key={i} className="flex flex-col gap-1 border-b border-red-100 pb-3 last:border-0">
//                   <span className="font-black text-red-600 uppercase" style={contentStyle}>Q.{item.qNo} Recovery</span>
//                   <p className="font-bold text-slate-800 italic leading-snug" style={contentStyle}>"{item.advice}"</p>
//                 </div>
//               ))}
//             </div>
//           </section>
//         )}

//         <div className="text-center pt-8">
//           <div className="inline-block px-12 py-6 bg-slate-900 text-white rounded-full shadow-xl">
//             <p className="font-black italic tracking-tight" style={headingStyle}>
//               "{report.generalFeedback.closingMotivation}"
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Official Footer */}
//       <div className="mt-20 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-t-2 border-slate-900 pt-8">
//         <div className="flex items-center gap-6">
//           <span>Digital Transcript</span>
//           <span className="text-red-300">|</span>
//           <span>ANATOMY GURU AUTHENTICATED</span>
//         </div>
//         <div className="text-slate-900 font-bold">VERIFIED © 2025</div>
//       </div>
//     </div>
//   );
// };

// export default FeedbackReport;
