"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Download, ImagePlus, RefreshCw, Sparkles, Wand2 } from "lucide-react";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const scenePresets = [
  ["Studio", "Place the product on a clean light-gray studio backdrop with soft even lighting."],
  ["Lifestyle", "Place the product in a bright modern lifestyle setting while keeping its shape and branding recognizable."],
  ["Seasonal", "Place the product in a tasteful seasonal scene with restrained props and clear product visibility."],
] as const;

export function AiImageGenerator() {
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [instruction, setInstruction] = useState<string>(scenePresets[0][1]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
  }, []);

  function selectFile(file: File | undefined) {
    setMessage("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Choose a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setMessage("Images must be 10MB or smaller.");
      return;
    }
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    sourceUrlRef.current = nextUrl;
    setSourceFile(file);
    setSourceUrl(nextUrl);
    setResultUrl(null);
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  }

  function loadFile(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  async function generate() {
    if (!sourceFile || instruction.trim().length < 10 || busy) return;
    setBusy(true);
    setMessage("");
    const form = new FormData();
    form.append("image", sourceFile);
    form.append("operation", "create_scene");
    form.append("instruction", instruction.trim());
    form.append("idempotencyKey", crypto.randomUUID());
    try {
      const response = await fetch("/api/images/edit", { method: "POST", credentials: "include", body: form });
      if (response.status === 401) {
        window.location.assign("/login/?next=/#ai-generator");
        return;
      }
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `Request failed (${response.status})` }));
        throw new Error(error.error || `Request failed (${response.status})`);
      }
      const blob = await response.blob();
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const nextUrl = URL.createObjectURL(blob);
      resultUrlRef.current = nextUrl;
      setResultUrl(nextUrl);
      setMessage("Scene generated. Review it before publishing or exporting.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Generation failed. Any reserved credit was refunded.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="ai-generator" className="border-y border-slate-200 bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">AI product scene generator</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Generate a new product scene from one source image</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">Upload a product photo, describe the setting, and review a real AI result. The product image is sent only for the selected generation request. One successful generation uses one credit.</p>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-slate-200 bg-slate-50 p-5">
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }}
              onDragEnter={(event) => { event.preventDefault(); setDragOver(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => { event.preventDefault(); setDragOver(false); selectFile(event.dataTransfer.files?.[0]); }}
              className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center border-2 border-dashed text-center transition ${dragOver ? "border-indigo-600 bg-indigo-50" : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40"}`}
            >
              {sourceUrl ? <img src={sourceUrl} alt="Selected product source" className="h-full w-full object-contain" /> : <><ImagePlus className="h-9 w-9 text-indigo-700" aria-hidden="true" /><span className="mt-3 font-semibold text-slate-950">Drop a product image here</span><span className="mt-1 text-sm text-slate-500">PNG, JPG, or WebP up to 10MB</span></>}
            </div>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={loadFile} className="sr-only" />
            {sourceUrl && <button type="button" onClick={() => inputRef.current?.click()} className="button-secondary mt-4 w-full">Choose another image</button>}
          </div>
          <div className="border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Wand2 className="h-4 w-4 text-indigo-700" aria-hidden="true" />Describe the scene</div>
            <div className="mt-3 flex flex-wrap gap-2">{scenePresets.map(([label, prompt]) => <button key={label} type="button" onClick={() => setInstruction(prompt)} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-800">{label}</button>)}</div>
            <label className="mt-4 block text-sm font-semibold text-slate-950">Generation prompt<textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} maxLength={600} rows={6} placeholder="Place the product on a bright bathroom counter with soft morning light." className="mt-2 w-full rounded-md border border-slate-300 p-3 font-normal" /></label>
            <button type="button" onClick={() => void generate()} disabled={!sourceFile || instruction.trim().length < 10 || busy} className="button-primary mt-4 w-full"><Sparkles className="h-4 w-4" aria-hidden="true" />{busy ? "Generating scene…" : "Generate product scene · 1 credit"}</button>
            {message && <p className="mt-3 text-sm text-slate-700" role="status">{message}</p>}
            {resultUrl && <div className="mt-5 border-t border-slate-200 pt-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-950">Generated result</p><a href={resultUrl} download="editimages-ai-product-scene.jpg" className="button-secondary px-3"><Download className="h-4 w-4" /> Download</a></div><img src={resultUrl} alt="AI-generated product scene" className="mt-3 max-h-[420px] w-full object-contain" /><button type="button" onClick={() => void generate()} disabled={busy} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"><RefreshCw className="h-4 w-4" /> Generate another variation</button></div>}
          </div>
        </div>
      </div>
    </section>
  );
}
