import { parseHtml } from "../utils/fetch";

export interface MetaTag {
  name: string;
  content: string;
  status: "good" | "warning" | "missing";
  note: string;
}

export interface MetaAnalyzerResult {
  url: string;
  timestamp: string;
  score: number;
  tags: MetaTag[];
  ogTags: MetaTag[];
  twitterTags: MetaTag[];
  rawTags: { name: string; content: string }[];
}

export function runMetaAnalyzer(html: string, url: string, timestamp: string): MetaAnalyzerResult {
  const doc = parseHtml(html);
  const get = (sel: string, attr = "content") => doc.querySelector(sel)?.getAttribute(attr)?.trim() || "";

  const tags: MetaTag[] = [];
  const ogTags: MetaTag[] = [];
  const twitterTags: MetaTag[] = [];

  const rawTags: { name: string; content: string }[] = [];
  doc.querySelectorAll("meta").forEach(m => {
    const n = m.getAttribute("name") || m.getAttribute("property") || m.getAttribute("http-equiv") || "";
    const c = m.getAttribute("content") || "";
    if (n) rawTags.push({ name: n, content: c });
  });

  const title = doc.querySelector("title")?.textContent?.trim() || "";
  tags.push({
    name: "title",
    content: title,
    status: title && title.length >= 10 && title.length <= 60 ? "good" : title ? "warning" : "missing",
    note: title ? (title.length < 10 ? "Too short" : title.length > 60 ? "Too long (>60 chars)" : "Optimal length") : "No title tag found",
  });

  const metaFields: { sel: string; label: string; min?: number; max?: number }[] = [
    { sel: 'meta[name="description"]', label: "description", min: 50, max: 160 },
    { sel: 'meta[name="keywords"]', label: "keywords" },
    { sel: 'meta[name="robots"]', label: "robots" },
    { sel: 'meta[name="viewport"]', label: "viewport" },
    { sel: 'meta[name="author"]', label: "author" },
    { sel: 'meta[charset]', label: "charset" },
    { sel: 'meta[http-equiv="content-type"]', label: "content-type" },
    { sel: 'link[rel="canonical"]', label: "canonical", },
  ];

  metaFields.forEach(({ sel, label, min, max }) => {
    const el = doc.querySelector(sel);
    const content = el?.getAttribute("content") || el?.getAttribute("href") || el?.getAttribute("charset") || "";
    let status: MetaTag["status"] = "missing";
    let note = "Not found";
    if (content) {
      if (min && content.length < min) { status = "warning"; note = `Too short (${content.length} chars, min ${min})`; }
      else if (max && content.length > max) { status = "warning"; note = `Too long (${content.length} chars, max ${max})`; }
      else { status = "good"; note = "Present"; }
    }
    tags.push({ name: label, content, status, note });
  });

  const ogFields = ["og:title", "og:description", "og:image", "og:url", "og:type", "og:site_name"];
  ogFields.forEach(prop => {
    const content = get(`meta[property="${prop}"]`);
    ogTags.push({
      name: prop,
      content,
      status: content ? "good" : "missing",
      note: content ? "Present" : "Missing",
    });
  });

  const twFields = ["twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:site"];
  twFields.forEach(prop => {
    const content = get(`meta[name="${prop}"]`) || get(`meta[property="${prop}"]`);
    twitterTags.push({
      name: prop,
      content,
      status: content ? "good" : prop === "twitter:card" ? "missing" : "warning",
      note: content ? "Present" : "Missing",
    });
  });

  const allTags = [...tags, ...ogTags, ...twitterTags];
  const good = allTags.filter(t => t.status === "good").length;
  const score = Math.round((good / allTags.length) * 100);

  return { url, timestamp, score, tags, ogTags, twitterTags, rawTags };
}
