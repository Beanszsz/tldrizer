'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';

export default function FileUpload({ onFileSelect, isLoading }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-all duration-200 bg-[#2d2d30] shadow-lg
        ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {isDragActive ? (
          <FileText className="w-12 h-12 text-blue-500" />
        ) : (
          <Upload className="w-12 h-12 text-gray-500" />
        )}
        <div>
          <p className="text-lg font-medium text-gray-300">
            {isDragActive ? 'Drop your PDF here' : 'Upload PDF File'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Drag & drop or click to select a PDF file
          </p>
        </div>
      </div>
    </div>
  );
}
