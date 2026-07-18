"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { conversionEvents, trackConversion } from "@/lib/conversion-analytics";

type Box = { x: number; y: number; width: number; height: number };

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 25_000_000;

export default function EditTextInProductImagePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [box, setBox] = useState<Box>({ x: 20, y: 20, width: 220, height: 90 });
  const [text, setText] = useState("Replace this text");
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState("#111827");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [align, setAlign] = useState<CanvasTextAlign>("center");
  const [dragging, setDragging] = useState(false);
  const [exported, setExported] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [inputError, setInputError] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const drawEditor = useCallback((target: HTMLCanvasElement, showGuide: boolean) => {
    if (!image) return;
    target.width = image.naturalWidth;
    target.height = image.naturalHeight;
    const ctx = target.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(image, 0, 0);
    ctx.fillStyle = fillColor;
    ctx.fillRect(box.x, box.y, box.width, box.height);
    ctx.fillStyle = textColor;
    ctx.font = "600 " + fontSize + "px Arial";
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    const x = align === "left" ? box.x + 12 : align === "right" ? box.x + box.width - 12 : box.x + box.width / 2;
    ctx.fillText(text, x, box.y + box.height / 2, Math.max(1, box.width - 24));
    if (showGuide) {
      ctx.strokeStyle = "#4f46e5";
      ctx.setLineDash([8, 5]);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.setLineDash([]);
    }
  }, [image, box, text, fontSize, textColor, fillColor, align]);

  useEffect(() => {
    if (canvasRef.current && image) drawEditor(canvasRef.current, true);
  }, [image, drawEditor]);

  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    };
  }, []);

  function loadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setInputError("");
    setExported(false);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setInputError("Choose a PNG, JPG, or other supported image file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setInputError("Image files must be 10MB or smaller.");
      return;
    }
    const next = new Image();
    const objectUrl = URL.createObjectURL(file);
    next.onload = () => {
      if (next.naturalWidth * next.naturalHeight > MAX_IMAGE_PIXELS) {
        URL.revokeObjectURL(objectUrl);
        setInputError("This image is too large to edit safely in the browser. Use an image under 25 megapixels.");
        return;
      }
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = objectUrl;
      setSourceFile(file);
      setImage(next);
      setBox({
        x: Math.round(next.naturalWidth * 0.1),
        y: Math.round(next.naturalHeight * 0.1),
        width: Math.round(next.naturalWidth * 0.8),
        height: Math.max(80, Math.round(next.naturalHeight * 0.18)),
      });
      trackConversion({
        name: conversionEvents.textEditorFileSelected,
        properties: { page_path: "/edit-text-in-product-image/", file_count_bucket: "1", result: "success" },
      });
    };
    next.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setInputError("We could not read that image. Try another file.");
    };
    next.src = objectUrl;
  }

  function moveBox(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragging || !image || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;
    setBox((current) => ({
      ...current,
      x: Math.max(0, Math.min(image.naturalWidth - current.width, (event.clientX - rect.left) * scaleX - current.width / 2)),
      y: Math.max(0, Math.min(image.naturalHeight - current.height, (event.clientY - rect.top) * scaleY - current.height / 2)),
    }));
  }

  function download(type: "png" | "jpeg") {
    if (!image) return;
    const exportCanvas = document.createElement("canvas");
    drawEditor(exportCanvas, false);
    const link = document.createElement("a");
    link.download = "editimages-product-text." + (type === "png" ? "png" : "jpg");
    link.href = exportCanvas.toDataURL("image/" + type, 0.92);
    link.click();
    setExported(true);
    trackConversion({
      name: conversionEvents.textEditorExport,
      properties: { page_path: "/edit-text-in-product-image/", format: type === "jpeg" ? "jpg" : "png", result: "success" },
    });
  }

  async function runAiEdit() {
    if (!sourceFile || aiInstruction.trim().length < 3) return;
    setAiBusy(true);
    setAiMessage("");
    const form = new FormData();
    form.append("image", sourceFile);
    form.append("operation", "replace_text");
    form.append("instruction", aiInstruction.trim());
    form.append("idempotencyKey", crypto.randomUUID());
    try {
      const response = await fetch("/api/images/edit", { method: "POST", credentials: "include", body: form });
      if (response.status === 401) {
        window.location.assign("/login/?next=/edit-text-in-product-image/");
        return;
      }
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Request failed (" + response.status + ")" }));
        throw new Error(error.error || "Request failed (" + response.status + ")");
      }
      const blob = await response.blob();
      const edited = new Image();
      const editedUrl = URL.createObjectURL(blob);
      edited.onload = () => {
        if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
        sourceUrlRef.current = editedUrl;
        setSourceFile(new File([blob], "editimages-ai-edit.jpg", { type: blob.type || "image/jpeg" }));
        setImage(edited);
        setAiMessage("AI edit completed. 1 credit was used.");
      };
      edited.onerror = () => {
        URL.revokeObjectURL(editedUrl);
        setAiMessage("The edited image could not be loaded. Any reserved credit was refunded.");
      };
      edited.src = editedUrl;
    } catch (error) {
      setAiMessage(error instanceof Error ? error.message : "AI edit failed. Any reserved credit was refunded.");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold">EditImages</Link>
          <Link href="/marketplace-image-fixer/" className="text-sm font-medium text-indigo-600">Marketplace image packs</Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Browser editor with optional AI</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Edit text in a product image</h1>
          <p className="mt-4 text-lg text-slate-600">Upload an image, position a replacement overlay, preview it live, and export PNG or JPG. Free overlay edits stay in this browser. If you choose the clearly labeled AI edit, the upload is sent only for that model call and is not stored.</p>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {image ? (
              <canvas
                ref={canvasRef}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDragging(true);
                }}
                onPointerUp={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                  setDragging(false);
                }}
                onPointerLeave={() => setDragging(false)}
                onPointerMove={moveBox}
                className="mx-auto max-h-[620px] w-full touch-none rounded-lg bg-slate-100 object-contain"
                aria-label="Product image preview with movable text overlay"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-100 text-center text-slate-500">Choose an image to start editing</div>
            )}
          </div>
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="block text-sm font-semibold">1. Upload image
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={loadImage} className="mt-2 block w-full text-sm" />
            </label>
            {inputError && <p className="mt-3 text-sm text-red-700" role="alert">{inputError}</p>}
            <label className="mt-6 block text-sm font-semibold">2. Replacement text
              <textarea value={text} onChange={(event) => setText(event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-slate-300 p-2 font-normal" />
            </label>
            <label className="mt-4 block text-sm font-semibold">Font size: {fontSize}px
              <input type="range" min="12" max="120" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="mt-2 w-full" />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">Text color<input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} className="mt-2 block h-10 w-full" /></label>
              <label className="text-sm font-semibold">Overlay color<input type="color" value={fillColor} onChange={(event) => setFillColor(event.target.value)} className="mt-2 block h-10 w-full" /></label>
            </div>
            <label className="mt-4 block text-sm font-semibold">Alignment
              <select value={align} onChange={(event) => setAlign(event.target.value as CanvasTextAlign)} className="mt-2 w-full rounded-lg border border-slate-300 p-2 font-normal">
                <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
              </select>
            </label>
            <p className="mt-6 text-xs leading-relaxed text-slate-500">Drag on the image to move the overlay area. The dashed boundary is preview-only and is never exported.</p>
            <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-950">AI image edit · 1 credit</p>
              <p className="mt-1 text-xs leading-relaxed text-indigo-800">Sign in and describe a focused edit. Your upload is sent only for this model call, is not stored, and failed calls automatically refund the reserved credit.</p>
              <label className="mt-3 block text-sm font-semibold text-indigo-950">Edit instruction
                <textarea value={aiInstruction} onChange={(event) => setAiInstruction(event.target.value)} maxLength={500} rows={3} placeholder="Replace the label text with Summer Sale while preserving the product" className="mt-2 w-full rounded-lg border border-indigo-200 bg-white p-2 font-normal" />
              </label>
              <button type="button" onClick={runAiEdit} disabled={!sourceFile || aiInstruction.trim().length < 3 || aiBusy} className="mt-3 w-full rounded-lg bg-indigo-700 px-4 py-3 font-semibold text-white disabled:bg-slate-300">{aiBusy ? "Editing securely..." : "Run AI edit · 1 credit"}</button>
              {aiMessage && <p className="mt-3 text-sm text-indigo-950" role="status">{aiMessage}</p>}
            </div>
            {exported && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Export complete. Continue to <Link href="/marketplace-image-fixer/" className="font-semibold underline">Marketplace Image Fixer</Link> to prepare this file for Amazon, Etsy, or eBay.</div>}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => download("png")} disabled={!image} className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white disabled:bg-slate-300">Export PNG</button>
              <button onClick={() => download("jpeg")} disabled={!image} className="rounded-lg border border-slate-300 px-4 py-3 font-semibold disabled:text-slate-400">Export JPG</button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
