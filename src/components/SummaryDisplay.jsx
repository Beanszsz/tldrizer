'use client';

import { Copy, Check, Download } from 'lucide-react';
import { useState } from 'react';

export default function SummaryDisplay({ summary, title, metadata }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([`${title}\n\n${summary}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#252526] rounded-xl shadow-2xl p-8 border border-gray-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          {metadata && (
            <div className="flex gap-4 text-sm text-gray-400">
              {metadata.wordCount && (
                <span>{metadata.wordCount.toLocaleString()} words</span>
              )}
              {metadata.pageCount && (
                <span>{metadata.pageCount} pages</span>
              )}
              {metadata.provider && (
                <span className="font-medium text-blue-400">
                  {metadata.provider === 'huggingface' ? '⚡ Hugging Face' :
                   metadata.provider === 'openai' ? '🤖 ChatGPT' :
                   metadata.provider === 'claude' ? '🧠 Claude' : metadata.provider}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-[#3e3e42] rounded-lg transition-colors shadow-md"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-[#3e3e42] rounded-lg transition-colors shadow-md"
            title="Download summary"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Summary</h3>
        <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
          {summary}
        </p>
      </div>
    </div>
  );
}
