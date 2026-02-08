
import React, { useState } from 'react';

interface FileUploaderProps {
  label: string;
  description: string;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  icon: React.ReactNode;
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, description, onFileSelect, selectedFile, icon }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`relative group flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer h-full min-h-[240px] ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-400'
      } ${selectedFile ? 'border-emerald-200 bg-emerald-50/30' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        accept="application/pdf,image/*,.docx"
      />
      
      <div className={`mb-4 p-4 rounded-full transition-transform duration-500 ${
        selectedFile ? 'text-emerald-500 bg-emerald-100 scale-110' : 'text-slate-400 bg-slate-50 group-hover:scale-110'
      }`}>
        {selectedFile ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : icon}
      </div>

      <h3 className={`text-lg font-bold ${selectedFile ? 'text-emerald-700' : 'text-slate-800'}`}>
        {selectedFile ? 'File Received' : label}
      </h3>
      <p className="text-sm text-slate-500 text-center mt-2 px-4">
        {selectedFile ? selectedFile.name : description}
      </p>

      {selectedFile && (
        <div className="mt-4 animate-fade-in">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
            Ready for Analysis
          </span>
        </div>
      )}
      
      {!selectedFile && (
        <div className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Drop file here
        </div>
      )}
    </div>
  );
};

export default FileUploader;
