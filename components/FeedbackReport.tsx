
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
    
    // Logic for "Correct/Excellent" - assume > 80% marks or specific keywords
    if (feedbackText.includes('excellent') || feedbackText.includes('perfect') || feedbackText.includes('precise') || feedbackText.includes('great')) {
      return 'correct';
    }
    
    return 'partial';
  };

  return (
    <div className="max-w-[900px] mx-auto my-10 bg-white shadow-2xl rounded-none border border-slate-300 report-container p-6 sm:p-12 font-serif text-[#1e1e1e]">
      {/* Brand Header */}
      <div className="text-center mb-12">
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center justify-center gap-8 mb-6">
             <div className="relative w-32 h-32 flex items-center justify-center">
                {/* SVG Logo Recreation */}
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                  <path d="M50 20 C32 20 22 30 22 50 C22 65 32 75 38 80 L38 88 L62 88 L62 80 C68 75 78 65 78 50 C78 30 68 20 50 20 Z" fill="#f8fafc" stroke="#1e1e1e" strokeWidth="2.5"/>
                  <circle cx="38" cy="50" r="8" fill="#1e1e1e" />
                  <circle cx="62" cy="50" r="8" fill="#1e1e1e" />
                  <path d="M47 62 L50 58 L53 62 Z" fill="#1e1e1e" />
                  <path d="M10 45 L50 28 L90 45 L50 62 Z" fill="#1e1e1e" />
                  <path d="M90 45 V60" stroke="#f59e0b" strokeWidth="3" />
                  <circle cx="90" cy="60" r="4" fill="#f59e0b" />
                </svg>
             </div>
             
             <div className="text-left border-l-4 border-slate-900 pl-8 py-2">
                <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-none mb-2">
                  ANATOMY <span className="text-orange-500 uppercase">Guru</span>
                </h1>
                <p className="text-[18px] italic text-slate-500 font-bold uppercase tracking-[0.3em]">Nothing Left Undissected !!</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-[3px] w-56 bg-slate-900 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-4 bg-white flex items-center justify-center">
                      <svg viewBox="0 0 24 12" className="w-full h-full"><path d="M0 6 L18 6 L24 0 L18 12 L0 6 Z" fill="#1e1e1e" /></svg>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <h2 className="text-3xl font-black text-red-600 underline uppercase tracking-[0.2em] mb-4 mt-8">
          {report.testTitle || 'Medical Assessment Feedback'}
        </h2>
        <div className="max-w-[700px] mx-auto space-y-1">
          <p className="text-base font-bold text-slate-700">Topic: {report.testTopics}</p>
          <p className="text-xs font-black text-blue-800 uppercase tracking-widest">{report.testDate}</p>
        </div>
      </div>

      {/* Candidate Score Profile */}
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-end gap-6 border-b-4 border-slate-900 pb-8">
        <div className="flex flex-col">
          <span className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-2">Candidate Record</span>
          <span className="text-4xl font-black text-slate-900 border-b-4 border-red-600 inline-block px-1">
            {report.studentName}
          </span>
        </div>
        
        <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center gap-10 shadow-2xl border-r-8 border-orange-500">
          <div className="text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Net Score</div>
            <div className="text-4xl font-black text-white leading-none">{calculatedSum}</div>
          </div>
          <div className="w-[1px] h-12 bg-slate-700"></div>
          <div className="text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Max Possible</div>
            <div className="text-4xl font-black text-slate-400 leading-none">{report.maxScore || 100}</div>
          </div>
        </div>
      </div>

      {/* Itemized Feedback Table */}
      <div className="border-4 border-slate-900 mb-12 overflow-hidden rounded-xl shadow-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-4 border-slate-900 bg-slate-100">
              <th className="w-[12%] p-5 border-r-4 border-slate-900 text-slate-900 font-black text-sm uppercase tracking-widest">Q.No</th>
              <th className="w-[73%] p-5 border-r-4 border-slate-900 text-slate-900 font-black text-sm uppercase tracking-widest">Feedback & Knowledge Gap Analysis</th>
              <th className="w-[15%] p-5 text-slate-900 font-black text-sm uppercase tracking-widest">Marks</th>
            </tr>
          </thead>
          <tbody>
            {report.questions?.map((q, idx) => {
              const status = getQuestionStatus(q);
              return (
                <tr key={idx} className={`border-b-2 border-slate-200 ${
                  status === 'unattempted' ? 'bg-red-50' : 
                  status === 'correct' ? 'bg-emerald-50' : 
                  ''
                }`}>
                  <td className="p-5 border-r-4 border-slate-900 text-center font-black text-xl align-top text-slate-800">{q.qNo}</td>
                  <td className="p-5 border-r-4 border-slate-900 align-top">
                    <ul className="space-y-4">
                      {q.feedbackPoints?.map((point, pIdx) => (
                        <li key={pIdx} className="flex gap-3 items-start">
                          <span className={`mt-2 w-2 h-2 rounded-full shrink-0 ${
                            status === 'unattempted' ? 'bg-red-600' : 
                            status === 'correct' ? 'bg-emerald-600' : 
                            'bg-slate-400'
                          }`}></span>
                          <span className={`text-[15px] leading-snug font-semibold ${
                            status === 'unattempted' ? 'text-red-700 font-black italic' : 
                            status === 'correct' ? 'text-emerald-800' : 
                            'text-slate-800'
                          }`}>
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className={`p-5 text-center font-black text-2xl align-top ${
                    status === 'unattempted' ? 'text-red-600' : 
                    status === 'correct' ? 'text-emerald-700' : 
                    'text-slate-900'
                  }`}>
                    {q.marks}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-slate-900 text-white font-black">
              <td colSpan={2} className="p-6 border-r-4 border-slate-800 text-right uppercase tracking-[0.3em] text-xs">
                Total Academic Credits Awarded
              </td>
              <td className="p-6 text-center text-3xl text-orange-400">
                {calculatedSum}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comprehensive General Overall Feedback */}
      <div className="mt-16 space-y-12">
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-2 bg-slate-900"></div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Comprehensive Review</h3>
          </div>
          
          {/* Sectional Performance Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-6 bg-blue-50/50 border-2 border-blue-100 rounded-xl">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">MCQ Trends</h4>
              <p className="text-[13px] font-bold text-blue-900 leading-relaxed italic">"{report.generalFeedback.sectionAnalysis.mcqs}"</p>
            </div>
            <div className="p-6 bg-emerald-50/50 border-2 border-emerald-100 rounded-xl">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Short Answers</h4>
              <p className="text-[13px] font-bold text-emerald-900 leading-relaxed italic">"{report.generalFeedback.sectionAnalysis.shortAnswers}"</p>
            </div>
            <div className="p-6 bg-purple-50/50 border-2 border-purple-100 rounded-xl">
              <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-3">Long Essays</h4>
              <p className="text-[13px] font-bold text-purple-900 leading-relaxed italic">"{report.generalFeedback.sectionAnalysis.longEssays}"</p>
            </div>
          </div>

          <p className="text-lg leading-relaxed text-slate-800 font-bold mb-10 bg-yellow-50 p-8 border-l-8 border-yellow-400 italic shadow-sm">
            "{report.generalFeedback.overallPerformance}"
          </p>
        </section>

        {/* Strengths & Weaknesses (repeating trends) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-emerald-50/30 p-8 rounded-2xl border-2 border-emerald-100">
            <h4 className="text-emerald-700 font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
              Strengths & Core Trends
            </h4>
            <ul className="space-y-4">
              {report.generalFeedback.strengths.map((s, i) => (
                <li key={i} className="flex gap-3 text-[14px] font-bold text-emerald-900 items-start">
                  <span className="text-emerald-500 mt-1">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-rose-50/30 p-8 rounded-2xl border-2 border-rose-100">
            <h4 className="text-rose-700 font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>
              Identified Knowledge Gaps
            </h4>
            <ul className="space-y-4">
              {report.generalFeedback.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-3 text-[14px] font-bold text-rose-900 items-start">
                  <span className="text-rose-400 mt-1">•</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Points for Improving Shortcomings */}
        <section className="bg-slate-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
           </div>
           <h4 className="text-orange-400 font-black text-xs uppercase tracking-[0.3em] mb-8">Strategic Recovery Plan</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {report.generalFeedback.repeatingTrends.map((trend, i) => (
                <div key={i} className="flex gap-4">
                   <span className="text-orange-500 font-black text-lg">{i+1}.</span>
                   <p className="text-[14px] font-medium text-slate-300 leading-snug">{trend}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Unattempted Recovery Analysis */}
        {report.generalFeedback.unattemptedAdvice.length > 0 && (
          <section className="bg-red-50 border-4 border-red-200 p-8 rounded-2xl">
            <h4 className="text-red-700 font-black text-lg uppercase tracking-widest mb-6 flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              Gap Recovery: Skipped Questions
            </h4>
            <div className="space-y-6">
              {report.generalFeedback.unattemptedAdvice.map((item, i) => (
                <div key={i} className="border-b border-red-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase">Q.{item.qNo} Recovery</span>
                  </div>
                  <p className="text-[14px] font-bold text-red-900 leading-relaxed italic">
                    "{item.advice}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Motivational Closing */}
        <section className="text-center pt-10 border-t-2 border-slate-100">
          <div className="inline-block px-12 py-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-full shadow-2xl hover:scale-105 transition-transform duration-500">
            <p className="text-2xl font-black italic tracking-tight">
              "{report.generalFeedback.closingMotivation}"
            </p>
          </div>
        </section>
      </div>

      {/* Official Footer */}
      <div className="mt-24 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] border-t-2 border-slate-900 pt-10">
        <div className="flex items-center gap-8">
          <span>Digital Transcript</span>
          <span className="text-red-300">|</span>
          <span>ANATOMY GURU AUTHENTICATED</span>
        </div>
        <div className="text-slate-900">VERIFIED © 2025</div>
      </div>
    </div>
  );
};

export default FeedbackReport;
