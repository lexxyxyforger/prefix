"use client";
import { BrokenLinkResult, LinkResult } from "@/lib/tools/brokenLinks";
import ToolCard from "@/components/ui/ToolCard";

interface Props { result: BrokenLinkResult | null; loading: boolean; }

const statusStyle: Record<string, string> = {
  ok: "text-success-500 bg-success-500/10",
  redirect: "text-brand-500 bg-brand-500/10",
  broken: "text-danger-500 bg-danger-500/10",
  skipped: "text-zinc-400 bg-zinc-100 dark:bg-zinc-800",
  pending: "text-zinc-300 bg-zinc-50 dark:bg-zinc-800",
};

export default function BrokenLinkTool({ result, loading }: Props) {
  return (
    <ToolCard id="broken-links" title="Broken Link Checker" icon="🔗" description="Scan and validate all links on the page" score={result?.score} loading={loading}>
      {result ? (
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total", value: result.totalLinks, color: "text-zinc-700 dark:text-zinc-300" },
              { label: "OK", value: result.okLinks, color: "text-success-500" },
              { label: "Broken", value: result.brokenLinks.length, color: "text-danger-500" },
              { label: "Skipped", value: result.skippedLinks, color: "text-zinc-400" },
            ].map(s => (
              <div key={s.label} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2 text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-zinc-400">{s.label}</p>
              </div>
            ))}
          </div>

          {result.brokenLinks.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-danger-500 uppercase tracking-wider mb-1.5">Broken Links</p>
              <div className="space-y-1.5">
                {result.brokenLinks.slice(0, 5).map((l, i) => (
                  <LinkRow key={i} link={l} />
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">All Links</p>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {result.links.slice(0, 20).map((l, i) => (
                <LinkRow key={i} link={l} />
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

function LinkRow({ link }: { link: LinkResult }) {
  return (
    <div className="flex items-center gap-2 py-1 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${statusStyle[link.status] || ""}`}>
        {link.status === "ok" ? "200" : link.statusCode ? link.statusCode : link.status.toUpperCase()}
      </span>
      <span className={`text-[9px] px-1 py-0.5 rounded font-medium shrink-0 ${link.type === "internal" ? "bg-brand-500/10 text-brand-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
        {link.type === "internal" ? "INT" : "EXT"}
      </span>
      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate flex-1">{link.text || link.href}</span>
    </div>
  );
}
