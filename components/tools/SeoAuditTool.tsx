"use client";
import { SeoAuditResult } from "@/lib/tools/seoAudit";
import ToolCard from "@/components/ui/ToolCard";
import IssueList from "@/components/ui/IssueList";
import ScoreRing from "@/components/ui/ScoreRing";

interface Props {
  result: SeoAuditResult | null;
  loading: boolean;
}

export default function SeoAuditTool({ result, loading }: Props) {
  return (
    <ToolCard id="seo-audit" title="SEO Audit" icon="🔍" description="Comprehensive on-page SEO analysis" score={result?.score} loading={loading}>
      {result ? (
        <div className="space-y-4 mt-2">
          <div className="flex items-start gap-4">
            <ScoreRing score={result.score} size={80} label="SEO Score" />
            <div className="flex-1 grid grid-cols-2 gap-2">
              {[
                { label: "Response", value: `${result.responseTime}ms` },
                { label: "Words", value: `~${result.meta.wordCount}` },
                { label: "Images", value: result.meta.imagesTotal },
                { label: "Links", value: result.meta.linksInternal + result.meta.linksExternal },
              ].map(item => (
                <div key={item.label} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5">
                  <p className="text-[10px] text-zinc-400 font-medium">{item.label}</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            {[
              { label: "Title", value: result.meta.title || "–", len: result.meta.titleLen, max: 60 },
              { label: "Description", value: result.meta.description ? result.meta.description.slice(0, 80) + (result.meta.description.length > 80 ? "…" : "") : "–", len: result.meta.descLen, max: 160 },
              { label: "H1", value: result.meta.h1Text || "–" },
            ].map(item => (
              <div key={item.label} className="flex gap-2 items-start">
                <span className="text-[10px] text-zinc-400 font-semibold w-16 pt-0.5 shrink-0">{item.label}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">{item.value}</p>
                  {"len" in item && item.len ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${item.len > item.max! ? "bg-danger-500" : item.len < 10 ? "bg-warn-500" : "bg-success-500"}`} style={{ width: `${Math.min(100, (item.len / item.max!) * 100)}%` }} />
                      </div>
                      <span className={`text-[9px] font-medium ${item.len > item.max! ? "text-danger-500" : item.len < 10 ? "text-warn-500" : "text-success-500"}`}>{item.len}/{item.max}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <IssueList issues={result.issues} passed={result.passed} maxVisible={6} />
        </div>
      ) : !loading ? (
        <p className="text-xs text-zinc-400 italic mt-2">Enter a URL and click Scan to analyze</p>
      ) : null}
    </ToolCard>
  );
}
