
import React, { useState, useEffect } from 'react';
import { generateStructuredFeedback } from './services/geminiService';
import { EvaluationReport, FileData } from './types';
import FileUploader from './components/FileUploader';
import FeedbackReport from './components/FeedbackReport';
// @ts-ignore
import mammoth from 'mammoth';
// @ts-ignore
import * as pdfjs from 'pdfjs-dist';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs';

const App: React.FC = () => {
  const [sourceDoc, setSourceDoc] = useState<File | null>(null);
  const [dirtyFeedbackDoc, setDirtyFeedbackDoc] = useState<File | null>(null);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'report'>('dashboard');

  useEffect(() => {
    if (report) setView('report');
  }, [report]);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }
    return fullText;
  };

  const processFile = async (file: File): Promise<FileData> => {
    const fileName = file.name.toLowerCase();
    const isDocx = fileName.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isPdf = fileName.endsWith('.pdf') || file.type === 'application/pdf';
    
    if (isDocx) {
      setLoadingStep(`Extracting text from Word doc: ${file.name}`);
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return { text: result.value, name: file.name, isDocx: true };
    } 
    
    if (isPdf) {
      setLoadingStep(`Checking PDF for text layer: ${file.name}`);
      try {
        const text = await extractTextFromPDF(file);
        // If we extracted a decent amount of text, send text instead of image
        if (text.trim().length > 100) {
          return { text, name: file.name, isDocx: false };
        }
      } catch (e) {
        console.warn("PDF text extraction failed, falling back to Vision", e);
      }
    }

    // Fallback for Scanned PDFs or Images
    setLoadingStep(`Processing visual data for: ${file.name}`);
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
  };

  const handleAnalyze = async () => {
    if (!sourceDoc || !dirtyFeedbackDoc) {
      setError("Both the 'Source Document' and 'Faculty Notes' are required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sourceData = await processFile(sourceDoc);
      const feedbackData = await processFile(dirtyFeedbackDoc);

      setLoadingStep("AI evaluating 100-mark paper... this may take 20-30 seconds.");
      const result = await generateStructuredFeedback(sourceData, feedbackData);
      setReport(result);
    } catch (err: any) {
      console.error("Analysis Failure:", err);
      if (err.message.includes("413")) {
        setError("Payload Too Large: These files exceed the 6MB Netlify limit. Recommendation: Compress your PDFs or ensure they have a selectable text layer (not just images).");
      } else if (err.message.includes("status: 500") || err.message.includes("AI Evaluation Error")) {
        setError(err.message || "The AI engine timed out or reached a limit. For very large papers, ensure they are text-selectable or split them into sections.");
      } else {
        setError(err.message || "An unexpected error occurred during evaluation.");
      }
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const renderDashboard = () => (
    <div className="max-w-5xl mx-auto px-4 mt-12 animate-fade-in pb-20">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
          Medical <span className="gradient-text">Evaluation</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
          Official Anatomy Guru processing engine. Optimized for standard tests and comprehensive 100-mark medical papers.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 h-full">
        <FileUploader
          label="Source Document"
          description="Question Paper + Answer Sheet (PDF/DOCX)"
          onFileSelect={setSourceDoc}
          selectedFile={sourceDoc}
          icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
        />
        <FileUploader
          label="Faculty Notes"
          description="Evaluator Marks & Scrawled Comments"
          onFileSelect={setDirtyFeedbackDoc}
          selectedFile={dirtyFeedbackDoc}
          icon={<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>}
        />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-6 rounded-2xl mb-8 text-sm flex items-start gap-4 animate-shake shadow-lg shadow-rose-500/10">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
          </div>
          <div className="flex-1">
            <p className="font-black uppercase tracking-widest text-[10px] mb-1">Processing Error</p>
            <span className="font-semibold text-base block mb-2">{error}</span>
            <p className="text-xs text-rose-500 italic">Tip: If this is a large 100-mark paper, try using a PDF with a text layer or convert images to a single optimized PDF.</p>
          </div>
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={isLoading || !sourceDoc || !dirtyFeedbackDoc}
        className={`w-full py-6 rounded-2xl font-black text-xl shadow-2xl transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden ${
          isLoading 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
          : 'bg-slate-900 hover:bg-slate-800 text-white hover:-translate-y-1 active:scale-95 shadow-slate-300'
        }`}
      >
        {isLoading ? (
          <>
            <div className="flex items-center gap-4">
              <svg className="animate-spin h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span className="animate-pulse tracking-widest uppercase text-sm font-black">Generating Report</span>
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 opacity-70">
              {loadingStep}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Generate Official Feedback
          </div>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 no-print h-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setReport(null);
              setView('dashboard');
              setError(null);
            }}
          >
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:rotate-12 transition-all">A</div>
            <div>
              <span className="brand-font text-2xl font-black tracking-tighter text-slate-900 block leading-none">AnatomyGuru</span>
              <span className="text-[10px] uppercase font-black text-red-600 tracking-widest leading-none">Intelligence Suite</span>
            </div>
          </div>
          
          {view === 'report' && report && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportPDF}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-xl shadow-red-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Export Official Copy
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4">
        {view === 'dashboard' && renderDashboard()}
        {view === 'report' && report && (
          <div className="relative animate-fade-in pb-20">
            <div className="no-print mt-8 flex justify-center">
              <button 
                onClick={() => {
                  setReport(null);
                  setView('dashboard');
                  setError(null);
                }}
                className="bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 px-6 py-2 rounded-full flex items-center gap-2 font-bold text-sm transition-all border border-slate-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                New Analysis
              </button>
            </div>
            <FeedbackReport report={report} />
          </div>
        )}
      </main>

      <footer className="mt-20 py-10 border-t border-slate-100 no-print text-center opacity-40">
        <p className="text-xs font-bold uppercase tracking-[0.3em]">Anatomy Guru Medical Intelligence Suite v4.6.1</p>
      </footer>
    </div>
  );
};

export default App;
