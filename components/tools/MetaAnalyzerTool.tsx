"use client";
import { MetaAnalyzerResult } from "@/lib/tools/metaAnalyzer";
import ToolCard from "@/components/ui/ToolCard";
import StatusBadge from "@/components/ui/StatusBadge";

interface Props { result: MetaAnalyzerResult | null; loading: boolean; }

export default function MetaAnalyzerTool({ result, loading }: Props) {
  return (
    <ToolCard id="meta-analyzer" title="Meta Tag Analyzer" icon="🏷️" description="Inspect all meta, OG, and Twitter tags" score={result?.score} loading={loading}>
      {result ? (
        <div className="space-y-3 mt-2">
          <Section title="Core Meta" tags={result.tags} />
          <Section title="Open Graph" tags={result.ogTags} />
          <Section title="Twitter Card" tags={result.twitterTags} />
        </div>
      ) : !loading ? (
        <p className="text-xs text-zinc-400 italic mt-2">Enter a URL and click Scan</p>
      ) : null}
    </ToolCard>
  );
}

function Section({ title, tags }: { title: string; tags: { name: string; content: string; status: "good" | "warning" | "missing"; note: string }[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{title}</p>
      <div className="space-y-1">
        {tags.map(tag => (
          <div key={tag.name} className="flex items-start gap-2 py-1.5 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
            <StatusBadge status={tag.status} label={tag.status === "good" ? "OK" : tag.status} />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-mono font-medium text-zinc-600 dark:text-zinc-400">{tag.name}</span>
              {tag.content && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-500 truncate mt-0.5">{tag.content}</p>
              )}
              {tag.note && tag.status !== "good" && (
                <p className="text-[10px] text-warn-500 mt-0.5">{tag.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
