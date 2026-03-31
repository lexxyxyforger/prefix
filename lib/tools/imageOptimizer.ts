import { parseHtml, formatBytes } from "../utils/fetch";

export interface ImageInfo {
  src: string;
  alt: string;
  hasAlt: boolean;
  loading: string;
  width: string;
  height: string;
  hasDimensions: boolean;
  issues: string[];
  recommendations: string[];
}

export interface ImageOptimizerResult {
  url: string;
  timestamp: string;
  score: number;
  totalImages: number;
  issues: number;
  images: ImageInfo[];
  summary: {
    noAlt: number;
    noLazy: number;
    noDimensions: number;
    noWebp: number;
  };
}

export function runImageOptimizer(html: string, url: string, timestamp: string): ImageOptimizerResult {
  const doc = parseHtml(html);
  const imgEls = Array.from(doc.querySelectorAll("img"));
  const images: ImageInfo[] = [];

  let noAlt = 0, noLazy = 0, noDimensions = 0, noWebp = 0;

  imgEls.forEach(img => {
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    const alt = img.getAttribute("alt") || "";
    const hasAlt = img.hasAttribute("alt") && alt.length > 0;
    const loading = img.getAttribute("loading") || "";
    const width = img.getAttribute("width") || "";
    const height = img.getAttribute("height") || "";
    const hasDimensions = !!(width && height);
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!hasAlt) { issues.push("Missing alt text"); recommendations.push("Add descriptive alt attribute"); noAlt++; }
    if (loading !== "lazy") { issues.push("Not lazy loaded"); recommendations.push("Add loading='lazy' attribute"); noLazy++; }
    if (!hasDimensions) { issues.push("Missing width/height"); recommendations.push("Specify width and height to prevent CLS"); noDimensions++; }
    const srcLower = src.toLowerCase();
    if (src && !srcLower.includes(".webp") && !srcLower.includes(".avif")) {
      issues.push("Not using modern format");
      recommendations.push("Convert to WebP or AVIF for better compression");
      noWebp++;
    }
    if (src && !src.startsWith("data:")) {
      images.push({ src: src.length > 80 ? src.slice(0, 80) + "…" : src, alt, hasAlt, loading, width, height, hasDimensions, issues, recommendations });
    }
  });

  const totalIssues = images.reduce((a, i) => a + i.issues.length, 0);
  const maxIssues = images.length * 4;
  const score = images.length === 0 ? 100 : Math.max(0, Math.round(100 - (totalIssues / Math.max(maxIssues, 1)) * 100));

  return {
    url, timestamp, score,
    totalImages: images.length,
    issues: totalIssues,
    images,
    summary: { noAlt, noLazy, noDimensions, noWebp },
  };
}
