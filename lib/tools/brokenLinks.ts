import { parseHtml } from "../utils/fetch";

export interface LinkResult {
  href: string;
  text: string;
  type: "internal" | "external";
  status: "ok" | "broken" | "redirect" | "skipped" | "pending";
  statusCode?: number;
}

export interface BrokenLinkResult {
  url: string;
  timestamp: string;
  totalLinks: number;
  checkedLinks: number;
  brokenLinks: LinkResult[];
  okLinks: number;
  skippedLinks: number;
  links: LinkResult[];
  score: number;
}

export function extractLinks(html: string, baseUrl: string): LinkResult[] {
  const doc = parseHtml(html);
  const links: LinkResult[] = [];
  const seen = new Set<string>();
  let base: URL;
  try { base = new URL(baseUrl); } catch { return []; }

  doc.querySelectorAll("a[href]").forEach(el => {
    const raw = el.getAttribute("href")?.trim() || "";
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) return;

    let href: string;
    try {
      href = new URL(raw, baseUrl).href;
    } catch { return; }

    if (seen.has(href)) return;
    seen.add(href);

    const type = new URL(href).hostname === base.hostname ? "internal" : "external";
    const text = el.textContent?.trim().slice(0, 60) || href;
    links.push({ href, text, type, status: "pending" });
  });

  return links.slice(0, 50);
}

export function buildBrokenLinkResult(url: string, timestamp: string, links: LinkResult[]): BrokenLinkResult {
  const checked = links.filter(l => l.status !== "pending" && l.status !== "skipped");
  const broken = links.filter(l => l.status === "broken");
  const ok = links.filter(l => l.status === "ok" || l.status === "redirect").length;
  const skipped = links.filter(l => l.status === "skipped").length;
  const score = checked.length > 0 ? Math.round((ok / checked.length) * 100) : 100;

  return {
    url, timestamp,
    totalLinks: links.length,
    checkedLinks: checked.length,
    brokenLinks: broken,
    okLinks: ok,
    skippedLinks: skipped,
    links,
    score,
  };
}
