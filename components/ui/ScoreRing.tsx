"use client";
import { scoreRingColor, scoreLabel } from "@/lib/utils/fetch";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export default function ScoreRing({ score, size = 96, strokeWidth = 8, label, sublabel }: ScoreRingProps) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreRingColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-zinc-100 dark:text-zinc-800" />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold leading-none" style={{ color }}>{score}</span>
          <span className="text-[10px] text-zinc-400 font-medium">{scoreLabel(score)}</span>
        </div>
      </div>
      {label && <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-center">{label}</span>}
      {sublabel && <span className="text-[10px] text-zinc-400 text-center">{sublabel}</span>}
    </div>
  );
}
