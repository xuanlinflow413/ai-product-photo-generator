"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
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
  Loader2,
  ShieldCheck,
  Sparkles,
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

function readImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not read ${file.name}`));
    image.src = URL.createObjectURL(file);
  });
}

async function processImage(file: File, platform: Platform, index: number): Promise<ProcessedImage> {
  const rule = marketplaceRules[platform];
  const image = await readImage(file);
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
  URL.revokeObjectURL(image.src);
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
}

export default function MarketplaceImageFixerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>(["Amazon", "Etsy", "eBay"]);
  const [processed, setProcessed] = useState<Record<Platform, ProcessedImage[]>>({ Amazon: [], Etsy: [], eBay: [] });
  const [status, setStatus] = useState<"idle" | "processing" | "ready">("idle");
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<"checking" | "anonymous" | "authenticated">("checking");
  const [exporting, setExporting] = useState(false);
  const exportedPackRef = useRef<string | null>(null);

  useEffect(() => {
    api<{ authenticated: boolean }>("/api/auth/session")
      .then((value) => setAccount(value.authenticated ? "authenticated" : "anonymous"))
      .catch(() => setAccount("anonymous"));
  }, []);

  useEffect(() => () => {
    for (const images of Object.values(processed)) {
      for (const image of images) URL.revokeObjectURL(image.url);
    }
  }, [processed]);

  const totalOutputs = useMemo(() => platforms.reduce((sum, platform) => sum + processed[platform].length, 0), [platforms, processed]);

  function addFiles(incoming: FileList | File[]) {
    const selection = selectMarketplaceFiles(files, Array.from(incoming));
    setFiles(selection.files);
    if (selection.accepted.length > 0) trackConversion({ name: conversionEvents.marketplaceFilesSelected, properties: { page_path: "/marketplace-image-fixer/", file_count_bucket: fileCountBucket(selection.files.length), result: "success" } });
    setProcessed({ Amazon: [], Etsy: [], eBay: [] });
    setStatus("idle");
    exportedPackRef.current = null;
    setError(selectionMessage(selection.invalidCount, selection.overflowCount));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setStatus("idle");
    setProcessed({ Amazon: [], Etsy: [], eBay: [] });
    exportedPackRef.current = null;
  }

  function togglePlatform(platform: Platform) {
    setPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);
    setStatus("idle");
    setProcessed({ Amazon: [], Etsy: [], eBay: [] });
    setError(null);
    exportedPackRef.current = null;
  }

  async function process() {
    if (!files.length || !platforms.length) return;
    setStatus("processing");
    setError(null);
    try {
      const next = { Amazon: [], Etsy: [], eBay: [] } as Record<Platform, ProcessedImage[]>;
      for (const platform of platforms) next[platform] = await Promise.all(files.map((file, index) => processImage(file, platform, index)));
      setProcessed(next);
      setStatus("ready");
      exportedPackRef.current = null;
      trackConversion({ name: conversionEvents.marketplacePackPrepared, properties: { page_path: "/marketplace-image-fixer/", platform_selection: platformSelection(platforms), file_count_bucket: fileCountBucket(files.length), result: "success" } });
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Processing failed. Try another image.");
      setStatus("idle");
    }
  }

  async function downloadZip() {
    if (exporting || status !== "ready") return;
    setExporting(true);
    setError(null);
    try {
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
      URL.revokeObjectURL(url);
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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold text-slate-900">EditImages</Link>
          <div className="flex items-center gap-4"><Link href="/edit-text-in-product-image/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Edit product image text</Link><Link href={account==="authenticated"?"/account/":"/login/"} className="text-sm font-medium text-slate-700">{account==="authenticated"?"Account":"Sign in"}</Link></div>
        </div>
      </header>
      <section className="border-b border-slate-200 bg-white px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-indigo-600"><Sparkles className="h-4 w-4" /> Marketplace workflow MVP</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Upload once. Get marketplace-ready image packs.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">Prepare a local batch of product images for Amazon, Etsy, and eBay, then download organized platform folders in one ZIP.</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Files stay in your browser</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Deterministic resize and format checks</span></div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">1. Add product images</h2><span className="text-sm text-slate-500">{files.length}/25 files</span></div>
            <div onDrop={handleDrop} onDragOver={(event) => event.preventDefault()} onClick={() => document.getElementById("marketplace-files")?.click()} className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">
              <Upload className="mx-auto h-8 w-8 text-indigo-600" /><p className="mt-3 font-medium">Drop images here or choose files</p><p className="mt-1 text-xs text-slate-500">PNG, JPG, or WebP up to 10MB each. Nothing is uploaded.</p>
              <input id="marketplace-files" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} />
            </div>
            {files.length > 0 && <ul className="mt-4 divide-y divide-slate-100">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between py-3 text-sm"><span className="flex min-w-0 items-center gap-2"><FileImage className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{file.name}</span><span className="shrink-0 text-xs text-slate-400">{Math.round(file.size / 1024)} KB</span></span><button aria-label={`Remove ${file.name}`} onClick={(event) => { event.stopPropagation(); removeFile(index); }} className="p-1 text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button></li>)}</ul>}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold">2. Choose marketplace packs</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{(Object.keys(marketplaceRules) as Platform[]).map((platform) => <label key={platform} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${platforms.includes(platform) ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200"}`}><input type="checkbox" checked={platforms.includes(platform)} onChange={() => togglePlatform(platform)} className="mt-1 h-4 w-4 accent-indigo-600" /><span><span className="block font-medium">{platform}</span><span className="mt-1 block text-xs text-slate-500">{marketplaceRules[platform].note}</span></span></label>)}</div><button disabled={!files.length || !platforms.length || status === "processing"} onClick={process} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">{status === "processing" ? <><Loader2 className="h-5 w-5 animate-spin" /> Checking and preparing files...</> : "Prepare marketplace pack"}</button>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}</div>
        </div>
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Archive className="h-5 w-5 text-indigo-600" /><h2 className="text-xl font-semibold">3. Review and export</h2></div>{status === "idle" && <p className="mt-4 text-sm leading-relaxed text-slate-600">Your processed previews and folder manifest will appear here after preparation.</p>}{status === "ready" && <><div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800"><strong>{totalOutputs} files ready.</strong> Each selected marketplace has its own folder.</div><div className="mt-5 space-y-4">{platforms.map((platform) => <div key={platform}><div className="mb-2 flex items-center justify-between text-sm font-medium"><span>{platform}</span><span className="text-slate-500">{processed[platform].length} files</span></div><div className="grid grid-cols-4 gap-2">{processed[platform].slice(0, 4).map((image) => <img key={image.name} src={image.url} alt={`${platform} preview of ${image.name}`} className="aspect-square w-full rounded-md border border-slate-200 object-contain" />)}</div></div>)}</div><button disabled={exporting} onClick={downloadZip} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:bg-emerald-300">{exporting ? <><Loader2 className="h-5 w-5 animate-spin" /> Building ZIP...</> : <><Download className="h-5 w-5" /> Download ZIP</>}</button><p className="mt-3 text-center text-xs text-slate-500">Includes platform folders and manifest.json. Generated locally.</p></>}</aside>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-14"><div className="border-y border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900"><strong>Free local export:</strong> ZIP generation remains free and runs entirely in your browser. Account credits are reserved for future server-side export workflows and are only deducted after a successful server-confirmed operation. {account==="authenticated"?<Link href="/account/" className="font-semibold underline">View account and checkout availability.</Link>:<Link href="/login/" className="font-semibold underline">Sign in to view the development billing preview.</Link>}</div></section>
    </main>
  );
}
