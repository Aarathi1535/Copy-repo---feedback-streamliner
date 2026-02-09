
import React from 'react';

interface FeedbackReportProps {
  report: any;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({ report }) => {
  return (
    <div className="max-w-[850px] mx-auto my-10 bg-white shadow-none rounded-none border border-slate-300 report-container p-4 sm:p-10 font-serif text-[#1e1e1e]">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4 mb-2">
             <div className="relative">
                {/* Simplified SVG representation of the Anatomy Guru Logo */}
                <svg width="60" height="60" viewBox="0 0 100 100" className="opacity-100">
                  <path d="M50,10 L80,30 L80,70 L50,90 L20,70 L20,30 Z" fill="none" stroke="#1e1e1e" strokeWidth="2" />
                  <path d="M50,20 L50,80 M20,50 L80,50" stroke="#1e1e1e" strokeWidth="1" />
                  <circle cx="50" cy="50" r="15" fill="#1e1e1e" />
                </svg>
             </div>
             <div className="text-left border-l-2 border-[#1e1e1e] pl-4">
                <h1 className="text-4xl font-black tracking-tighter text-[#1e1e1e] leading-none mb-1">ANATOMY GURU</h1>
                <p className="text-[12px] italic text-slate-600 font-bold uppercase tracking-widest">Nothing Left Undissected !!</p>
             </div>
          </div>
          <div className="w-64 h-[2px] bg-[#1e1e1e] mt-2 mb-6"></div>
        </div>

        <h2 className="text-xl font-bold text-red-600 underline uppercase tracking-widest mb-2">
          {report.testTitle || 'General Medicine Test-5'}
        </h2>
        <div className="max-w-[600px] mx-auto">
          <p className="text-sm font-bold text-slate-800 leading-tight mb-2">
            Topics: {report.testTopics}
          </p>
          <p className="text-sm font-bold text-blue-700">
            Date: {report.testDate}
          </p>
        </div>
      </div>

      {/* Student Details Section */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-red-600 font-black text-lg">Student Name: </span>
        <span className="text-[#1e1e1e] font-black text-lg border-b-2 border-red-600 px-2 min-w-[100px]">{report.studentName}</span>
      </div>

      {/* Evaluation Table */}
      <div className="border-2 border-slate-800 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800 bg-slate-50">
              <th className="w-[10%] p-3 border-r-2 border-slate-800 text-red-600 font-black text-base text-center">Q No</th>
              <th className="w-[75%] p-3 border-r-2 border-slate-800 text-red-600 font-black text-base text-center">Feedback</th>
              <th className="w-[15%] p-3 text-red-600 font-black text-base text-center">Marks</th>
            </tr>
          </thead>
          <tbody>
            {report.questions?.map((q: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-400 last:border-0">
                <td className="p-4 border-r-2 border-slate-800 text-center font-bold text-base align-top">{q.qNo}</td>
                <td className="p-4 border-r-2 border-slate-800 align-top">
                  <ul className="list-disc pl-6 space-y-2">
                    {q.feedbackPoints?.map((point: string, pIdx: number) => (
                      <li key={pIdx} className="text-[14px] leading-snug text-slate-900 font-medium">
                        {point}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-4 text-center font-bold text-base align-top">{q.marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Details */}
      <div className="mt-6 flex justify-between items-center text-[12px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-200 pt-4">
        <div className="flex items-center gap-4">
          <span>Anatomy Guru Evaluate v4.2</span>
          <span className="text-slate-300">|</span>
          <span>Verified Response Matrix</span>
        </div>
        <div>Page 1 of 1</div>
      </div>

      {/* Action Points for the Student */}
      {report.generalFeedback?.actionPoints?.length > 0 && (
        <div className="mt-10 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl no-print">
          <h3 className="text-red-600 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Strategic Improvement Plan
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {report.generalFeedback.actionPoints.map((item: string, i: number) => (
               <li key={i} className="flex gap-2 text-[13px] font-bold text-slate-700 italic">
                 <span className="text-red-500">•</span> {item}
               </li>
             ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FeedbackReport;
