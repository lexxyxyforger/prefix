import { parseHtml } from "../utils/fetch";

export interface SitemapUrl {
  loc: string;
  priority: string;
  changefreq: string;
}

export interface SitemapResult {
  url: string;
  timestamp: string;
  urls: SitemapUrl[];
  xml: string;
  totalUrls: number;
}

const CHANGEFREQ = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as const;

export function extractSitemapUrls(html: string, baseUrl: string): SitemapUrl[] {
  const doc = parseHtml(html);
  const seen = new Set<string>();
  const urls: SitemapUrl[] = [];

  let base: URL;
  try { base = new URL(baseUrl); } catch { return []; }

  urls.push({ loc: base.origin + "/", priority: "1.0", changefreq: "weekly" });
  seen.add(base.origin + "/");

  doc.querySelectorAll("a[href]").forEach(a => {
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const full = new URL(href, baseUrl);
      if (full.hostname !== base.hostname) return;
      const loc = full.origin + full.pathname;
      if (seen.has(loc)) return;
      seen.add(loc);

      let priority = "0.5";
      let changefreq = "monthly";
      if (full.pathname === "/" || full.pathname === "") { priority = "1.0"; changefreq = "weekly"; }
      else if (full.pathname.split("/").filter(Boolean).length === 1) { priority = "0.8"; changefreq = "weekly"; }

      urls.push({ loc, priority, changefreq });
    } catch {}
  });

  return urls.slice(0, 100);
}

export function generateSitemapXml(urls: SitemapUrl[]): string {
  const entries = urls.map(u =>
    `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
