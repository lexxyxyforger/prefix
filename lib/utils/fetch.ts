const PROXIES = [
  (url: string) => ({ url: `/api/proxy?url=${encodeURIComponent(url)}`, json: false }),
  (url: string) => ({ url: `https://corsproxy.io/?${encodeURIComponent(url)}`, json: false }),
  (url: string) => ({ url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, json: true }),
];

export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) throw new Error("URL cannot be empty");
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    new URL(url);
    return url;
  } catch {
    throw new Error("Invalid URL format");
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export async function fetchWithProxy(url: string): Promise<{ html: string; responseTime: number; status: number; contentLength: number }> {
  const start = performance.now();
  let lastError: Error = new Error("All proxies failed");

  for (const buildProxy of PROXIES) {
    try {
      const { url: proxyUrl, json } = buildProxy(url);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const responseTime = Math.round(performance.now() - start);

      let html = "";
      let status = 200;

      if (json) {
        const data = await res.json();
        html = data.contents || "";
        status = data.status?.http_code || 200;
      } else {
        html = await res.text();
      }

      const contentLength = new Blob([html]).size;
      return { html, responseTime, status, contentLength };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError;
}

export function parseHtml(html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function timestamp(): string {
  return new Date().toISOString();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function scoreColor(score: number): string {
  if (score >= 80) return "text-success-500";
  if (score >= 50) return "text-warn-500";
  return "text-danger-500";
}

export function scoreRingColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 50) return "#f97316";
  return "#ef4444";
}

export function scoreBg(score: number): string {
  if (score >= 80) return "bg-success-500/10 text-success-500";
  if (score >= 50) return "bg-warn-500/10 text-warn-500";
  return "bg-danger-500/10 text-danger-500";
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Good";
  if (score >= 50) return "Needs Work";
  return "Poor";
}