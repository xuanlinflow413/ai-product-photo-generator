"use client";
/* eslint-disable @next/next/no-img-element -- previews are blob URLs created in the browser. */

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { conversionEvents, fileCountBucket, platformSelection, trackConversion } from "@/lib/conversion-analytics";
import {
  marketplaceOutputName,
  marketplaceRules,
  MarketplacePlatform,
  isNewPackEvent,
  selectMarketplaceFiles,
  selectionMessage,
} from "@/lib/marketplace-pack";
import {
  Archive,
  Check,
  Download,
  FileImage,
  Info,
  Loader2,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

type Platform = MarketplacePlatform;
type ProcessedImage = {
  name: string;
  url: string;
  width: number;
  height: number;
  size: number;
  format: string;
  warnings: string[];
};

const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 25_000_000;

function readImage(file: File) {
  const url = URL.createObjectURL(file);
  return new Promise<{ image: HTMLImageElement; url: string }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.name}`));
    };
    image.src = url;
  });
}

async function processImage(file: File, platform: Platform, index: number): Promise<ProcessedImage> {
  const rule = marketplaceRules[platform];
  const { image, url } = await readImage(file);
  try {
    if (image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS) {
      throw new Error(`${file.name} is larger than the 25 megapixel browser limit.`);
    }
    const canvas = document.createElement("canvas");
    canvas.width = rule.size;
    canvas.height = rule.size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available in this browser");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, rule.size, rule.size);
    const scale = Math.min(rule.size / image.naturalWidth, rule.size / image.naturalHeight);
    const width = Math.round(image.naturalWidth * scale);
    const height = Math.round(image.naturalHeight * scale);
    context.drawImage(image, Math.round((rule.size - width) / 2), Math.round((rule.size - height) / 2), width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) throw new Error(`Could not process ${file.name}`);
    return {
      name: marketplaceOutputName(file.name, index),
      url: URL.createObjectURL(blob),
      width: rule.size,
      height: rule.size,
      size: blob.size,
      format: "image/jpeg",
      warnings: ["White canvas added; no background removal or AI editing applied."],
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const emptyProcessedImages = (): Record<Platform, ProcessedImage[]> => ({ Amazon: [], Etsy: [], eBay: [] });

function revokeProcessedImages(images: Record<Platform, ProcessedImage[]>) {
  for (const platformImages of Object.values(images)) {
    for (const image of platformImages) URL.revokeObjectURL(image.url);
  }
}

export default function MarketplaceImageFixerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>(["Amazon", "Etsy", "eBay"]);
  const [processed, setProcessed] = useState<Record<Platform, ProcessedImage[]>>(emptyProcessedImages);
  const [status, setStatus] = useState<"idle" | "processing" | "ready">("idle");
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<"checking" | "anonymous" | "authenticated">("checking");
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const exportedPackRef = useRef<string | null>(null);
  const processingRunRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requested = new URLSearchParams(window.location.search).get("platform")?.toLowerCase();
      const platform = requested === "amazon" ? "Amazon" : requested === "etsy" ? "Etsy" : requested === "ebay" ? "eBay" : null;
      if (platform) setPlatforms([platform]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    api<{ authenticated: boolean }>("/api/auth/session")
      .then((value) => setAccount(value.authenticated ? "authenticated" : "anonymous"))
      .catch(() => setAccount("anonymous"));
  }, []);

  useEffect(() => () => revokeProcessedImages(processed), [processed]);

  useEffect(() => () => {
    processingRunRef.current += 1;
  }, []);

  const totalOutputs = useMemo(() => platforms.reduce((sum, platform) => sum + processed[platform].length, 0), [platforms, processed]);

  function addFiles(incoming: FileList | File[]) {
    processingRunRef.current += 1;
    const selection = selectMarketplaceFiles(files, Array.from(incoming));
    const totalBytes = selection.files.reduce((sum, file) => sum + file.size, 0);
    setFiles(selection.files);
    if (selection.accepted.length > 0) trackConversion({ name: conversionEvents.marketplaceFilesSelected, properties: { page_path: "/marketplace-image-fixer/", file_count_bucket: fileCountBucket(selection.files.length), result: "success" } });
    setProcessed(emptyProcessedImages());
    setStatus("idle");
    setExportComplete(false);
    exportedPackRef.current = null;
    setError(totalBytes > MAX_TOTAL_BYTES ? "Keep one batch at or below 50MB total." : selectionMessage(selection.invalidCount, selection.overflowCount));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  }

  function removeFile(index: number) {
    processingRunRef.current += 1;
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setStatus("idle");
    setProcessed(emptyProcessedImages());
    setExportComplete(false);
    exportedPackRef.current = null;
  }

  function togglePlatform(platform: Platform) {
    processingRunRef.current += 1;
    setPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);
    setStatus("idle");
    setProcessed(emptyProcessedImages());
    setError(null);
    setExportComplete(false);
    exportedPackRef.current = null;
  }

  async function process() {
    if (!files.length || !platforms.length) return;
    if (files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_BYTES) {
      setError("Keep one batch at or below 50MB total.");
      return;
    }
    const run = processingRunRef.current + 1;
    processingRunRef.current = run;
    const selectedFiles = [...files];
    const selectedPlatforms = [...platforms];
    setStatus("processing");
    setError(null);
    setExportComplete(false);
    setProcessed(emptyProcessedImages());
    const next = emptyProcessedImages();
    try {
      for (const platform of selectedPlatforms) {
        const results = await Promise.allSettled(selectedFiles.map((file, index) => processImage(file, platform, index)));
        next[platform] = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
        const failure = results.find((result): result is PromiseRejectedResult => result.status === "rejected");
        if (failure) throw failure.reason;
        if (processingRunRef.current !== run) {
          revokeProcessedImages(next);
          return;
        }
      }
      setProcessed(next);
      setStatus("ready");
      exportedPackRef.current = null;
      trackConversion({ name: conversionEvents.marketplacePackPrepared, properties: { page_path: "/marketplace-image-fixer/", platform_selection: platformSelection(selectedPlatforms), file_count_bucket: fileCountBucket(selectedFiles.length), result: "success" } });
    } catch (processingError) {
      revokeProcessedImages(next);
      if (processingRunRef.current !== run) return;
      setError(processingError instanceof Error ? processingError.message : "Processing failed. Try another image.");
      setStatus("idle");
    }
  }

  async function downloadZip() {
    if (exporting || status !== "ready") return;
    setExporting(true);
    setError(null);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const manifest = {
        generatedAt: new Date().toISOString(),
        platforms: platforms.map((platform) => ({ platform, rule: marketplaceRules[platform], files: processed[platform].map(({ name, width, height, format, warnings }) => ({ name, width, height, format, warnings })) })),
        limitations: ["Local browser processing only.", "Canvas resize and white canvas only; no background removal, generative scene creation, or visual compliance verdict."],
      };
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      for (const platform of platforms) {
        for (const image of processed[platform]) {
          const response = await fetch(image.url);
          if (!response.ok) throw new Error("Prepared image unavailable");
          zip.folder(marketplaceRules[platform].folder)?.file(image.name, await response.blob());
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      if (!blob.size) throw new Error("Empty ZIP");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "marketplace-image-pack.zip";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportComplete(true);
      const packKey = `${platformSelection(platforms)}:${files.length}:${processed[platforms[0]].map((image) => image.url).join("|")}`;
      if (isNewPackEvent(exportedPackRef.current, packKey)) {
        trackConversion({ name: conversionEvents.marketplaceZipExport, properties: { page_path: "/marketplace-image-fixer/", platform_selection: platformSelection(platforms), file_count_bucket: fileCountBucket(files.length), result: "success" } });
        exportedPackRef.current = packKey;
      }
    } catch {
      setError("ZIP export failed. Your prepared previews are still available; try the download again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="font-semibold text-slate-900">EditImages</Link>
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2"><Link href="/edit-text-in-product-image/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Edit product image text</Link><Link href={account === "authenticated" ? "/account/" : "/login/?next=/marketplace-image-fixer/"} className="text-sm font-medium text-slate-700">{account === "authenticated" ? "Account" : "Sign in"}</Link></div>
        </div>
      </header>
      <section className="border-b border-slate-200 bg-white px-4 py-12 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm font-semibold text-indigo-700">One local batch, multiple marketplace outputs</p>
          <h1 className="max-w-4xl text-4xl font-bold sm:text-5xl">Prepare Amazon, Etsy and eBay image packs at once</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">Turn one source batch into separate JPG folders, a manifest, and one organized ZIP. Choose only the marketplace packs you need.</p>
          <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:gap-5"><span className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> Files are processed in your browser</span><span className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> Best fit: 2–25 images for 2+ marketplaces</span></div>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600">One image or one marketplace still works. Need the full workflow? <Link href="/resize-product-images-for-marketplaces/" className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-900">Read the multi-marketplace resizing guide</Link>.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_.9fr]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold">1. Add product images</h2><span className="text-sm text-slate-500">{files.length}/25 files</span></div>
            <div role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); document.getElementById("marketplace-files")?.click(); } }} onDrop={handleDrop} onDragOver={(event) => event.preventDefault()} onClick={() => document.getElementById("marketplace-files")?.click()} className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
              <Upload className="mx-auto h-8 w-8 text-indigo-600" /><p className="mt-3 font-medium">Drop images here or choose files</p><p className="mt-1 text-xs text-slate-500">PNG, JPG, or WebP up to 10MB each. Nothing is uploaded.</p>
              <input id="marketplace-files" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} />
            </div>
            {files.length > 0 && (
              <ul className="mt-4 min-w-0 max-w-full divide-y divide-slate-100 overflow-hidden">
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="flex min-w-0 max-w-full items-center justify-between gap-2 overflow-hidden py-3 text-sm">
                    <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                      <FileImage className="h-4 w-4 shrink-0 text-slate-400" />
                      <span title={file.name} className="min-w-0 flex-1 truncate">{file.name}</span>
                      <span className="shrink-0 text-xs text-slate-400">{Math.round(file.size / 1024)} KB</span>
                    </span>
                    <button type="button" aria-label={`Remove ${file.name}`} onClick={(event) => { event.stopPropagation(); removeFile(index); }} className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-500 hover:text-red-600">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><h2 className="text-xl font-semibold">2. Choose marketplace packs</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{(Object.keys(marketplaceRules) as Platform[]).map((platform) => <label key={platform} className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border p-4 ${platforms.includes(platform) ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200"}`}><input type="checkbox" checked={platforms.includes(platform)} onChange={() => togglePlatform(platform)} className="mt-1 h-4 w-4 shrink-0 accent-indigo-600" /><span><span className="block font-medium">{platform}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{marketplaceRules[platform].note}</span></span></label>)}</div>{platforms.length === 0 && <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-amber-800"><Info className="mt-1 h-4 w-4 shrink-0" /> Select at least one marketplace to continue.</p>}<button disabled={!files.length || !platforms.length || status === "processing"} onClick={process} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-700 px-4 py-3 text-center font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">{status === "processing" ? <><Loader2 className="h-5 w-5 shrink-0 animate-spin" /> <span>Preparing local previews...</span></> : "Prepare marketplace image packs"}</button>{error && <p role="alert" className="mt-3 text-sm leading-6 text-red-700">{error}</p>}</div>
        </div>
        <aside className="min-w-0 h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center gap-3"><Archive className="h-5 w-5 shrink-0 text-indigo-700" /><h2 className="text-xl font-semibold">3. Review and export</h2></div>
          {status === "idle" && <p className="mt-4 text-sm leading-relaxed text-slate-600">Prepared previews, output counts, and the folder manifest will appear here. Your selected files and marketplaces stay available if preparation needs to be retried.</p>}
          {status === "processing" && <p role="status" className="mt-4 flex items-start gap-2 text-sm leading-6 text-slate-600"><Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-indigo-700" /> Building previews in this browser. Keep this tab open.</p>}
          {status === "ready" && (
            <>
              <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><strong>{totalOutputs} files ready.</strong> Each selected marketplace has its own folder. Review the previews before export.</div>
              <div className="mt-5 space-y-4">
                {platforms.map((platform) => (
                  <div key={platform}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm font-medium"><span>{platform}</span><span className="shrink-0 text-slate-500">{processed[platform].length} files</span></div>
                    <div className="grid grid-cols-4 gap-2">{processed[platform].slice(0, 4).map((image) => <img key={image.name} src={image.url} alt={`${platform} preview of ${image.name}`} className="aspect-square min-w-0 w-full rounded-md border border-slate-200 object-contain" />)}</div>
                  </div>
                ))}
              </div>
              <button disabled={exporting} onClick={downloadZip} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:bg-emerald-300">
                {exporting ? <><Loader2 className="h-5 w-5 shrink-0 animate-spin" /> Building local ZIP...</> : <><Download className="h-5 w-5 shrink-0" /> Download organized ZIP</>}
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-slate-500">Includes separate platform folders and manifest.json. Generated locally; upload manually after review.</p>
              {exportComplete && account !== "checking" && (
                <div role="status" className="mt-5 border-t border-emerald-200 pt-5">
                  <p className="flex items-start gap-2 text-sm font-semibold text-emerald-900"><Check className="mt-0.5 h-4 w-4 shrink-0" /> ZIP download started successfully.</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {account === "authenticated"
                      ? "Need AI edits or cloud exports for the next batch? Review your credits and Seller plan."
                      : "Need AI edits or cloud exports for the next batch? Sign in to receive 2 one-time welcome credits. No payment method is required."}
                  </p>
                  <Link
                    href={account === "authenticated" ? "/account/" : "/login/?next=/marketplace-image-fixer/"}
                    onClick={() => trackConversion({
                      name: conversionEvents.seoPrimaryCtaClick,
                      properties: {
                        page_path: "/marketplace-image-fixer/",
                        source_page: "/marketplace-image-fixer/",
                        cta_id: account === "authenticated" ? "marketplace_export_account" : "marketplace_export_sign_in",
                      },
                    })}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-900 transition hover:border-indigo-400 hover:text-indigo-700"
                  >
                    {account === "authenticated" ? "View credits and Seller plan" : "Sign in for 2 welcome credits"}
                  </Link>
                  <p className="mt-2 text-center text-xs leading-5 text-slate-500">Local marketplace packs stay free and do not use credits.</p>
                </div>
              )}
            </>
          )}
        </aside>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-14"><div className="border-y border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950"><strong>Preparation only:</strong> These presets do not check or guarantee marketplace approval. Review current listing requirements, inspect every output, and upload the files manually. ZIP generation remains free and runs entirely in your browser. Credits apply only to eligible AI editing actions, not this local ZIP workflow. {account === "authenticated" ? <Link href="/account/" className="font-semibold underline">View your account.</Link> : <Link href="/login/?next=/marketplace-image-fixer/" className="font-semibold underline">Sign in to view your account.</Link>}</div></section>
    </main>
  );
}
