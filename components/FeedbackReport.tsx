
import React from 'react';

interface FeedbackReportProps {
  report: any;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({ report }) => {
  const calculatedSum = report.questions?.reduce((acc: number, q: any) => acc + (Number(q.marks) || 0), 0) || 0;

  // Helper to determine question row status for coloring
  const getQuestionStatus = (q: any) => {
    const marks = Number(q.marks) || 0;
    const feedbackText = q.feedbackPoints?.join(' ').toLowerCase() || '';
    
    if (marks === 0 || feedbackText.includes('not attempted') || feedbackText.includes('skipped')) {
      return 'unattempted';
    }
    
    // Simple heuristic for "correct" - if marks are > 80% of typical max (assume 5 or 10 if not provided)
    // or if feedback contains keywords
    if (feedbackText.includes('perfect') || feedbackText.includes('correct') || feedbackText.includes('excellent')) {
      return 'correct';
    }
    
    return 'partial';
  };

  return (
    <div className="max-w-[850px] mx-auto my-10 bg-white shadow-none rounded-none border border-slate-300 report-container p-4 sm:p-10 font-serif text-[#1e1e1e]">
      {/* Brand Header - Matching Logo Design */}
      <div className="text-center mb-10">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-6 mb-4">
             <div className="relative w-24 h-24 flex items-center justify-center">
                {/* SVG Recreation of Logo Visual Identity: Skull + Mortarboard + Scalpel concepts */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Skull concept */}
                  <path d="M50 15 C30 15 20 25 20 45 C20 60 30 70 35 75 L35 85 L65 85 L65 75 C70 70 80 60 80 45 C80 25 70 15 50 15 Z" fill="#f1f5f9" stroke="#1e1e1e" strokeWidth="2.5"/>
                  <circle cx="35" cy="45" r="7" fill="#1e1e1e" />
                  <circle cx="65" cy="45" r="7" fill="#1e1e1e" />
                  <path d="M45 60 L55 60" stroke="#1e1e1e" strokeWidth="3" strokeLinecap="round" />
                  {/* Mortarboard */}
                  <path d="M15 40 L50 25 L85 40 L50 55 Z" fill="#1e1e1e" />
                  <path d="M35 50 V60 C35 60 50 65 65 60 V50" fill="none" stroke="#1e1e1e" strokeWidth="2" />
                  {/* Tassel */}
                  <path d="M85 40 V55" stroke="#f59e0b" strokeWidth="2" />
                  <circle cx="85" cy="55" r="3" fill="#f59e0b" />
                </svg>
             </div>
             <div className="text-left border-l-[3px] border-[#1e1e1e] pl-6 py-1">
                <h1 className="text-5xl font-black tracking-tighter text-[#1e1e1e] leading-none mb-1">ANATOMY GURU</h1>
                <p className="text-[14px] italic text-slate-600 font-bold uppercase tracking-[0.2em]">Nothing Left Undissected !!</p>
             </div>
          </div>
          {/* Scalpel Stylized Divider */}
          <div className="w-full h-[3px] bg-slate-200 relative mb-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-2 bg-white flex items-center justify-center">
               <svg width="200" height="20" viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 10 H160 L195 5 L160 15 H5 Z" fill="#1e1e1e" />
                  <circle cx="20" cy="10" r="2" fill="white" />
               </svg>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-red-600 underline uppercase tracking-widest mb-2 mt-4">
          {report.testTitle || 'Evaluation Report'}
        </h2>
        <div className="max-w-[600px] mx-auto mb-6">
          <p className="text-sm font-bold text-slate-800 leading-tight mb-2">
            Subject/Topics: {report.testTopics}
          </p>
          <p className="text-sm font-black text-blue-700 uppercase tracking-widest">
            {report.testDate}
          </p>
        </div>
      </div>

      {/* Summary Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-stretch gap-4 border-b-2 border-slate-900 pb-6">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-600 font-black uppercase text-xs tracking-widest">Candidate Name</span>
          </div>
          <span className="text-2xl font-black text-[#1e1e1e] border-b-2 border-red-600 px-1">{report.studentName}</span>
        </div>
        
        <div className="bg-slate-900 text-white p-4 rounded-lg flex items-center gap-6 shadow-xl">
          <div className="text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Marks Scored</div>
            <div className="text-3xl font-black text-white leading-none">{calculatedSum}</div>
          </div>
          <div className="w-[1px] h-10 bg-slate-700"></div>
          <div className="text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Possible</div>
            <div className="text-3xl font-black text-slate-300 leading-none">{report.maxScore || report.totalScore || 100}</div>
          </div>
        </div>
      </div>

      {/* Evaluation Table */}
      <div className="border-2 border-slate-800 mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800 bg-slate-100">
              <th className="w-[12%] p-3 border-r-2 border-slate-800 text-slate-900 font-black text-sm uppercase tracking-widest">Q.No</th>
              <th className="w-[73%] p-3 border-r-2 border-slate-800 text-slate-900 font-black text-sm uppercase tracking-widest">Feedback & Knowledge Gap Analysis</th>
              <th className="w-[15%] p-3 text-slate-900 font-black text-sm uppercase tracking-widest">Marks</th>
            </tr>
          </thead>
          <tbody>
            {report.questions?.map((q: any, idx: number) => {
              const status = getQuestionStatus(q);
              return (
                <tr key={idx} className={`border-b border-slate-300 ${status === 'unattempted' ? 'bg-red-50' : status === 'correct' ? 'bg-emerald-50' : ''}`}>
                  <td className="p-4 border-r-2 border-slate-800 text-center font-black text-lg align-top">{q.qNo}</td>
                  <td className="p-4 border-r-2 border-slate-800 align-top">
                    <ul className="space-y-3">
                      {q.feedbackPoints?.map((point: string, pIdx: number) => {
                        const isPositive = point.toLowerCase().includes('good') || point.toLowerCase().includes('correct') || point.toLowerCase().includes('excellent') || point.toLowerCase().includes('strength');
                        return (
                          <li key={pIdx} className="flex gap-2">
                            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isPositive ? 'bg-emerald-600' : status === 'unattempted' ? 'bg-red-600' : 'bg-slate-400'}`}></span>
                            <span className={`text-[14px] leading-tight font-medium ${isPositive ? 'text-emerald-800' : status === 'unattempted' ? 'text-red-700 font-bold' : 'text-slate-900'}`}>
                              {point}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                  <td className={`p-4 text-center font-black text-xl align-top ${status === 'unattempted' ? 'text-red-600' : status === 'correct' ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {q.marks}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-slate-900 text-white font-black">
              <td colSpan={2} className="p-4 border-r-2 border-slate-800 text-right uppercase tracking-[0.2em] text-sm">
                Final Summation of Credits
              </td>
              <td className="p-4 text-center text-2xl text-red-500">
                {calculatedSum}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* General Overall Feedback Section - At bottom as requested */}
      <div className="mt-12 space-y-8">
        <section className="border-l-4 border-red-600 pl-6 py-2">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-4">Overall Performance Analysis</h3>
          <p className="text-[15px] leading-relaxed text-slate-800 font-medium italic">
            "{report.generalFeedback?.overallPerformance || 'Evaluation complete. See action points for specific medical knowledge reinforcement.'}"
          </p>
        </section>

        {report.generalFeedback?.actionPoints?.length > 0 && (
          <section className="bg-slate-50 border-2 border-slate-200 p-8 rounded-2xl print:border-slate-800">
            <h3 className="text-red-600 font-black text-sm uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              Clinical Knowledge Reinforcement Plan
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
               {report.generalFeedback.actionPoints.map((item: string, i: number) => (
                 <li key={i} className="flex gap-3 text-[14px] font-bold text-slate-800">
                   <span className="text-red-600 text-lg">›</span> 
                   <span className="border-b border-slate-200 w-full pb-1">{item}</span>
                 </li>
               ))}
            </ul>
          </section>
        )}
      </div>

      {/* Official Footer */}
      <div className="mt-16 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-t border-slate-100 pt-6">
        <div className="flex items-center gap-6">
          <span>Official Evaluation Report</span>
          <span className="text-red-300">|</span>
          <span>Verified Anatomy Guru Suite</span>
        </div>
        <div className="text-slate-300">Anatomy Guru © 2025</div>
      </div>
    </div>
  );
};

export default FeedbackReport;
