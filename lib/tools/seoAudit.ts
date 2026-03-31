import { parseHtml, formatBytes } from "../utils/fetch";

export interface SeoIssue {
  type: "error" | "warning" | "info";
  title: string;
  detail: string;
  fix: string;
}

export interface SeoAuditResult {
  url: string;
  timestamp: string;
  score: number;
  responseTime: number;
  pageSize: number;
  issues: SeoIssue[];
  passed: string[];
  meta: {
    title: string;
    titleLen: number;
    description: string;
    descLen: number;
    canonical: string;
    robots: string;
    viewport: string;
    ogTitle: string;
    ogDesc: string;
    ogImage: string;
    h1Count: number;
    h1Text: string;
    wordCount: number;
    imagesTotal: number;
    imagesNoAlt: number;
    linksInternal: number;
    linksExternal: number;
    hasSchema: boolean;
    lang: string;
  };
}

export function runSeoAudit(html: string, url: string, responseTime: number, pageSize: number, timestamp: string): SeoAuditResult {
  const doc = parseHtml(html);
  const issues: SeoIssue[] = [];
  const passed: string[] = [];

  const title = doc.querySelector("title")?.textContent?.trim() || "";
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() || "";
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href")?.trim() || "";
  const robots = doc.querySelector('meta[name="robots"]')?.getAttribute("content")?.trim() || "";
  const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute("content")?.trim() || "";
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute("content")?.trim() || "";
  const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content")?.trim() || "";
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content")?.trim() || "";
  const lang = doc.documentElement.getAttribute("lang")?.trim() || "";
  const h1Els = doc.querySelectorAll("h1");
  const h1Text = h1Els[0]?.textContent?.trim() || "";
  const bodyText = doc.body?.innerText || doc.body?.textContent || "";
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  const allImages = doc.querySelectorAll("img");
  const imagesNoAlt = Array.from(allImages).filter(img => !img.getAttribute("alt")).length;
  const allLinks = doc.querySelectorAll("a[href]");
  let linksInternal = 0, linksExternal = 0;
  try {
    const base = new URL(url);
    allLinks.forEach(a => {
      const href = a.getAttribute("href") || "";
      if (href.startsWith("http")) {
        try { new URL(href).hostname === base.hostname ? linksInternal++ : linksExternal++; } catch { linksInternal++; }
      } else if (href && !href.startsWith("#") && !href.startsWith("mailto:")) {
        linksInternal++;
      }
    });
  } catch {}
  const hasSchema = html.includes("application/ld+json");

  if (!title) {
    issues.push({ type: "error", title: "Missing Title Tag", detail: "Page has no <title> element", fix: "Add a descriptive title tag between 10–60 characters" });
  } else if (title.length < 10) {
    issues.push({ type: "warning", title: "Title Too Short", detail: `Title is only ${title.length} chars: "${title}"`, fix: "Expand title to 10–60 characters with primary keyword" });
  } else if (title.length > 60) {
    issues.push({ type: "warning", title: "Title Too Long", detail: `Title is ${title.length} chars, will be truncated in SERPs`, fix: "Shorten title to under 60 characters" });
  } else {
    passed.push("Title tag length is optimal");
  }

  if (!desc) {
    issues.push({ type: "error", title: "Missing Meta Description", detail: "No meta description found", fix: "Add meta description with 120–160 characters summarizing the page" });
  } else if (desc.length < 50) {
    issues.push({ type: "warning", title: "Meta Description Too Short", detail: `Description is ${desc.length} chars`, fix: "Expand to 120–160 characters" });
  } else if (desc.length > 160) {
    issues.push({ type: "warning", title: "Meta Description Too Long", detail: `Description is ${desc.length} chars`, fix: "Shorten to 120–160 characters" });
  } else {
    passed.push("Meta description length is optimal");
  }

  if (!canonical) {
    issues.push({ type: "warning", title: "Missing Canonical URL", detail: "No canonical link found", fix: "Add <link rel='canonical' href='...'> to prevent duplicate content" });
  } else {
    passed.push("Canonical URL is set");
  }

  if (!viewport) {
    issues.push({ type: "error", title: "Missing Viewport Meta", detail: "No viewport meta tag", fix: "Add <meta name='viewport' content='width=device-width, initial-scale=1'>" });
  } else {
    passed.push("Viewport meta tag is present");
  }

  if (h1Els.length === 0) {
    issues.push({ type: "error", title: "Missing H1 Tag", detail: "No H1 heading found on page", fix: "Add exactly one H1 tag with the primary keyword" });
  } else if (h1Els.length > 1) {
    issues.push({ type: "warning", title: "Multiple H1 Tags", detail: `Found ${h1Els.length} H1 tags`, fix: "Use only one H1 per page" });
  } else {
    passed.push("Single H1 tag present");
  }

  if (imagesNoAlt > 0) {
    issues.push({ type: "warning", title: `${imagesNoAlt} Images Missing Alt Text`, detail: `${imagesNoAlt} of ${allImages.length} images have no alt attribute`, fix: "Add descriptive alt text to all images for accessibility and SEO" });
  } else if (allImages.length > 0) {
    passed.push("All images have alt text");
  }

  if (!ogTitle || !ogImage) {
    issues.push({ type: "warning", title: "Incomplete Open Graph Tags", detail: "og:title or og:image missing", fix: "Add og:title, og:description, og:image, og:url for social sharing" });
  } else {
    passed.push("Open Graph tags are present");
  }

  if (!lang) {
    issues.push({ type: "warning", title: "Missing lang Attribute", detail: "HTML element has no lang attribute", fix: "Add lang='en' (or appropriate language) to <html>" });
  } else {
    passed.push(`Language attribute set to "${lang}"`);
  }

  if (!hasSchema) {
    issues.push({ type: "info", title: "No Structured Data", detail: "No JSON-LD schema markup found", fix: "Add schema.org markup (Article, Product, Organization, etc.) to enhance SERP appearance" });
  } else {
    passed.push("Structured data (JSON-LD) found");
  }

  if (responseTime > 3000) {
    issues.push({ type: "error", title: "Slow Server Response", detail: `Page loaded in ${responseTime}ms`, fix: "Optimize server response time, use CDN, and enable caching" });
  } else if (responseTime > 1500) {
    issues.push({ type: "warning", title: "Moderate Response Time", detail: `${responseTime}ms response time`, fix: "Aim for under 1500ms server response time" });
  } else {
    passed.push(`Fast response time: ${responseTime}ms`);
  }

  if (pageSize > 1024 * 1024) {
    issues.push({ type: "warning", title: "Large Page Size", detail: `Page HTML is ${formatBytes(pageSize)}`, fix: "Reduce HTML size, minify CSS/JS, and compress assets" });
  } else {
    passed.push(`Page HTML size is ${formatBytes(pageSize)}`);
  }

  if (wordCount < 300) {
    issues.push({ type: "warning", title: "Low Word Count", detail: `Only ~${wordCount} words detected`, fix: "Aim for at least 300–500 words of quality content" });
  } else {
    passed.push(`Content length: ~${wordCount} words`);
  }

  const errorCount = issues.filter(i => i.type === "error").length;
  const warnCount = issues.filter(i => i.type === "warning").length;
  const total = errorCount * 15 + warnCount * 7;
  const score = Math.max(0, Math.min(100, 100 - total));

  return {
    url, timestamp, score, responseTime, pageSize, issues, passed,
    meta: {
      title, titleLen: title.length, description: desc, descLen: desc.length,
      canonical, robots, viewport, ogTitle, ogDesc, ogImage,
      h1Count: h1Els.length, h1Text, wordCount,
      imagesTotal: allImages.length, imagesNoAlt,
      linksInternal, linksExternal, hasSchema, lang,
    },
  };
}
