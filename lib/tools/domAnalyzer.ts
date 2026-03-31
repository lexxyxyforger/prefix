import { parseHtml, formatBytes } from "../utils/fetch";

export interface DomAnalyzerResult {
  url: string;
  timestamp: string;
  score: number;
  totalNodes: number;
  maxDepth: number;
  htmlSize: number;
  htmlSizeFormatted: string;
  elementCounts: { tag: string; count: number }[];
  issues: string[];
  passed: string[];
  scriptCount: number;
  styleCount: number;
  inlineStyleCount: number;
  commentCount: number;
  hasMinification: boolean;
}

function countNodes(node: Node): number {
  let count = 1;
  node.childNodes.forEach(child => { count += countNodes(child); });
  return count;
}

function maxDepth(node: Node, depth = 0): number {
  if (!node.childNodes.length) return depth;
  let max = depth;
  node.childNodes.forEach(child => { max = Math.max(max, maxDepth(child, depth + 1)); });
  return max;
}

export function runDomAnalyzer(html: string, url: string, timestamp: string): DomAnalyzerResult {
  const doc = parseHtml(html);
  const htmlSize = new Blob([html]).size;
  const issues: string[] = [];
  const passed: string[] = [];

  const total = countNodes(doc.documentElement);
  const depth = maxDepth(doc.documentElement);
  const scriptCount = doc.querySelectorAll("script").length;
  const styleCount = doc.querySelectorAll("link[rel='stylesheet'], style").length;
  const inlineStyleCount = doc.querySelectorAll("[style]").length;

  const commentRegex = /<!--[\s\S]*?-->/g;
  const comments = html.match(commentRegex) || [];
  const commentCount = comments.length;

  const tagCounts: Record<string, number> = {};
  doc.querySelectorAll("*").forEach(el => {
    const tag = el.tagName.toLowerCase();
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  const elementCounts = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tag, count]) => ({ tag, count }));

  const hasMinification = !html.includes("\n\n\n");

  if (total > 1500) {
    issues.push(`Excessive DOM size: ${total} nodes (recommended < 1500)`);
  } else {
    passed.push(`DOM size is healthy: ${total} nodes`);
  }

  if (depth > 32) {
    issues.push(`DOM depth too deep: ${depth} levels (recommended < 32)`);
  } else {
    passed.push(`DOM nesting depth is fine: ${depth} levels`);
  }

  if (htmlSize > 500 * 1024) {
    issues.push(`HTML document is large: ${formatBytes(htmlSize)}`);
  } else {
    passed.push(`HTML size is acceptable: ${formatBytes(htmlSize)}`);
  }

  if (scriptCount > 20) {
    issues.push(`Too many script tags: ${scriptCount} (try bundling)`);
  } else {
    passed.push(`Script tag count: ${scriptCount}`);
  }

  if (inlineStyleCount > 30) {
    issues.push(`Excessive inline styles: ${inlineStyleCount} elements`);
  } else {
    passed.push(`Inline styles: ${inlineStyleCount} elements`);
  }

  if (commentCount > 20) {
    issues.push(`Many HTML comments found: ${commentCount} (remove for production)`);
  }

  const errorCount = issues.length;
  const score = Math.max(0, Math.min(100, 100 - errorCount * 12));

  return {
    url, timestamp, score,
    totalNodes: total,
    maxDepth: depth,
    htmlSize, htmlSizeFormatted: formatBytes(htmlSize),
    elementCounts, issues, passed,
    scriptCount, styleCount, inlineStyleCount, commentCount, hasMinification,
  };
}
