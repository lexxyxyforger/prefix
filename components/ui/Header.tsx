"use client";
import { useState, useEffect } from "react";
import { getTheme, setTheme } from "@/lib/utils/storage";

export default function Header() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(getTheme() === "dark");
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    setTheme(next);
    setDark(!dark);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 glass border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-black text-sm select-none">
            P
          </div>
          <div>
            <span className="font-bold text-sm text-zinc-900 dark:text-white tracking-tight">PerfKit</span>
            <span className="hidden sm:inline text-[11px] text-zinc-400 ml-2 font-medium">SEO & Performance Toolkit</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[11px] font-medium text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
            10 Tools · localStorage
          </span>
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-300 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
