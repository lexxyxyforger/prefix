"use client";
import { useState, useCallback } from "react";

import Header from "@/components/ui/Header";
import ScanBar from "@/components/ui/ScanBar";
import SummaryBanner from "@/components/ui/SummaryBanner";

import SeoAuditTool from "@/components/tools/SeoAuditTool";
import MetaAnalyzerTool from "@/components/tools/MetaAnalyzerTool";
import BrokenLinkTool from "@/components/tools/BrokenLinkTool";
import ImageOptimizerTool from "@/components/tools/ImageOptimizerTool";
import CriticalCssTool from "@/components/tools/CriticalCssTool";
import DomAnalyzerTool from "@/components/tools/DomAnalyzerTool";
import CwvCheckerTool from "@/components/tools/CwvCheckerTool";
import LazyCheckerTool from "@/components/tools/LazyCheckerTool";
import RobotsGeneratorTool from "@/components/tools/RobotsGeneratorTool";
import SitemapGeneratorTool from "@/components/tools/SitemapGeneratorTool";

import { normalizeUrl, fetchWithProxy, timestamp } from "@/lib/utils/fetch";
import { saveHistory, loadHistory } from "@/lib/utils/storage";

import { runSeoAudit, SeoAuditResult } from "@/lib/tools/seoAudit";
import { runMetaAnalyzer, MetaAnalyzerResult } from "@/lib/tools/metaAnalyzer";
import { extractLinks, buildBrokenLinkResult, BrokenLinkResult } from "@/lib/tools/brokenLinks";
import { runImageOptimizer, ImageOptimizerResult } from "@/lib/tools/imageOptimizer";
import { runCriticalCssGenerator, CriticalCssResult } from "@/lib/tools/criticalCss";
import { runDomAnalyzer, DomAnalyzerResult } from "@/lib/tools/domAnalyzer";
import { runCwvChecker, CwvResult } from "@/lib/tools/cwvChecker";
import { runLazyChecker, LazyCheckResult } from "@/lib/tools/lazyChecker";
import { extractSitemapUrls, generateSitemapXml, SitemapResult } from "@/lib/tools/sitemapGenerator";

interface ScanState {
  seoAudit: SeoAuditResult | null;
  metaAnalyzer: MetaAnalyzerResult | null;
  brokenLinks: BrokenLinkResult | null;
  imageOptimizer: ImageOptimizerResult | null;
  criticalCss: CriticalCssResult | null;
  domAnalyzer: DomAnalyzerResult | null;
  cwvChecker: CwvResult | null;
  lazyChecker: LazyCheckResult | null;
  sitemap: SitemapResult | null;
}

const initialState: ScanState = {
  seoAudit: null, metaAnalyzer: null, brokenLinks: null,
  imageOptimizer: null, criticalCss: null, domAnalyzer: null,
  cwvChecker: null, lazyChecker: null, sitemap: null,
};

interface LoadingState {
  seoAudit: boolean; metaAnalyzer: boolean; brokenLinks: boolean;
  imageOptimizer: boolean; criticalCss: boolean; domAnalyzer: boolean;
  cwvChecker: boolean; lazyChecker: boolean; sitemap: boolean;
}

const allFalse: LoadingState = {
  seoAudit: false, metaAnalyzer: false, brokenLinks: false,
  imageOptimizer: false, criticalCss: false, domAnalyzer: false,
  cwvChecker: false, lazyChecker: false, sitemap: false,
};

const allTrue: LoadingState = {
  seoAudit: true, metaAnalyzer: true, brokenLinks: true,
  imageOptimizer: true, criticalCss: true, domAnalyzer: true,
  cwvChecker: true, lazyChecker: true, sitemap: true,
};

export default function Dashboard() {
  const [results, setResults] = useState<ScanState>(initialState);
  const [loading, setLoading] = useState<LoadingState>(allFalse);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scannedUrl, setScannedUrl] = useState("");
  const [scanTimestamp, setScanTimestamp] = useState("");

  const setResult = useCallback(<K extends keyof ScanState>(key: K, value: ScanState[K]) => {
    setResults(prev => ({ ...prev, [key]: value }));
    setLoading(prev => ({ ...prev, [key]: false }));
  }, []);

  const handleScan = useCallback(async (rawUrl: string) => {
    let url: string;
    try { url = normalizeUrl(rawUrl); } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid URL");
      return;
    }

    setError(null);
    setScanning(true);
    setProgress(0);
    setResults(initialState);
    setLoading(allTrue);
    setScannedUrl(url);
    const ts = timestamp();
    setScanTimestamp(ts);

    try {
      setCurrentStep("Fetching page…");
      setProgress(5);

      const { html, responseTime, contentLength } = await fetchWithProxy(url);

      setProgress(20);
      setCurrentStep("Running SEO audit…");

      const seoResult = runSeoAudit(html, url, responseTime, contentLength, ts);
      setResult("seoAudit", seoResult);
      saveHistory("perfkit-seo-audit", seoResult);
      setProgress(32);

      setCurrentStep("Analyzing meta tags…");
      const metaResult = runMetaAnalyzer(html, url, ts);
      setResult("metaAnalyzer", metaResult);
      saveHistory("perfkit-meta", metaResult);
      setProgress(44);

      setCurrentStep("Checking images…");
      const imgResult = runImageOptimizer(html, url, ts);
      setResult("imageOptimizer", imgResult);
      saveHistory("perfkit-images", imgResult);
      setProgress(52);

      setCurrentStep("Analyzing DOM…");
      const domResult = runDomAnalyzer(html, url, ts);
      setResult("domAnalyzer", domResult);
      saveHistory("perfkit-dom", domResult);
      setProgress(60);

      setCurrentStep("Checking Core Web Vitals…");
      const cwvResult = runCwvChecker(html, url, responseTime, contentLength, ts);
      setResult("cwvChecker", cwvResult);
      saveHistory("perfkit-cwv", cwvResult);
      setProgress(68);

      setCurrentStep("Checking lazy loading…");
      const lazyResult = runLazyChecker(html, url, ts);
      setResult("lazyChecker", lazyResult);
      saveHistory("perfkit-lazy", lazyResult);
      setProgress(76);

      setCurrentStep("Generating critical CSS report…");
      const cssResult = runCriticalCssGenerator(html, url, ts);
      setResult("criticalCss", cssResult);
      saveHistory("perfkit-css", cssResult);
      setProgress(82);

      setCurrentStep("Generating sitemap…");
      const sitemapUrls = extractSitemapUrls(html, url);
      const xml = generateSitemapXml(sitemapUrls);
      const sitemapResult: SitemapResult = { url, timestamp: ts, urls: sitemapUrls, xml, totalUrls: sitemapUrls.length };
      setResult("sitemap", sitemapResult);
      saveHistory("perfkit-sitemap", sitemapResult);
      setProgress(90);

    setCurrentStep("Checking links…");
      const rawLinks = extractLinks(html, url);
      const checkedLinks = await Promise.all(
        rawLinks.slice(0, 15).map(async link => {
          try {
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(link.href)}`;
            const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
            const code = res.status;
            return { ...link, status: code >= 200 && code < 400 ? "ok" as const : "broken" as const, statusCode: code };
          } catch {
            return { ...link, status: "skipped" as const };
          }
        })
      );
      
      const remaining = rawLinks.slice(15).map(l => ({ ...l, status: "skipped" as const }));
      const allLinks = [...checkedLinks, ...remaining];
      const brokenResult = buildBrokenLinkResult(url, ts, allLinks);
      setResult("brokenLinks", brokenResult);
      saveHistory("perfkit-links", brokenResult);
      setProgress(100);

      setCurrentStep("Scan complete!");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch page. The site may block CORS requests.");
      setLoading(allFalse);
    } finally {
      setScanning(false);
    }
  }, [setResult]);

  const scores = [
    results.seoAudit && { label: "SEO", score: results.seoAudit.score },
    results.metaAnalyzer && { label: "Meta", score: results.metaAnalyzer.score },
    results.cwvChecker && { label: "CWV", score: results.cwvChecker.score },
    results.imageOptimizer && { label: "Images", score: results.imageOptimizer.score },
    results.lazyChecker && { label: "Lazy", score: results.lazyChecker.score },
  ].filter(Boolean) as { label: string; score: number }[];

  const hasScan = scores.length > 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight">
            SEO & Performance Dashboard
          </h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            10 tools in one scan — zero backend, all results stored locally
          </p>
        </div>

        <ScanBar onScan={handleScan} loading={scanning} progress={progress} currentStep={currentStep} />

        {error && (
          <div className="bg-danger-500/8 border border-danger-500/20 rounded-2xl p-4 flex items-start gap-3 animate-slide-up">
            <span className="text-danger-500 text-lg shrink-0">⚠</span>
            <div>
              <p className="text-sm font-semibold text-danger-500">Scan Error</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{error}</p>
              <p className="text-xs text-zinc-400 mt-1">Try a different URL or check if the site allows external requests.</p>
            </div>
          </div>
        )}

        {hasScan && (
          <SummaryBanner url={scannedUrl} scores={scores} timestamp={scanTimestamp} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <SeoAuditTool result={results.seoAudit} loading={loading.seoAudit} />
          <MetaAnalyzerTool result={results.metaAnalyzer} loading={loading.metaAnalyzer} />
          <BrokenLinkTool result={results.brokenLinks} loading={loading.brokenLinks} />
          <ImageOptimizerTool result={results.imageOptimizer} loading={loading.imageOptimizer} />
          <CriticalCssTool result={results.criticalCss} loading={loading.criticalCss} />
          <DomAnalyzerTool result={results.domAnalyzer} loading={loading.domAnalyzer} />
          <CwvCheckerTool result={results.cwvChecker} loading={loading.cwvChecker} />
          <LazyCheckerTool result={results.lazyChecker} loading={loading.lazyChecker} />
          <RobotsGeneratorTool url={scannedUrl} />
          <SitemapGeneratorTool result={results.sitemap} loading={loading.sitemap} />
        </div>

        {!hasScan && !scanning && (
          <div className="text-center py-16 text-zinc-300 dark:text-zinc-700">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-base font-medium text-zinc-400 dark:text-zinc-500">Enter a URL above and click Scan</p>
            <p className="text-xs text-zinc-300 dark:text-zinc-700 mt-1">All 10 tools will run simultaneously</p>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-100 dark:border-zinc-800 mt-16 py-6 text-center text-[11px] text-zinc-300 dark:text-zinc-700">
        PerfKit · All analysis runs client-side · History saved to localStorage
      </footer>
    </div>
  );
}
