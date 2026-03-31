"use client";
import { ImageOptimizerResult } from "@/lib/tools/imageOptimizer";
import ToolCard from "@/components/ui/ToolCard";

interface Props { result: ImageOptimizerResult | null; loading: boolean; }

export default function ImageOptimizerTool({ result, loading }: Props) {
  return (
    <ToolCard id="image-optimizer" title="Image Optimizer" icon="🖼️" description="Audit image formats, lazy loading, and alt text" score={result?.score} loading={loading}>
      {result ? (
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Total Images", value: result.totalImages },
              { label: "No Alt Text", value: result.summary.noAlt, bad: result.summary.noAlt > 0 },
              { label: "No Lazy Load", value: result.summary.noLazy, bad: result.summary.noLazy > 0 },
              { label: "No Dimensions", value: result.summary.noDimensions, bad: result.summary.noDimensions > 0 },
            ].map(s => (
              <div key={s.label} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5">
                <p className="text-[10px] text-zinc-400">{s.label}</p>
                <p className={`text-base font-bold ${s.bad ? "text-danger-500" : "text-zinc-700 dark:text-zinc-300"}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {result.images.map((img, i) => (
              <div key={i} className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-2.5">
                <p className="text-[11px] font-mono text-zinc-500 truncate mb-1.5">{img.src || "(no src)"}</p>
                <div className="flex flex-wrap gap-1">
                  <Chip ok={img.hasAlt} label="Alt" />
                  <Chip ok={img.loading === "lazy"} label="Lazy" />
                  <Chip ok={img.hasDimensions} label="Dims" />
                  <Chip ok={img.src.includes(".webp") || img.src.includes(".avif")} label="WebP/AVIF" />
                </div>
                {img.recommendations.length > 0 && (
                  <p className="text-[10px] text-warn-500 mt-1.5">→ {img.recommendations[0]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : !loading ? (
        <p className="text-xs text-zinc-400 italic mt-2">Enter a URL and click Scan</p>
      ) : null}
    </ToolCard>
  );
}

function Chip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${ok ? "bg-success-500/10 text-success-500" : "bg-danger-500/10 text-danger-500"}`}>
      {ok ? "✓" : "✕"} {label}
    </span>
  );
}
