"use client";
import { useState } from "react";
import { RobotsRule, generateRobots, defaultRules } from "@/lib/tools/robotsGenerator";
import ToolCard from "@/components/ui/ToolCard";

interface Props { url: string }

export default function RobotsGeneratorTool({ url }: Props) {
  const [rules, setRules] = useState<RobotsRule[]>(defaultRules);
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [crawlDelay, setCrawlDelay] = useState("");
  const [copied, setCopied] = useState(false);

  const output = generateRobots(rules, sitemapUrl ? [sitemapUrl] : url ? [`${url}/sitemap.xml`] : [], crawlDelay ? parseInt(crawlDelay) : undefined);

  const copy = () => {
    navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const addRule = () => setRules(r => [...r, { userAgent: "*", allow: [], disallow: [] }]);

  return (
    <ToolCard id="robots-generator" title="Robots.txt Generator" icon="🤖" description="Generate robots.txt with custom rules" loading={false}>
      <div className="space-y-3 mt-2">
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Rules</p>
          {rules.map((rule, i) => (
            <div key={i} className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 mb-2 space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-zinc-400 w-20 shrink-0">User-agent</label>
                <input
                  value={rule.userAgent}
                  onChange={e => setRules(r => r.map((x, j) => j === i ? { ...x, userAgent: e.target.value } : x))}
                  className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-zinc-400 w-20 shrink-0">Disallow</label>
                <input
                  placeholder="/admin/, /private/"
                  value={rule.disallow.join(", ")}
                  onChange={e => setRules(r => r.map((x, j) => j === i ? { ...x, disallow: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } : x))}
                  className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
                />
              </div>
            </div>
          ))}
          <button onClick={addRule} className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-medium">+ Add Rule</button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] text-zinc-400 w-20 shrink-0">Sitemap URL</label>
          <input
            placeholder="https://example.com/sitemap.xml"
            value={sitemapUrl}
            onChange={e => setSitemapUrl(e.target.value)}
            className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] text-zinc-400 w-20 shrink-0">Crawl Delay</label>
          <input
            placeholder="10"
            value={crawlDelay}
            onChange={e => setCrawlDelay(e.target.value)}
            type="number"
            className="w-24 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Generated robots.txt</p>
            <button onClick={copy} className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline font-medium">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="text-[11px] font-mono bg-zinc-950 dark:bg-zinc-900 text-emerald-400 rounded-xl p-3 whitespace-pre-wrap border border-zinc-800 max-h-36 overflow-y-auto">
            {output}
          </pre>
        </div>
      </div>
    </ToolCard>
  );
}
