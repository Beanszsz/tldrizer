"use client";

import { useState } from "react";
import { Link2, ArrowRight } from "lucide-react";

export default function UrlInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste article or blog URL here..."
            className="w-full pl-11 pr-4 py-3 bg-[#2d2d30] border border-gray-700 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
            disabled={isLoading}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="px-6 py-3 bg-[#3e3e42] text-white rounded-lg hover:bg-[#4e4e52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium border border-gray-700 shadow-lg hover:shadow-xl"
        >
          Summarize
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
