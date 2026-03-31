import { parseHtml, formatBytes } from "../utils/fetch";

export interface CwvResult {
  url: string;
  timestamp: string;
  score: number;
  responseTime: number;
  estimatedLcp: string;
  estimatedCls: string;
  estimatedFid: string;
  ttfbMs: number;
  renderBlocking: { src: string; type: "script" | "style" }[];
  issues: string[];
  passed: string[];
  pageSize: number;
  pageSizeFormatted: string;
}

export function runCwvChecker(html: string, url: string, responseTime: number, pageSize: number, timestamp: string): CwvResult {
  const doc = parseHtml(html);
  const issues: string[] = [];
  const passed: string[] = [];

  const renderBlocking: CwvResult["renderBlocking"] = [];

  doc.querySelectorAll("script:not([async]):not([defer]):not([type='module'])").forEach(s => {
    const src = s.getAttribute("src");
    if (src) renderBlocking.push({ src: src.slice(0, 80), type: "script" });
  });

  doc.querySelectorAll("link[rel='stylesheet']").forEach(l => {
    const href = l.getAttribute("href") || "";
    renderBlocking.push({ src: href.slice(0, 80), type: "style" });
  });

  const ttfbMs = responseTime;
  let lcpScore = "Good";
  let clsScore = "Good";
  let fidScore = "Good";

  if (ttfbMs > 800) {
    issues.push(`High TTFB: ${ttfbMs}ms (Google threshold: < 800ms)`);
    lcpScore = ttfbMs > 1800 ? "Poor" : "Needs Improvement";
  } else {
    passed.push(`TTFB is healthy: ${ttfbMs}ms`);
  }

  if (renderBlocking.length > 3) {
    issues.push(`${renderBlocking.length} render-blocking resources detected`);
    lcpScore = "Needs Improvement";
  } else if (renderBlocking.length > 0) {
    issues.push(`${renderBlocking.length} render-blocking resources (minor impact)`);
  } else {
    passed.push("No critical render-blocking resources");
  }

  const heroImg = doc.querySelector("img");
  if (heroImg && !heroImg.getAttribute("fetchpriority")) {
    issues.push("Hero image missing fetchpriority='high' attribute");
  }

  const hasViewport = !!doc.querySelector('meta[name="viewport"]');
  if (!hasViewport) {
    issues.push("Missing viewport meta — can cause CLS on mobile");
    clsScore = "Poor";
  } else {
    passed.push("Viewport meta prevents CLS");
  }

  const undimensionedImgs = doc.querySelectorAll("img:not([width]):not([height])").length;
  if (undimensionedImgs > 0) {
    issues.push(`${undimensionedImgs} images without width/height — can cause CLS`);
    clsScore = "Needs Improvement";
  } else {
    passed.push("All images have explicit dimensions");
  }

  if (pageSize > 1024 * 1024) {
    issues.push(`Large page weight: ${formatBytes(pageSize)} impacts LCP`);
  } else {
    passed.push(`Page weight: ${formatBytes(pageSize)}`);
  }

  const errorCount = issues.length;
  const score = Math.max(0, Math.min(100, 100 - errorCount * 10));

  return {
    url, timestamp, score,
    responseTime, ttfbMs,
    estimatedLcp: lcpScore,
    estimatedCls: clsScore,
    estimatedFid: fidScore,
    renderBlocking, issues, passed,
    pageSize, pageSizeFormatted: formatBytes(pageSize),
  };
}
