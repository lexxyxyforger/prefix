"use client";
import { DomAnalyzerResult } from "@/lib/tools/domAnalyzer";
import ToolCard from "@/components/ui/ToolCard";

interface Props { result: DomAnalyzerResult | null; loading: boolean; }

export default function DomAnalyzerTool({ result, loading }: Props) {
  return (
    <ToolCard id="dom-analyzer" title="DOM Size Analyzer" icon="🌲" description="Analyze DOM complexity and HTML weight" score={result?.score} loading={loading}>
      {result ? (
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Total Nodes", value: result.totalNodes, bad: result.totalNodes > 1500 },
              { label: "Max Depth", value: result.maxDepth, bad: result.maxDepth > 32 },
              { label: "HTML Size", value: result.htmlSizeFormatted, bad: result.htmlSize > 500 * 1024 },
              { label: "Scripts", value: result.scriptCount, bad: result.scriptCount > 20 },
            ].map(s => (
              <div key={s.label} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5">
                <p className="text-[10px] text-zinc-400">{s.label}</p>
                <p className={`text-base font-bold ${s.bad ? "text-warn-500" : "text-zinc-700 dark:text-zinc-300"}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Top Elements</p>
            <div className="space-y-1">
              {result.elementCounts.slice(0, 8).map(({ tag, count }) => (
                <div key={tag} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 w-16 shrink-0">&lt;{tag}&gt;</span>
                  <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-400 rounded-full" style={{ width: `${Math.min(100, (count / (result.elementCounts[0]?.count || 1)) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-zinc-400 w-8 text-right shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {result.issues.map((issue, i) => (
              <div key={i} className="text-[11px] text-warn-500 bg-warn-500/8 border border-warn-500/20 rounded-xl p-2">⚠ {issue}</div>
            ))}
            {result.passed.slice(0, 3).map((p, i) => (
              <div key={i} className="text-[11px] text-success-500 bg-success-500/5 border border-success-500/15 rounded-xl p-2">✓ {p}</div>
            ))}
          </div>
        </div>
      ) : !loading ? (
        <p className="text-xs text-zinc-400 italic mt-2">Enter a URL and click Scan</p>
      ) : null}
    </ToolCard>
  );
}
