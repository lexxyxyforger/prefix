import { parseHtml } from "../utils/fetch";

export interface CriticalCssResult {
  url: string;
  timestamp: string;
  score: number;
  inlineStyles: string[];
  linkedStylesheets: string[];
  criticalSnippet: string;
  recommendations: string[];
  issues: string[];
  hasInlineCritical: boolean;
  styleTagCount: number;
  externalCssCount: number;
}

export function runCriticalCssGenerator(html: string, url: string, timestamp: string): CriticalCssResult {
  const doc = parseHtml(html);
  const issues: string[] = [];
  const recommendations: string[] = [];

  const styleTags = Array.from(doc.querySelectorAll("style"));
  const inlineStyles = styleTags.map(s => s.textContent?.trim() || "").filter(Boolean);

  const linkedStylesheets = Array.from(doc.querySelectorAll("link[rel='stylesheet']"))
    .map(l => l.getAttribute("href") || "")
    .filter(Boolean);

  const hasInlineCritical = inlineStyles.length > 0 && inlineStyles.some(s => s.length > 100);

  const criticalProperties = [
    "font-family", "font-size", "color", "background", "display", "position",
    "width", "height", "margin", "padding", "flex", "grid"
  ];

  const criticalRules: string[] = [];
  inlineStyles.forEach(css => {
    const rules = css.split("}").map(r => r.trim()).filter(Boolean);
    rules.forEach(rule => {
      const hasCritical = criticalProperties.some(p => rule.includes(p));
      if (hasCritical && rule.length < 300) criticalRules.push(rule + "}");
    });
  });

  const criticalSnippet = criticalRules.slice(0, 10).join("\n") ||
    "/* Scan a page with actual CSS to generate critical snippet */\nbody { margin: 0; }\n* { box-sizing: border-box; }";

  if (!hasInlineCritical && linkedStylesheets.length > 0) {
    issues.push("No critical CSS inlined — first paint may be delayed");
    recommendations.push("Inline critical above-the-fold CSS in <style> tags");
  }

  if (linkedStylesheets.length > 3) {
    issues.push(`${linkedStylesheets.length} external stylesheets — consider bundling`);
    recommendations.push("Bundle stylesheets and load non-critical CSS asynchronously");
  }

  if (linkedStylesheets.length > 0) {
    recommendations.push("Use rel='preload' for critical stylesheets");
    recommendations.push("Load non-critical CSS with media='print' onload trick");
  }

  if (inlineStyles.length > 0) {
    recommendations.push("Minify inline style tags for smaller HTML payload");
  }

  recommendations.push("Consider using CSS containment (contain: layout) for performance");

  const score = hasInlineCritical && linkedStylesheets.length <= 3
    ? 85
    : !hasInlineCritical && linkedStylesheets.length > 0
    ? 40
    : 70;

  return {
    url, timestamp, score,
    inlineStyles, linkedStylesheets, criticalSnippet,
    recommendations, issues,
    hasInlineCritical, styleTagCount: styleTags.length,
    externalCssCount: linkedStylesheets.length,
  };
}
