"use client";
import { CriticalCssResult } from "@/lib/tools/criticalCss";
import ToolCard from "@/components/ui/ToolCard";
import { useState } from "react";

interface Props { result: CriticalCssResult | null; loading: boolean; }

export default function CriticalCssTool({ result, loading }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.criticalSnippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <ToolCard id="critical-css" title="Critical CSS Generator" icon="🎨" description="Extract and generate critical above-fold CSS" score={result?.score} loading={loading}>
      {result ? (
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5">
              <p className="text-[10px] text-zinc-400">Inline Styles</p>
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{result.styleTagCount}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5">
              <p className="text-[10px] text-zinc-400">External CSS</p>
              <p className={`text-sm font-bold ${result.externalCssCount > 3 ? "text-warn-500" : "text-zinc-700 dark:text-zinc-300"}`}>{result.externalCssCount}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5">
              <p className="text-[10px] text-zinc-400">Critical Inline</p>
              <p className={`text-sm font-bold ${result.hasInlineCritical ? "text-success-500" : "text-danger-500"}`}>{result.hasInlineCritical ? "Yes" : "No"}</p>
            </div>
          </div>

          {result.issues.map((issue, i) => (
            <div key={i} className="text-[11px] text-warn-500 bg-warn-500/8 border border-warn-500/20 rounded-xl p-2.5">⚠ {issue}</div>
          ))}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Critical CSS Snippet</p>
              <button onClick={copy} className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline font-medium">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="text-[10px] font-mono bg-zinc-950 dark:bg-zinc-900 text-emerald-400 rounded-xl p-3 overflow-x-auto max-h-36 leading-relaxed border border-zinc-800">
              {result.criticalSnippet}
            </pre>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Recommendations</p>
            <div className="space-y-1">
              {result.recommendations.map((r, i) => (
                <p key={i} className="text-[11px] text-zinc-500 dark:text-zinc-400">→ {r}</p>
              ))}
            </div>
          </div>
        </div>
      ) : !loading ? (
        <p className="text-xs text-zinc-400 italic mt-2">Enter a URL and click Scan</p>
      ) : null}
    </ToolCard>
  );
}
