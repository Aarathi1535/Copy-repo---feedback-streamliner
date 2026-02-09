
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
    
    // Logic for "Unattempted"
    if (marks === 0 || feedbackText.includes('not attempted') || feedbackText.includes('skipped')) {
      return 'unattempted';
    }
    
    // Logic for "Correct/Excellent"
    if (feedbackText.includes('excellent') || feedbackText.includes('perfect') || feedbackText.includes('precise') || feedbackText.includes('correct')) {
      return 'correct';
    }
    
    return 'partial';
  };

  return (
    <div className="max-w-[850px] mx-auto my-10 bg-white shadow-none rounded-none border border-slate-300 report-container p-6 sm:p-12 font-sans text-[#1e1e1e]">
      
      {/* Brand Header - Matching Logo recreation from screenshot */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center gap-4">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Logo Recreation */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              <path d="M50 25 C35 25 25 35 25 50 C25 65 35 75 40 80 V88 H60 V80 C65 75 75 65 75 50 C75 35 65 25 50 25 Z" fill="#f8fafc" stroke="#1e1e1e" strokeWidth="2.5"/>
              <circle cx="40" cy="50" r="7" fill="#1e1e1e" />
              <circle cx="60" cy="50" r="7" fill="#1e1e1e" />
              <path d="M47 62 L50 58 L53 62 Z" fill="#1e1e1e" />
              <path d="M15 45 L50 30 L85 45 L50 60 Z" fill="#1e1e1e" />
              <path d="M85 45 V55" stroke="#f59e0b" strokeWidth="2.5" />
              <circle cx="85" cy="55" r="3" fill="#f59e0b" />
            </svg>
          </div>
          
          <div className="text-left border-l-2 border-slate-900 pl-6 py-1">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none mb-1">
              ANATOMY <span className="text-orange-500 uppercase">Guru</span><span className="text-[10px] align-top ml-0.5 font-bold">®</span>
            </h1>
            <p className="text-[14px] italic text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">Nothing Left Undissected !!</p>
            {/* Scalpel Stylized Line */}
            <div className="mt-1 h-[2px] w-48 bg-slate-900 relative">
               <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-3 bg-white flex items-center justify-center">
                  <svg viewBox="0 0 24 12" className="w-full h-full"><path d="M0 6 L18 6 L24 0 L18 12 L0 6 Z" fill="#1e1e1e" /></svg>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Metadata (Centered as in screenshot) */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-red-600 uppercase tracking-widest border-b border-red-100 pb-1 inline-block mb-3">
          {report.testTitle || 'General Medicine Test'}
        </h2>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800">Topics: {report.testTopics}</p>
          <p className="text-[12px] font-black text-blue-800 uppercase tracking-widest">Date: {report.testDate}</p>
        </div>
      </div>

      {/* Student Identification Row */}
      <div className="mb-4 flex items-center gap-2 border-t pt-4 border-slate-100">
        <span className="text-red-600 font-black text-sm uppercase tracking-wide">Student Name:</span>
        <span className="text-sm font-black text-slate-900 underline underline-offset-4 decoration-2 decoration-red-600/30">{report.studentName}</span>
      </div>

      {/* Assessment Table - Matching Tabular Screenshot Format */}
      <div className="border border-slate-400 overflow-hidden mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-400 bg-white">
              <th className="w-[10%] p-2 border-r border-slate-400 text-red-600 font-black text-[13px] uppercase tracking-wide text-center">Q No</th>
              <th className="w-[75%] p-2 border-r border-slate-400 text-red-600 font-black text-[13px] uppercase tracking-wide text-center">Feedback</th>
              <th className="w-[15%] p-2 text-red-600 font-black text-[13px] uppercase tracking-wide text-center">Marks</th>
            </tr>
          </thead>
          <tbody>
            {report.questions?.map((q, idx) => {
              const status = getQuestionStatus(q);
              return (
                <tr key={idx} className={`border-b border-slate-300 ${
                  status === 'unattempted' ? 'bg-red-50' : 
                  status === 'correct' ? 'bg-emerald-50' : 
                  ''
                }`}>
                  <td className="p-2 border-r border-slate-400 text-center font-bold text-sm text-slate-800 align-top">{q.qNo}</td>
                  <td className="p-3 border-r border-slate-400 align-top">
                    <ul className="space-y-1">
                      {q.feedbackPoints?.map((point, pIdx) => (
                        <li key={pIdx} className="flex gap-2 items-start text-xs font-semibold leading-relaxed">
                          <span className="mt-1.5 w-1 h-1 rounded-full shrink-0 bg-slate-900"></span>
                          <span className={status === 'unattempted' ? 'text-red-700 font-black italic' : 'text-slate-800'}>
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className={`p-2 text-center font-bold text-sm align-top ${
                    status === 'unattempted' ? 'text-red-600' : 
                    status === 'correct' ? 'text-emerald-700' : 
                    'text-slate-800'
                  }`}>
                    {q.marks}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-slate-50 border-t border-slate-400">
              <td colSpan={2} className="p-3 border-r border-slate-400 text-right font-black uppercase tracking-widest text-[10px] text-slate-500">
                Total Score Summation
              </td>
              <td className="p-3 text-center text-lg font-black text-red-600 bg-white">
                {calculatedSum} / {report.maxScore || 100}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comprehensive Overall Feedback - Preserving Detail */}
      <div className="mt-12 space-y-10 no-print">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-5 w-1.5 bg-red-600"></div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Master Review</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">MCQ Trends</h4>
              <p className="text-[12px] font-bold text-slate-700 italic">"{report.generalFeedback.sectionAnalysis.mcqs}"</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Short Answers</h4>
              <p className="text-[12px] font-bold text-slate-700 italic">"{report.generalFeedback.sectionAnalysis.shortAnswers}"</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Long Essays</h4>
              <p className="text-[12px] font-bold text-slate-700 italic">"{report.generalFeedback.sectionAnalysis.longEssays}"</p>
            </div>
          </div>

          <p className="text-base leading-relaxed text-slate-800 font-bold mb-8 bg-yellow-50 p-6 border-l-4 border-yellow-400 italic">
            "{report.generalFeedback.overallPerformance}"
          </p>
        </section>

        {/* Strengths & Knowledge Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-emerald-50/30 rounded-xl border border-emerald-100">
            <h4 className="text-emerald-700 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
               Core Strengths
            </h4>
            <ul className="space-y-3">
              {report.generalFeedback.strengths.map((s, i) => (
                <li key={i} className="text-[13px] font-bold text-slate-700 flex gap-2">
                  <span className="text-emerald-500">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-rose-50/30 rounded-xl border border-rose-100">
            <h4 className="text-rose-700 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
               Knowledge Gaps
            </h4>
            <ul className="space-y-3">
              {report.generalFeedback.weaknesses.map((w, i) => (
                <li key={i} className="text-[13px] font-bold text-slate-700 flex gap-2">
                  <span className="text-rose-400">•</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Unattempted Advice Recovery */}
        {report.generalFeedback.unattemptedAdvice.length > 0 && (
          <section className="bg-red-50 p-6 border border-red-100 rounded-xl">
            <h4 className="text-red-700 font-black text-[10px] uppercase tracking-widest mb-4">Strategic Advice for Skipped Items</h4>
            <div className="space-y-4">
              {report.generalFeedback.unattemptedAdvice.map((item, i) => (
                <div key={i} className="flex flex-col gap-1 border-b border-red-100 pb-3 last:border-0">
                  <span className="text-[10px] font-black text-red-600">Q.{item.qNo} Gap Recovery</span>
                  <p className="text-[13px] font-bold text-slate-800 italic leading-snug">"{item.advice}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="text-center pt-8">
          <div className="inline-block px-12 py-6 bg-slate-900 text-white rounded-full shadow-xl">
            <p className="text-xl font-black italic tracking-tight">
              "{report.generalFeedback.closingMotivation}"
            </p>
          </div>
        </div>
      </div>

      {/* Official Verification Footer */}
      <div className="mt-20 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-t-2 border-slate-900 pt-8">
        <div className="flex items-center gap-6">
          <span>Digital Authenticated Report</span>
          <span className="text-red-300">|</span>
          <span>ANATOMY GURU INTELLIGENCE</span>
        </div>
        <div className="text-slate-900 font-bold">VERIFIED ASSESSMENT © 2025</div>
      </div>
    </div>
  );
};

export default FeedbackReport;
