"use client";
import { useState, ReactNode } from "react";

interface ToolCardProps {
  id: string;
  title: string;
  icon: string;
  description: string;
  score?: number | null;
  loading?: boolean;
  children: ReactNode;
  onExpand?: () => void;
  badge?: ReactNode;
}

export default function ToolCard({ title, icon, description, score, loading, children, onExpand, badge }: ToolCardProps) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor = score == null ? "" : score >= 80 ? "text-success-500" : score >= 50 ? "text-warn-500" : "text-danger-500";
  const scoreBg = score == null ? "" : score >= 80 ? "bg-success-500" : score >= 50 ? "bg-warn-500" : "bg-danger-500";

  return (
    <div className={`group relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-200 hover:border-brand-200 dark:hover:border-brand-900 hover:shadow-lg hover:shadow-brand-500/5 ${expanded ? "col-span-full" : ""}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-lg shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
                {badge}
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {score != null && !loading && (
              <div className="flex flex-col items-center">
                <span className={`text-lg font-bold leading-none ${scoreColor}`}>{score}</span>
                <div className="w-8 h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-1 overflow-hidden">
                  <div className={`h-full rounded-full ${scoreBg}`} style={{ width: `${score}%`, transition: "width 0.8s ease" }} />
                </div>
              </div>
            )}
            <button
              onClick={() => setExpanded(e => !e)}
              className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              title={expanded ? "Collapse" : "Expand"}
            >
              <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 mt-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-3 rounded-md bg-zinc-100 dark:bg-zinc-800 shimmer" style={{ width: `${70 + i * 10}%` }} />
            ))}
          </div>
        ) : (
          <div className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-none" : "max-h-64"}`}>
            {children}
          </div>
        )}
      </div>

      {!loading && !expanded && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
