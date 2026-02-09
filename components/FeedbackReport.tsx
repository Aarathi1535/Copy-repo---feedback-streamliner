
import React from 'react';

// Using a partial mock to match the dynamic structure
interface FeedbackReportProps {
  report: any;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({ report }) => {
  return (
    <div className="max-w-[850px] mx-auto my-10 bg-white shadow-none rounded-none border border-slate-300 report-container p-4 sm:p-8 font-serif text-[#1e1e1e]">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-1">
             <div className="relative">
                {/* SVG Mock of the Logo in the image */}
                <svg width="40" height="40" viewBox="0 0 100 100" className="opacity-90">
                  <path d="M20,80 L80,80 L50,20 Z" fill="#333" />
                  <rect x="35" y="80" width="30" height="10" fill="#333" />
                </svg>
             </div>
             <div className="text-left">
                <h1 className="text-3xl font-black tracking-tight text-[#1e1e1e] leading-none">ANATOMY GURU</h1>
                <p className="text-[11px] italic text-slate-500 font-bold">Nothing Left Undissected !!</p>
             </div>
          </div>
          <div className="w-48 h-[2px] bg-[#333] mb-4"></div>
        </div>

        <h2 className="text-lg font-bold text-red-600 underline uppercase tracking-wide mb-1">
          {report.testTitle || 'General Medicine Test-5'}
        </h2>
        <p className="text-sm font-bold text-slate-800 px-10 leading-snug">
          Topics: {report.testTopics || 'Gastroenterology + Hepatobiliary System + Pancreas + Kidney + Fluid & Electrolyte Disturbances'}
        </p>
        <p className="text-sm font-bold text-blue-700 mt-1">
          Date: {report.testDate || '05/02/2026'}
        </p>
      </div>

      {/* Student Details Section */}
      <div className="mb-2">
        <span className="text-red-600 font-bold text-base">Student Name: </span>
        <span className="text-[#333] font-bold text-base border-b border-red-300">{report.studentName}</span>
      </div>

      {/* Evaluation Table */}
      <div className="border border-slate-400 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-400">
              <th className="w-[10%] p-2 border-r border-slate-400 text-red-600 font-bold text-sm text-center">Q No</th>
              <th className="w-[75%] p-2 border-r border-slate-400 text-red-600 font-bold text-sm text-center">Feedback</th>
              <th className="w-[15%] p-2 text-red-600 font-bold text-sm text-center">Marks</th>
            </tr>
          </thead>
          <tbody>
            {report.questions.map((q: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-400 last:border-0">
                <td className="p-3 border-r border-slate-400 text-center font-bold text-sm align-top">{q.qNo}</td>
                <td className="p-3 border-r border-slate-400 align-top">
                  <ul className="list-disc pl-5 space-y-1">
                    {q.feedbackPoints?.map((point: string, pIdx: number) => (
                      <li key={pIdx} className="text-[13px] leading-tight text-slate-800">
                        {point}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-3 text-center font-bold text-sm align-top">{q.marks}</td>
              </tr>
            </tbody>
          </table>
      </div>

      {/* Overall Score Section (Footer of page 1/matching image style) */}
      <div className="flex justify-between items-end mt-4 text-[11px] text-slate-500 font-bold uppercase">
        <div>Anatomy Guru Evaluate v4.0</div>
        <div className="text-right">Page 1 of 1</div>
      </div>

      {/* Extra Action Points Section (Optional second page look) */}
      {report.generalFeedback?.actionPoints?.length > 0 && (
        <div className="mt-12 pt-8 border-t border-dashed border-slate-300 no-print">
          <h3 className="text-red-600 font-black text-sm uppercase tracking-widest mb-4">Strategic Action Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {report.generalFeedback.actionPoints.map((item: string, i: number) => (
               <div key={i} className="bg-slate-50 p-3 rounded border border-slate-100 text-[12px] font-medium italic">
                 "{item}"
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackReport;
