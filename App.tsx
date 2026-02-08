
import React, { useState, useEffect } from 'react';
import { generateStructuredFeedback } from './services/geminiService';
import { EvaluationReport, FileData } from './types';
import FileUploader from './components/FileUploader';
import FeedbackReport from './components/FeedbackReport';
// @ts-ignore
import mammoth from 'mammoth';

const App: React.FC = () => {
  const [sourceDoc, setSourceDoc] = useState<File | null>(null);
  const [dirtyFeedbackDoc, setDirtyFeedbackDoc] = useState<File | null>(null);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'report'>('dashboard');

  useEffect(() => {
    if (report) setView('report');
  }, [report]);

  const processFile = async (file: File): Promise<FileData> => {
    const isDocx = file.name.toLowerCase().endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (isDocx) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return {
        text: result.value,
        name: file.name,
        isDocx: true
      };
    } else {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
      });
      return {
        base64,
        mimeType: file.type,
        name: file.name,
        isDocx: false
      };
    }
  };

  const handleAnalyze = async () => {
    if (!sourceDoc || !dirtyFeedbackDoc) {
      setError("Document verification failed. Please ensure both files are uploaded.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sourceData = await processFile(sourceDoc);
      const feedbackData = await processFile(dirtyFeedbackDoc);

      const result = await generateStructuredFeedback(sourceData, feedbackData);
      setReport(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Engine Error: Could not parse medical context. If using complex Word formatting, try PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (sourceDoc) {
      const originalTitle = document.title;
      const fileNameWithoutExt = sourceDoc.name.replace(/\.[^/.]+$/, "");
      document.title = `Evaluation_${fileNameWithoutExt}`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 500);
    } else {
      window.print();
    }
  };

  const renderDashboard = () => (
    <div className="max-w-5xl mx-auto px-4 mt-12 animate-fade-in pb-20">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
          Dissection <span className="gradient-text">Center</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Upload your medical exam source documents and manual evaluator notes to generate a gold-standard feedback report.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 h-full">
        <FileUploader
          label="Source Document"
          description="QP + Key + Student Answers (PDF, Docx, or Images)"
          onFileSelect={setSourceDoc}
          selectedFile={sourceDoc}
          icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
        />
        <FileUploader
          label="Evaluator's Notes"
          description="Messy feedback & marks (PDF, Docx, or Images)"
          onFileSelect={setDirtyFeedbackDoc}
          selectedFile={dirtyFeedbackDoc}
          icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>}
        />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-6 rounded-2xl mb-8 text-sm flex items-center gap-4 animate-shake">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
          </div>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={isLoading || !sourceDoc || !dirtyFeedbackDoc}
        className={`w-full py-6 rounded-2xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
          isLoading 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
          : 'bg-slate-900 hover:bg-slate-800 text-white hover:-translate-y-1'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-4">
            <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="animate-pulse">Synthesizing Feedback...</span>
          </div>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Generate Structured Report
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 no-print h-20">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setReport(null);
              setView('dashboard');
            }}
          >
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:rotate-6 transition-transform">A</div>
            <div>
              <span className="brand-font text-2xl font-black tracking-tighter text-slate-900 block leading-none">AnatomyGuru</span>
              <span className="text-[10px] uppercase font-black text-blue-600 tracking-widest leading-none">Evaluation Suite</span>
            </div>
          </div>
          
          {view === 'report' && report && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const content = `Evaluation Report: ${report.studentName}\nScore: ${report.totalScore}/${report.maxScore}\n\nQuestions:\n` + 
                    report.questions.map(q => `${q.qNo}: ${q.feedback} (${q.marks}/${q.maxMarks})`).join('\n') +
                    `\n\nOverall Performance: ${report.generalFeedback.overallPerformance}`;
                  navigator.clipboard.writeText(content);
                  alert("Report Content Copied! Ready to paste into Word.");
                }}
                className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors hidden md:flex items-center gap-2 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Copy for Word
              </button>
              <button 
                onClick={handleExportPDF}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Export PDF
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4">
        {view === 'dashboard' && renderDashboard()}
        {view === 'report' && report && (
          <div className="relative animate-fade-in-up">
            <div className="no-print mt-8 flex justify-center">
              <button 
                onClick={() => setView('dashboard')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 px-6 py-2 rounded-full flex items-center gap-2 font-bold text-sm transition-all border border-slate-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                New Analysis
              </button>
            </div>
            <FeedbackReport report={report} />
          </div>
        )}
      </main>

      <div className="fixed top-0 right-0 -z-10 opacity-5 pointer-events-none no-print overflow-hidden w-full h-full">
        <svg className="absolute -right-20 -top-20 animate-float" width="600" height="600" viewBox="0 0 400 400">
           <circle cx="200" cy="200" r="180" stroke="black" strokeWidth="1" fill="none" strokeDasharray="10 10" />
           <path d="M100,50 Q150,0 200,50 T300,50" stroke="black" fill="none" />
        </svg>
      </div>
    </div>
  );
};

export default App;
