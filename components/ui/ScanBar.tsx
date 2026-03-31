"use client";
import { useState, FormEvent } from "react";

interface ScanBarProps {
  onScan: (url: string) => void;
  loading: boolean;
  progress: number;
  currentStep: string;
}

export default function ScanBar({ onScan, loading, progress, currentStep }: ScanBarProps) {
  const [url, setUrl] = useState("https://");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    onScan(url.trim());
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all placeholder-zinc-300 dark:placeholder-zinc-600 disabled:opacity-50 font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 justify-center shrink-0 shadow-md shadow-brand-500/20 hover:shadow-brand-500/30"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scanning…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Scan
            </>
          )}
        </button>
      </form>

      {loading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-zinc-400">{currentStep}</span>
            <span className="text-[11px] font-semibold text-brand-500">{progress}%</span>
          </div>
          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
