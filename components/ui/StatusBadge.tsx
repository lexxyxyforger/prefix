"use client";

type StatusType = "good" | "warning" | "error" | "info" | "missing" | "pending";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const map: Record<StatusType, string> = {
  good: "bg-success-500/10 text-success-500 border-success-500/20",
  warning: "bg-warn-500/10 text-warn-500 border-warn-500/20",
  error: "bg-danger-500/10 text-danger-500 border-danger-500/20",
  info: "bg-brand-500/10 text-brand-600 border-brand-500/20",
  missing: "bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700",
  pending: "bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700",
};

const icons: Record<StatusType, string> = {
  good: "✓",
  warning: "⚠",
  error: "✕",
  info: "ℹ",
  missing: "–",
  pending: "…",
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${map[status]}`}>
      <span>{icons[status]}</span>
      {label || status}
    </span>
  );
}
