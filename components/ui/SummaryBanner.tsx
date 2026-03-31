"use client";
import ScoreRing from "./ScoreRing";

interface SummaryBannerProps {
  url: string;
  scores: { label: string; score: number }[];
  timestamp: string;
}

export default function SummaryBanner({ url, scores, timestamp }: SummaryBannerProps) {
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 animate-slide-up shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <ScoreRing score={avg} size={88} label="Overall" sublabel={new Date(timestamp).toLocaleTimeString()} />

        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-400 mb-1 font-medium truncate">{url}</p>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-3">Scan Complete</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {scores.slice(0, 5).map(s => {
              const color = s.score >= 80 ? "text-success-500" : s.score >= 50 ? "text-warn-500" : "text-danger-500";
              const bg = s.score >= 80 ? "bg-success-500/10" : s.score >= 50 ? "bg-warn-500/10" : "bg-danger-500/10";
              return (
                <div key={s.label} className={`${bg} rounded-xl px-3 py-2`}>
                  <p className="text-[9px] text-zinc-400 font-medium mb-0.5">{s.label}</p>
                  <p className={`text-sm font-bold ${color}`}>{s.score}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
