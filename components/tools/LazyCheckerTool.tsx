"use client";
import { LazyCheckResult } from "@/lib/tools/lazyChecker";
import ToolCard from "@/components/ui/ToolCard";

interface Props { result: LazyCheckResult | null; loading: boolean; }

export default function LazyCheckerTool({ result, loading }: Props) {
  return (
    <ToolCard id="lazy-checker" title="Lazy Load Checker" icon="🦥" description="Verify lazy loading for images, iframes & videos" score={result?.score} loading={loading}>
      {result ? (
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Images", lazy: result.lazyImages, total: result.totalImages },
              { label: "Iframes", lazy: result.lazyIframes, total: result.iframeTotal },
              { label: "Videos", lazy: result.lazyVideos, total: result.totalVideos },
            ].map(s => (
              <div key={s.label} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-zinc-400 mb-1">{s.label}</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm font-bold text-success-500">{s.lazy}</span>
                  <span className="text-[10px] text-zinc-400">/{s.total}</span>
                </div>
                <p className="text-[9px] text-zinc-400 mt-0.5">lazy</p>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {result.issues.map((issue, i) => (
              <div key={i} className="text-[11px] text-warn-500 bg-warn-500/8 border border-warn-500/20 rounded-xl p-2.5">⚠ {issue}</div>
            ))}
            {result.passed.map((p, i) => (
              <div key={i} className="text-[11px] text-success-500 bg-success-500/5 border border-success-500/15 rounded-xl p-2">✓ {p}</div>
            ))}
          </div>

          {result.items.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Media Elements</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {result.items.slice(0, 15).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                    <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded shrink-0">{item.tag}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${item.isLazy ? "bg-success-500/10 text-success-500" : "bg-warn-500/10 text-warn-500"}`}>
                      {item.isLazy ? "lazy" : "eager"}
                    </span>
                    <span className="text-[11px] text-zinc-500 truncate">{item.src || "(no src)"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : !loading ? (
        <p className="text-xs text-zinc-400 italic mt-2">Enter a URL and click Scan</p>
      ) : null}
    </ToolCard>
  );
}
