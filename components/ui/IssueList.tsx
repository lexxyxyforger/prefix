"use client";

interface Issue {
  type: "error" | "warning" | "info";
  title: string;
  detail: string;
  fix: string;
}

interface IssueListProps {
  issues: Issue[];
  passed?: string[];
  showPassed?: boolean;
  maxVisible?: number;
}

const typeConfig = {
  error: { bg: "bg-danger-500/8 border-danger-500/20", icon: "✕", iconBg: "bg-danger-500/10 text-danger-500", label: "Error" },
  warning: { bg: "bg-warn-500/8 border-warn-500/20", icon: "⚠", iconBg: "bg-warn-500/10 text-warn-500", label: "Warning" },
  info: { bg: "bg-brand-500/8 border-brand-500/20", icon: "ℹ", iconBg: "bg-brand-500/10 text-brand-600", label: "Info" },
};

export default function IssueList({ issues, passed = [], showPassed = true, maxVisible = 5 }: IssueListProps) {
  if (issues.length === 0 && passed.length === 0) {
    return <p className="text-xs text-zinc-400 italic">Run a scan to see results</p>;
  }

  return (
    <div className="space-y-2 mt-3">
      {issues.slice(0, maxVisible).map((issue, i) => {
        const cfg = typeConfig[issue.type];
        return (
          <div key={i} className={`border rounded-xl p-3 ${cfg.bg} animate-slide-up`} style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-start gap-2">
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${cfg.iconBg}`}>
                {cfg.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">{issue.title}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{issue.detail}</p>
                <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-1 font-medium leading-relaxed">→ {issue.fix}</p>
              </div>
            </div>
          </div>
        );
      })}

      {showPassed && passed.slice(0, 3).map((p, i) => (
        <div key={i} className="border border-success-500/15 bg-success-500/5 rounded-xl p-2.5 flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-success-500/15 text-success-500 flex items-center justify-center text-[9px] font-bold shrink-0">✓</span>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{p}</p>
        </div>
      ))}

      {issues.length === 0 && (
        <div className="text-center py-3">
          <span className="text-2xl">🎉</span>
          <p className="text-xs text-success-500 font-medium mt-1">No issues found!</p>
        </div>
      )}
    </div>
  );
}
