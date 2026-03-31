export interface RobotsRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
}

export interface RobotsResult {
  url: string;
  timestamp: string;
  rules: RobotsRule[];
  sitemaps: string[];
  crawlDelay?: number;
  generated: string;
}

export function generateRobots(rules: RobotsRule[], sitemaps: string[], crawlDelay?: number): string {
  let output = "";
  rules.forEach(rule => {
    output += `User-agent: ${rule.userAgent}\n`;
    if (crawlDelay) output += `Crawl-delay: ${crawlDelay}\n`;
    rule.allow.forEach(path => { if (path) output += `Allow: ${path}\n`; });
    rule.disallow.forEach(path => { if (path) output += `Disallow: ${path}\n`; });
    output += "\n";
  });
  sitemaps.forEach(s => { if (s) output += `Sitemap: ${s}\n`; });
  return output.trim();
}

export function parseRobotsTxt(txt: string): { rules: RobotsRule[]; sitemaps: string[]; crawlDelay?: number } {
  const lines = txt.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
  const rules: RobotsRule[] = [];
  const sitemaps: string[] = [];
  let crawlDelay: number | undefined;
  let current: RobotsRule | null = null;

  lines.forEach(line => {
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const k = key.trim().toLowerCase();
    if (k === "user-agent") {
      current = { userAgent: value, allow: [], disallow: [] };
      rules.push(current);
    } else if (k === "allow" && current) {
      current.allow.push(value);
    } else if (k === "disallow" && current) {
      current.disallow.push(value);
    } else if (k === "sitemap") {
      sitemaps.push(value);
    } else if (k === "crawl-delay") {
      crawlDelay = parseInt(value) || undefined;
    }
  });

  return { rules, sitemaps, crawlDelay };
}

export const defaultRules: RobotsRule[] = [
  { userAgent: "*", allow: ["/"], disallow: ["/admin/", "/private/", "/api/"] },
];
