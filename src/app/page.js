'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import UrlInput from '@/components/UrlInput';
import SummaryDisplay from '@/components/SummaryDisplay';
import ModelSelector from '@/components/ModelSelector';
import { Loader2, FileText } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('huggingface');

  const handleUrlSubmit = async (url) => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      // Extract content from URL
      const extractRes = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!extractRes.ok) {
        const errorData = await extractRes.json();
        throw new Error(errorData.error || 'Failed to extract content');
      }

      const { content, title, wordCount } = await extractRes.json();

      // Summarize content with selected provider
      const summaryRes = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, provider: selectedProvider })
      });

      if (!summaryRes.ok) {
        const errorData = await summaryRes.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const { summary: summaryText, provider, model } = await summaryRes.json();

      setSummary({
        text: summaryText,
        title,
        metadata: { wordCount, provider, model }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file) => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      // Extract content from PDF
      const formData = new FormData();
      formData.append('file', file);

      const extractRes = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData
      });

      if (!extractRes.ok) {
        const errorData = await extractRes.json();
        throw new Error(errorData.error || 'Failed to extract PDF content');
      }

      const { content, title, wordCount, pageCount } = await extractRes.json();

      // Summarize content with selected provider
      const summaryRes = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, provider: selectedProvider })
      });

      if (!summaryRes.ok) {
        const errorData = await summaryRes.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const { summary: summaryText, provider, model } = await summaryRes.json();

      setSummary({
        text: summaryText,
        title,
        metadata: { wordCount, pageCount, provider, model }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-12 h-12 text-blue-500" />
            <h1 className="text-5xl font-bold text-white">TLDRizer</h1>
          </div>
          <p className="text-xl text-gray-400">
            Summarize articles, blogs, and PDFs with AI
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-[#252526] rounded-2xl shadow-2xl p-8 mb-8">
          <div className="space-y-6">
            {/* Model Selector */}
            <ModelSelector 
              selectedProvider={selectedProvider}
              onProviderChange={setSelectedProvider}
              isLoading={isLoading}
            />

            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-300 mb-3">
                Enter Article URL
              </h2>
              <UrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#252526] text-gray-500">OR</span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-300 mb-3">
                Upload PDF File
              </h2>
              <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-[#252526] rounded-xl shadow-2xl p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-300 text-lg">Processing and summarizing...</p>
            <p className="text-gray-500 text-sm mt-2">
              Using {selectedProvider === 'huggingface' ? 'Hugging Face' : 
                     selectedProvider === 'openai' ? 'ChatGPT' : 'Claude Sonnet'}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center shadow-lg">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Summary Display */}
        {summary && !isLoading && (
          <SummaryDisplay
            summary={summary.text}
            title={summary.title}
            metadata={summary.metadata}
          />
        )}
      </div>
    </div>
  );
}
