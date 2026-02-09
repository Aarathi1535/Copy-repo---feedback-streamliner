
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

  return (
    <div className="max-w-[850px] mx-auto my-10 bg-white shadow-none rounded-none border border-slate-300 report-container p-6 sm:p-12 text-[#1e1e1e]" style={reportStyle}>
      
      {/* Brand Header - Precise SVG recreation of the uploaded logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Logo Recreation of the Skull & Cap */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* The Skull (Left side of the image) */}
              <path d="M40 30 C25 30 15 40 15 55 C15 70 25 80 30 85 V93 H50 V85 C55 80 65 70 65 55 C65 40 55 30 40 30 Z" fill="#f8fafc" stroke="#1e1e1e" strokeWidth="1.5"/>
              <circle cx="32" cy="55" r="5" fill="#1e1e1e" />
              <circle cx="48" cy="55" r="5" fill="#1e1e1e" />
              <path d="M38 68 L40 65 L42 68 Z" fill="#1e1e1e" />
              <path d="M32 75 Q40 78 48 75" fill="none" stroke="#1e1e1e" strokeWidth="1" />
              
              {/* Graduation Cap on Skull */}
              <path d="M12 48 L40 32 L68 48 L40 64 Z" fill="#1e1e1e" />
              <path d="M25 55 V62 C25 62 40 66 55 62 V55" fill="#1e1e1e" />
              <path d="M68 48 V62" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="68" cy="62" r="3" fill="#f59e0b" />
            </svg>
          </div>
          
          <div className="text-left border-l-2 border-slate-900 pl-6">
            <div className="flex items-end gap-1 mb-1 leading-none">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900">
                ANATOMY <span className="text-orange-500">GURU</span>
              </h1>
              <span className="text-xs font-bold align-top ml-1">®</span>
            </div>
            <p className="text-[16px] italic text-slate-600 font-bold mb-2">Nothing Left Undissected !!</p>
            {/* Scalpel Stylized Handle */}
            <div className="w-64 h-6">
              <svg viewBox="0 0 200 20" className="w-full h-full">
                <path d="M0 10 H150 L190 4 L155 16 H0 Z" fill="#1e1e1e" />
                <circle cx="15" cy="10" r="2" fill="white" />
                <rect x="80" y="8" width="40" height="4" fill="white" opacity="0.3" rx="1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="text-center mb-6">
        <h2 className="font-black text-red-600 uppercase tracking-widest border-b border-red-100 pb-1 inline-block mb-3" style={{ fontSize: '16px' }}>
          {report.testTitle || 'General Medicine Test'}
        </h2>
        <div className="space-y-1" style={{ fontSize: '14px' }}>
          <p className="font-bold text-slate-800">Topics: {report.testTopics}</p>
          <p className="font-black text-blue-800 uppercase tracking-widest">Date: {report.testDate}</p>
        </div>
      </div>

      {/* Student Identification */}
      <div className="mb-4 flex items-center gap-2 border-t pt-4 border-slate-100" style={{ fontSize: '14px' }}>
        <span className="text-red-600 font-black uppercase tracking-wide">Student Name:</span>
        <span className="font-black text-slate-900 underline underline-offset-4 decoration-2 decoration-red-600/30">{report.studentName}</span>
      </div>

      {/* Assessment Table */}
      <div className="border border-slate-400 overflow-hidden mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-400 bg-white">
              <th className="w-[10%] p-2 border-r border-slate-400 text-red-600 font-black uppercase tracking-wide text-center" style={{ fontSize: '16px' }}>Q No</th>
              <th className="w-[75%] p-2 border-r border-slate-400 text-red-600 font-black uppercase tracking-wide text-center" style={{ fontSize: '16px' }}>Feedback</th>
              <th className="w-[15%] p-2 text-red-600 font-black uppercase tracking-wide text-center" style={{ fontSize: '16px' }}>Marks</th>
            </tr>
          </thead>
          <tbody>
            {report.questions?.map((q, idx) => {
              const status = getQuestionStatus(q);
              return (
                <tr key={idx} className={`border-b border-slate-300 ${status === 'unattempted' ? 'bg-red-50' : status === 'correct' ? 'bg-emerald-50' : ''}`}>
                  <td className="p-2 border-r border-slate-400 text-center font-bold text-slate-800 align-top" style={{ fontSize: '14px' }}>{q.qNo}</td>
                  <td className="p-3 border-r border-slate-400 align-top">
                    {/* Bullet Points for Feedback */}
                    <ul className="list-disc list-outside ml-4 space-y-1" style={{ fontSize: '14px' }}>
                      {q.feedbackPoints?.map((point, pIdx) => (
                        <li key={pIdx} className={`font-semibold leading-relaxed ${status === 'unattempted' ? 'text-red-700 font-black italic' : 'text-slate-800'}`}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className={`p-2 text-center font-bold align-top ${status === 'unattempted' ? 'text-red-600' : status === 'correct' ? 'text-emerald-700' : 'text-slate-800'}`} style={{ fontSize: '14px' }}>
                    {q.marks}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-slate-50 border-t border-slate-400">
              <td colSpan={2} className="p-3 border-r border-slate-400 text-right font-black uppercase tracking-widest text-slate-500" style={{ fontSize: '14px' }}>
                Total Score Summation
              </td>
              <td className="p-3 text-center font-black text-red-600 bg-white" style={{ fontSize: '16px' }}>
                {calculatedSum} / {report.maxScore || 100}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* General Feedback Section */}
      <div className="mt-12 space-y-10 no-print">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-5 w-1.5 bg-red-600"></div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest" style={{ fontSize: '16px' }}>General Feedback</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-black text-blue-600 uppercase tracking-widest mb-2" style={{ fontSize: '16px' }}>MCQ Trends</h4>
              <p className="font-bold text-slate-700 italic" style={{ fontSize: '14px' }}>"{report.generalFeedback.sectionAnalysis.mcqs}"</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-black text-emerald-600 uppercase tracking-widest mb-2" style={{ fontSize: '16px' }}>Short Answers</h4>
              <p className="font-bold text-slate-700 italic" style={{ fontSize: '14px' }}>"{report.generalFeedback.sectionAnalysis.shortAnswers}"</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-black text-purple-600 uppercase tracking-widest mb-2" style={{ fontSize: '16px' }}>Long Essays</h4>
              <p className="font-bold text-slate-700 italic" style={{ fontSize: '14px' }}>"{report.generalFeedback.sectionAnalysis.longEssays}"</p>
            </div>
          </div>

          <p className="leading-relaxed text-slate-800 font-bold mb-8 bg-yellow-50 p-6 border-l-4 border-yellow-400 italic" style={{ fontSize: '14px' }}>
            "{report.generalFeedback.overallPerformance}"
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-emerald-50/30 rounded-xl border border-emerald-100">
            <h4 className="text-emerald-700 font-black uppercase tracking-widest mb-4" style={{ fontSize: '16px' }}>Core Strengths</h4>
            <ul className="list-disc list-outside ml-4 space-y-3" style={{ fontSize: '14px' }}>
              {report.generalFeedback.strengths.map((s, i) => (
                <li key={i} className="font-bold text-slate-700">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-rose-50/30 rounded-xl border border-rose-100">
            <h4 className="text-rose-700 font-black uppercase tracking-widest mb-4" style={{ fontSize: '16px' }}>Knowledge Gaps</h4>
            <ul className="list-disc list-outside ml-4 space-y-3" style={{ fontSize: '14px' }}>
              {report.generalFeedback.weaknesses.map((w, i) => (
                <li key={i} className="font-bold text-slate-700">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Points for Improving Shortcomings */}
        <section className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
           <h4 className="text-orange-400 font-black uppercase tracking-widest mb-4" style={{ fontSize: '16px' }}>Identified Habits & Trends</h4>
           <ul className="list-disc list-outside ml-4 space-y-2" style={{ fontSize: '14px' }}>
              {report.generalFeedback.repeatingTrends.map((trend, i) => (
                <li key={i} className="text-slate-300 font-medium">{trend}</li>
              ))}
           </ul>
        </section>

        {/* Unattempted Advice Recovery */}
        {report.generalFeedback.unattemptedAdvice.length > 0 && (
          <section className="bg-red-50 p-6 border border-red-100 rounded-xl">
            <h4 className="text-red-700 font-black uppercase tracking-widest mb-4" style={{ fontSize: '16px' }}>Gap Recovery Plan</h4>
            <div className="space-y-4">
              {report.generalFeedback.unattemptedAdvice.map((item, i) => (
                <div key={i} className="flex flex-col gap-1 border-b border-red-100 pb-3 last:border-0">
                  <span className="font-black text-red-600 uppercase" style={{ fontSize: '14px' }}>Q.{item.qNo} Recovery</span>
                  <p className="font-bold text-slate-800 italic leading-snug" style={{ fontSize: '14px' }}>"{item.advice}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="text-center pt-8">
          <div className="inline-block px-12 py-6 bg-slate-900 text-white rounded-full shadow-xl">
            <p className="font-black italic tracking-tight" style={{ fontSize: '16px' }}>
              "{report.generalFeedback.closingMotivation}"
            </p>
          </div>
        </div>
      </div>

      {/* Official Footer */}
      <div className="mt-20 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-t-2 border-slate-900 pt-8">
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
