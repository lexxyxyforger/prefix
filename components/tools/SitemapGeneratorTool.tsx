"use client";
import { SitemapResult } from "@/lib/tools/sitemapGenerator";
import ToolCard from "@/components/ui/ToolCard";
import { useState } from "react";

interface Props { result: SitemapResult | null; loading: boolean; }

export default function SitemapGeneratorTool({ result, loading }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.xml).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <ToolCard id="sitemap-generator" title="Sitemap Generator" icon="🗺️" description="Auto-generate XML sitemap from page links" loading={loading}>
      {result ? (
        <div className="space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-4 py-2">
              <p className="text-[10px] text-zinc-400">URLs Found</p>
              <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">{result.totalUrls}</p>
            </div>
            <button onClick={copy} className="text-xs text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors">
              {copied ? "✓ Copied" : "Copy XML"}
            </button>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">URLs ({result.urls.length})</p>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {result.urls.map((u, i) => (
                <div key={i} className="flex items-center gap-2 py-1 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                  <span className="text-[9px] bg-brand-500/10 text-brand-600 px-1.5 py-0.5 rounded font-semibold shrink-0">{u.priority}</span>
                  <span className="text-[11px] text-zinc-500 truncate flex-1">{u.loc}</span>
                  <span className="text-[9px] text-zinc-400 shrink-0">{u.changefreq}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">XML Preview</p>
            <pre className="text-[10px] font-mono bg-zinc-950 dark:bg-zinc-900 text-emerald-400 rounded-xl p-3 max-h-32 overflow-auto border border-zinc-800 leading-relaxed">
              {result.xml.slice(0, 600)}{result.xml.length > 600 ? "\n…" : ""}
            </pre>
          </div>
        </div>
      ) : !loading ? (
        <p className="text-xs text-zinc-400 italic mt-2">Enter a URL and click Scan to generate sitemap</p>
      ) : null}
    </ToolCard>
  );
}
