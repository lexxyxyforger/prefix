"use client";
import { CwvResult } from "@/lib/tools/cwvChecker";
import ToolCard from "@/components/ui/ToolCard";

interface Props { result: CwvResult | null; loading: boolean; }

function Metric({ label, value, threshold }: { label: string; value: string; threshold: "good" | "needs" | "poor" }) {
  const color = threshold === "good" ? "text-success-500 bg-success-500/10 border-success-500/20"
    : threshold === "needs" ? "text-warn-500 bg-warn-500/10 border-warn-500/20"
    : "text-danger-500 bg-danger-500/10 border-danger-500/20";
  return (
    <div className={`rounded-xl p-3 border ${color}`}>
      <p className="text-[10px] font-medium opacity-70">{label}</p>
      <p className="text-sm font-bold mt-0.5">{value}</p>
    </div>
  );
}

function getThreshold(value: string): "good" | "needs" | "poor" {
  if (value === "Good") return "good";
  if (value === "Poor") return "poor";
  return "needs";
}

export default function CwvCheckerTool({ result, loading }: Props) {
  return (
    <ToolCard id="cwv-checker" title="Core Web Vitals" icon="⚡" description="Estimate LCP, CLS, FID and render blockers" score={result?.score} loading={loading}>
      {result ? (
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-3 gap-2">
            <Metric label="LCP" value={result.estimatedLcp} threshold={getThreshold(result.estimatedLcp)} />
            <Metric label="CLS" value={result.estimatedCls} threshold={getThreshold(result.estimatedCls)} />
            <Metric label="FID" value={result.estimatedFid} threshold={getThreshold(result.estimatedFid)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5">
              <p className="text-[10px] text-zinc-400">TTFB</p>
              <p className={`text-sm font-bold ${result.ttfbMs > 800 ? "text-warn-500" : "text-success-500"}`}>{result.ttfbMs}ms</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5">
              <p className="text-[10px] text-zinc-400">Page Size</p>
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{result.pageSizeFormatted}</p>
            </div>
          </div>

          {result.renderBlocking.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Render-Blocking ({result.renderBlocking.length})</p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {result.renderBlocking.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${r.type === "script" ? "bg-warn-500/10 text-warn-500" : "bg-brand-500/10 text-brand-600"}`}>
                      {r.type.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-zinc-500 truncate">{r.src}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            {result.issues.map((issue, i) => (
              <p key={i} className="text-[11px] text-warn-500">⚠ {issue}</p>
            ))}
            {result.passed.slice(0, 3).map((p, i) => (
              <p key={i} className="text-[11px] text-success-500">✓ {p}</p>
            ))}
          </div>
        </div>
      ) : !loading ? (
        <p className="text-xs text-zinc-400 italic mt-2">Enter a URL and click Scan</p>
      ) : null}
    </ToolCard>
  );
}
