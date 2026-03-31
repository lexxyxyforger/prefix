import { parseHtml } from "../utils/fetch";

export interface LazyCheckResult {
  url: string;
  timestamp: string;
  score: number;
  totalImages: number;
  lazyImages: number;
  eagerImages: number;
  iframeTotal: number;
  lazyIframes: number;
  totalVideos: number;
  lazyVideos: number;
  issues: string[];
  passed: string[];
  items: { tag: string; src: string; loading: string; isLazy: boolean }[];
}

export function runLazyChecker(html: string, url: string, timestamp: string): LazyCheckResult {
  const doc = parseHtml(html);
  const issues: string[] = [];
  const passed: string[] = [];
  const items: LazyCheckResult["items"] = [];

  const imgs = Array.from(doc.querySelectorAll("img"));
  const iframes = Array.from(doc.querySelectorAll("iframe"));
  const videos = Array.from(doc.querySelectorAll("video"));

  let lazyImages = 0, eagerImages = 0;
  imgs.forEach(img => {
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    const loading = img.getAttribute("loading") || "eager";
    const isLazy = loading === "lazy" || img.hasAttribute("data-src");
    if (isLazy) lazyImages++; else eagerImages++;
    items.push({ tag: "img", src: src.slice(0, 60), loading, isLazy });
  });

  let lazyIframes = 0;
  iframes.forEach(iframe => {
    const src = iframe.getAttribute("src") || "";
    const loading = iframe.getAttribute("loading") || "eager";
    const isLazy = loading === "lazy";
    if (isLazy) lazyIframes++;
    items.push({ tag: "iframe", src: src.slice(0, 60), loading, isLazy });
  });

  let lazyVideos = 0;
  videos.forEach(v => {
    const preload = v.getAttribute("preload") || "auto";
    const isLazy = preload === "none" || preload === "metadata";
    if (isLazy) lazyVideos++;
    items.push({ tag: "video", src: "", loading: preload, isLazy });
  });

  if (eagerImages > 3) {
    issues.push(`${eagerImages} images loaded eagerly — add loading="lazy" to below-fold images`);
  } else {
    passed.push(`${lazyImages} images use lazy loading`);
  }

  if (iframes.length > 0 && lazyIframes < iframes.length) {
    issues.push(`${iframes.length - lazyIframes} iframes not lazy loaded`);
  } else if (iframes.length > 0) {
    passed.push("All iframes use lazy loading");
  }

  if (videos.length > 0 && lazyVideos < videos.length) {
    issues.push(`${videos.length - lazyVideos} videos without preload='none' or 'metadata'`);
  }

  const totalMediaElements = imgs.length + iframes.length + videos.length;
  const lazyTotal = lazyImages + lazyIframes + lazyVideos;
  const score = totalMediaElements === 0 ? 100 : Math.round((lazyTotal / totalMediaElements) * 100);

  return {
    url, timestamp, score,
    totalImages: imgs.length, lazyImages, eagerImages,
    iframeTotal: iframes.length, lazyIframes,
    totalVideos: videos.length, lazyVideos,
    issues, passed, items,
  };
}
