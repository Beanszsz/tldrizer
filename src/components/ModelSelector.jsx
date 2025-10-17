'use client';

import { Sparkles } from 'lucide-react';

export default function ModelSelector({ selectedProvider, onProviderChange, isLoading }) {
  const providers = [
    { 
      id: 'huggingface', 
      name: 'Hugging Face', 
      description: 'Free (Slower)',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    },
    { 
      id: 'openai', 
      name: 'ChatGPT', 
      description: 'Fast & Accurate',
      color: 'bg-green-100 text-green-800 border-green-300'
    },
    { 
      id: 'claude', 
      name: 'Claude Sonnet', 
      description: 'Best Quality',
      color: 'bg-purple-100 text-purple-800 border-purple-300'
    }
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <h3 className="text-sm font-semibold text-gray-300">AI Model</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onProviderChange(provider.id)}
            disabled={isLoading}
            className={`
              p-3 rounded-lg border-2 transition-all text-left bg-[#3e3e42] shadow-lg
              ${selectedProvider === provider.id 
                ? 'border-blue-500 shadow-blue-500/50' 
                : 'border-gray-700 hover:border-gray-600'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
            `}
          >
            <div className="font-semibold text-sm text-white">{provider.name}</div>
            <div className="text-xs mt-1 text-gray-400">{provider.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
