"use client";

import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import JSZip from "jszip";
import { conversionEvents, trackConversion } from "@/lib/conversion-analytics";
import { FeedbackForm } from "@/components/sections/feedback-form";
import { Download, Eraser, ImagePlus, Languages, Plus, Redo2, RotateCcw, Sparkles, Type, Undo2, Wand2, X } from "lucide-react";

type Box = { x: number; y: number; width: number; height: number };
type AiOperation = "remove_text" | "replace_text" | "remove_owned_overlay" | "clean_product" | "replace_background" | "create_scene";
type WorkspaceMode = "remove_text" | "replace_text" | "ai_refine" | "localize";
type LanguageVariant = { id: string; language: string; text: string };
type SelectionMode = "box" | "brush";
type Point = { x: number; y: number };
type EditorSnapshot = {
  box: Box;
  brushStrokes: Point[];
  text: string;
  replacementText: string;
  fontSize: number;
  textColor: string;
  fillColor: string;
  align: CanvasTextAlign;
  selectionMode: SelectionMode;
};

const TEXT_FONT = "600 {size}px Arial, sans-serif";

function wrapText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number) {
  const paragraphs = value.replace(/\r/g, "").split("\n");
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const character of Array.from(paragraph)) {
      const candidate = line + character;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = character;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  return lines.length ? lines : [""];
}

function fitText(ctx: CanvasRenderingContext2D, value: string, box: Box, requestedSize: number) {
  const maxWidth = Math.max(1, box.width - 24);
  const maxHeight = Math.max(1, box.height - 16);
  let size = Math.max(10, requestedSize);
  let lines: string[] = [];
  while (size >= 10) {
    ctx.font = TEXT_FONT.replace("{size}", String(size));
    lines = wrapText(ctx, value, maxWidth);
    const fitsWidth = lines.every((line) => ctx.measureText(line).width <= maxWidth + 0.5);
    if (fitsWidth && (lines.length * size * 1.2 <= maxHeight || size === 10)) break;
    size -= 1;
  }
  return { size, lines, lineHeight: size * 1.2 };
}

function defaultTextBox(target: HTMLImageElement): Box {
  return {
    x: Math.round(target.naturalWidth * 0.1),
    y: Math.round(target.naturalHeight * 0.1),
    width: Math.round(target.naturalWidth * 0.8),
    height: Math.max(80, Math.round(target.naturalHeight * 0.18)),
  };
}

const aiOperations: Record<AiOperation, { label: string; description: string; placeholder: string; requiresRights: boolean }> = {
  remove_text: {
    label: "Clear text in white box",
    description: "Fill the selected box with plain white and leave it completely text-free. No AI or credit is used.",
    placeholder: "",
    requiresRights: false,
  },
  replace_text: {
    label: "Exact text replacement",
    description: "Render the final wording exactly in your browser. No AI text generation or credit is used.",
    placeholder: "Enter only the exact final wording, for example: Summer Sale",
    requiresRights: false,
  },
  remove_owned_overlay: {
    label: "Remove my overlay",
    description: "Remove a text, sticker, or price badge you own or are authorized to edit.",
    placeholder: "Remove the red 20% OFF sticker in the top-right corner",
    requiresRights: true,
  },
  clean_product: {
    label: "Clean the product",
    description: "Remove a named distraction or blemish without changing the product itself.",
    placeholder: "Remove the loose cable beside the product and keep the product unchanged",
    requiresRights: false,
  },
  replace_background: {
    label: "Change background",
    description: "Create a clean studio background or a simple setting around the product.",
    placeholder: "Replace the background with a soft light-gray studio backdrop",
    requiresRights: false,
  },
  create_scene: {
    label: "Create product scene",
    description: "Place the product in a focused lifestyle or seasonal scene while keeping it recognizable.",
    placeholder: "Place the product on a bright bathroom counter with soft morning light",
    requiresRights: false,
  },
};

const aiOperationIcons: Record<AiOperation, typeof Type> = {
  remove_text: Eraser,
  replace_text: Type,
  remove_owned_overlay: Eraser,
  clean_product: Sparkles,
  replace_background: ImagePlus,
  create_scene: Wand2,
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 25_000_000;
const languages = [
  ["en", "English"],
  ["zh-Hans", "Chinese (Simplified)"],
  ["zh-Hant", "Chinese (Traditional)"],
  ["ja", "Japanese"],
  ["ko", "Korean"],
  ["es", "Spanish"],
  ["fr", "French"],
  ["de", "German"],
] as const;

export default function EditTextInProductImagePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [box, setBox] = useState<Box>({ x: 20, y: 20, width: 220, height: 90 });
  const [text, setText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [replacementText, setReplacementText] = useState("");
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("remove_text");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [localizedText, setLocalizedText] = useState("");
  const [languageVariants, setLanguageVariants] = useState<LanguageVariant[]>([]);
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState("#111827");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [align, setAlign] = useState<CanvasTextAlign>("center");
  const [localOverlayEnabled, setLocalOverlayEnabled] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("box");
  const [brushSize, setBrushSize] = useState(56);
  const [brushStrokes, setBrushStrokes] = useState<Point[]>([]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [historyPast, setHistoryPast] = useState<EditorSnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<EditorSnapshot[]>([]);
  const [dragging, setDragging] = useState(false);
  const [exported, setExported] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [inputError, setInputError] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiOperation, setAiOperation] = useState<AiOperation>("remove_text");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const drawEditor = useCallback((target: HTMLCanvasElement, showGuide: boolean, options?: { text?: string; showOriginal?: boolean; forceOverlay?: boolean }) => {
    if (!image) return;
    const previewText = options?.text ?? text;
    const previewOriginal = options?.showOriginal ?? showOriginal;
    const overlayEnabled = options?.forceOverlay ?? localOverlayEnabled;
    target.width = image.naturalWidth;
    target.height = image.naturalHeight;
    const ctx = target.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(image, 0, 0);
    if (overlayEnabled && !previewOriginal) {
      ctx.fillStyle = fillColor;
      if (selectionMode === "brush") {
        brushStrokes.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, brushSize, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        ctx.fillRect(box.x, box.y, box.width, box.height);
      }
      if (selectionMode === "box" && previewText.trim()) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(box.x, box.y, box.width, box.height);
        ctx.clip();
        ctx.fillStyle = textColor;
        ctx.textAlign = align;
        ctx.textBaseline = "alphabetic";
        const x = align === "left" ? box.x + 12 : align === "right" ? box.x + box.width - 12 : box.x + box.width / 2;
        const layout = fitText(ctx, previewText, box, fontSize);
        const firstBaseline = box.y + (box.height - layout.lines.length * layout.lineHeight) / 2 + layout.size;
        layout.lines.forEach((line, index) => ctx.fillText(line, x, firstBaseline + index * layout.lineHeight));
        ctx.restore();
      }
    }
    if (showGuide && overlayEnabled && !previewOriginal && selectionMode === "box") {
      ctx.strokeStyle = "#4f46e5";
      ctx.setLineDash([8, 5]);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.setLineDash([]);
    }
  }, [image, box, text, fontSize, textColor, fillColor, align, localOverlayEnabled, selectionMode, brushStrokes, brushSize, showOriginal]);

  useEffect(() => {
    if (canvasRef.current && image) drawEditor(canvasRef.current, true);
  }, [image, drawEditor]);

  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    };
  }, []);

  function snapshot(): EditorSnapshot {
    return {
      box: { ...box },
      brushStrokes: brushStrokes.map((point) => ({ ...point })),
      text,
      replacementText,
      fontSize,
      textColor,
      fillColor,
      align,
      selectionMode,
    };
  }

  function restoreSnapshot(previous: EditorSnapshot) {
    setBox({ ...previous.box });
    setBrushStrokes(previous.brushStrokes.map((point) => ({ ...point })));
    setText(previous.text);
    setReplacementText(previous.replacementText);
    setFontSize(previous.fontSize);
    setTextColor(previous.textColor);
    setFillColor(previous.fillColor);
    setAlign(previous.align);
    setSelectionMode(previous.selectionMode);
    setShowOriginal(false);
  }

  function rememberHistory() {
    setHistoryPast((current) => [...current.slice(-29), snapshot()]);
    setHistoryFuture([]);
  }

  function undo() {
    const previous = historyPast[historyPast.length - 1];
    if (!previous) return;
    setHistoryPast((current) => current.slice(0, -1));
    setHistoryFuture((current) => [snapshot(), ...current].slice(0, 30));
    restoreSnapshot(previous);
  }

  function redo() {
    const next = historyFuture[0];
    if (!next) return;
    setHistoryFuture((current) => current.slice(1));
    setHistoryPast((current) => [...current.slice(-29), snapshot()]);
    restoreSnapshot(next);
  }

  function loadImageFile(file: File | undefined) {
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
      setLocalOverlayEnabled(true);
      setBox(defaultTextBox(next));
      setBrushStrokes([]);
      setHistoryPast([]);
      setHistoryFuture([]);
      setShowOriginal(false);
      setOriginalText("");
      setReplacementText("");
      setText("");
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

  function loadImage(event: ChangeEvent<HTMLInputElement>) {
    loadImageFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    loadImageFile(event.dataTransfer.files?.[0]);
  }

  function resetSelection() {
    if (!image) return;
    rememberHistory();
    setBox(defaultTextBox(image));
    setText("");
    setOriginalText("");
    setReplacementText("");
    setLocalizedText("");
    setLanguageVariants([]);
    setFontSize(32);
    setTextColor("#111827");
    setFillColor("#ffffff");
    setAlign("center");
    setSelectionMode("box");
    setBrushStrokes([]);
    setLocalOverlayEnabled(true);
    setAiOperation("remove_text");
    setAiInstruction("");
    setRightsConfirmed(false);
    setExported(false);
    setAiMessage("Selection reset. Drag the dashed box onto the white label area.");
  }

  function moveBoxToPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!image || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;
    setBox((current) => ({
      ...current,
      x: Math.max(0, Math.min(image.naturalWidth - current.width, (event.clientX - rect.left) * scaleX - current.width / 2)),
      y: Math.max(0, Math.min(image.naturalHeight - current.height, (event.clientY - rect.top) * scaleY - current.height / 2)),
    }));
  }

  function pointFromEvent(event: React.PointerEvent<HTMLCanvasElement>): Point | null {
    if (!image || !canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(image.naturalWidth, (event.clientX - rect.left) * image.naturalWidth / rect.width)),
      y: Math.max(0, Math.min(image.naturalHeight, (event.clientY - rect.top) * image.naturalHeight / rect.height)),
    };
  }

  function paintBrush(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragging || selectionMode !== "brush") return;
    const point = pointFromEvent(event);
    if (!point) return;
    setBrushStrokes((current) => {
      const last = current[current.length - 1];
      if (last && Math.hypot(last.x - point.x, last.y - point.y) < Math.max(4, brushSize / 3)) return current;
      return [...current, point];
    });
  }

  function startBrush(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    rememberHistory();
    setDragging(true);
    const point = pointFromEvent(event);
    if (point) setBrushStrokes((current) => [...current, point]);
  }

  function moveBox(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragging) return;
    moveBoxToPoint(event);
  }

  function startBoxDrag(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    rememberHistory();
    setDragging(true);
    moveBoxToPoint(event);
  }

  function resizeBox(dimension: "width" | "height", value: number) {
    if (!image) return;
    setBox((current) => {
      if (dimension === "width") {
        const width = Math.max(40, Math.min(image.naturalWidth - current.x, value));
        return { ...current, width };
      }
      const height = Math.max(32, Math.min(image.naturalHeight - current.y, value));
      return { ...current, height };
    });
  }

  function download(type: "png" | "jpeg") {
    if (!image || !localOverlayEnabled) return;
    const exportCanvas = document.createElement("canvas");
    drawEditor(exportCanvas, false, { showOriginal: false });
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

  async function exportLanguageVariants(type: "png" | "jpeg") {
    if (!image || !languageVariants.length) return;
    const zip = new JSZip();
    for (const variant of languageVariants) {
      const canvas = document.createElement("canvas");
      drawEditor(canvas, false, { text: variant.text, showOriginal: false, forceOverlay: true });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/" + type, 0.92));
      if (blob) zip.file(`editimages-${variant.language}.${type === "png" ? "png" : "jpg"}`, blob);
    }
    const archive = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(archive);
    const link = document.createElement("a");
    link.download = "editimages-language-variants.zip";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  }

  function chooseWorkspaceMode(mode: WorkspaceMode) {
    setWorkspaceMode(mode);
    setAiMessage("");
    setAiInstruction("");
    setRightsConfirmed(false);
    if (mode === "remove_text") {
      setAiOperation("remove_text");
      setSelectionMode("box");
    } else if (mode === "replace_text" || mode === "localize") {
      setAiOperation("replace_text");
      setSelectionMode("box");
    } else if (aiOperation === "remove_text" || aiOperation === "replace_text") {
      setAiOperation("clean_product");
    }
    if (mode === "localize" && !localizedText) setLocalizedText(replacementText || text);
  }

  function applyLocalizedText() {
    const value = localizedText.trim();
    if (!value) return;
    setText(value);
    setReplacementText(value);
    setSelectionMode("box");
    setLocalOverlayEnabled(true);
    setShowOriginal(false);
    setAiMessage("This language is previewed exactly in the browser. Add more languages, then export the ZIP.");
  }

  function addLanguageVariant() {
    const value = localizedText.trim();
    if (!value) return;
    setLanguageVariants((current) => {
      const existing = current.find((variant) => variant.language === targetLanguage);
      if (existing) return current.map((variant) => variant.language === targetLanguage ? { ...variant, text: value } : variant);
      return [...current, { id: crypto.randomUUID(), language: targetLanguage, text: value }];
    });
    setAiMessage("Language version added. Add another language or export the ZIP.");
  }

  function removeLanguageVariant(id: string) {
    setLanguageVariants((current) => current.filter((variant) => variant.id !== id));
  }

  async function runAiEdit() {
    const requestedText = replacementText.trim() || aiInstruction.trim();
    const inputValid = aiOperation === "remove_text" || (aiOperation === "replace_text" ? requestedText.length >= 3 : aiInstruction.trim().length >= 3);
    if (!sourceFile || !inputValid) return;
    if (aiOperation === "remove_text") {
      setText("");
      setFillColor("#ffffff");
      setLocalOverlayEnabled(true);
      setShowOriginal(false);
      setAiMessage("Text removal mode is active. Drag the outlined box over the white box, then export locally. No AI credit was used.");
      return;
    }
    if (aiOperation === "replace_text") {
      const exactText = requestedText;
      setText(exactText);
      setReplacementText(exactText);
      setSelectionMode("box");
      setBrushStrokes([]);
      setLocalOverlayEnabled(true);
      setShowOriginal(false);
      setAiMessage("Exact text mode is active. Position the outlined area, check the wording, and export locally. No AI credit was used.");
      return;
    }
    if (aiOperations[aiOperation].requiresRights && !rightsConfirmed) {
      setAiMessage("Confirm that you own or are authorized to edit this image before removing an overlay.");
      return;
    }
    setAiBusy(true);
    setAiMessage("");
    const form = new FormData();
    form.append("image", sourceFile);
    form.append("operation", aiOperation);
    form.append("instruction", aiInstruction.trim());
    if (rightsConfirmed) form.append("rightsConfirmed", "true");
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
        setBox(defaultTextBox(edited));
        setBrushStrokes([]);
        setSelectionMode("box");
        setShowOriginal(false);
        setLocalOverlayEnabled(false);
        setAiMessage("AI edit completed. 1 credit was used. Review the result before publishing.");
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

  const advancedOperations = (Object.keys(aiOperations) as AiOperation[]).filter((operation) => operation !== "remove_text" && operation !== "replace_text");

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
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">AI product image editor</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Make the product-image change you actually need</h1>
          <p className="mt-4 text-lg text-slate-600">Clear text from a white label area without generating replacement characters, or use a focused AI task for authorized overlays, cleanup, backgrounds, and scenes.</p>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {image ? (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  onPointerDown={selectionMode === "brush" ? startBrush : startBoxDrag}
                  onPointerUp={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                    setDragging(false);
                  }}
                  onPointerLeave={() => setDragging(false)}
                  onPointerMove={selectionMode === "brush" ? paintBrush : moveBox}
                  className={`mx-auto max-h-[620px] w-full touch-none rounded-lg bg-slate-100 object-contain ${selectionMode === "brush" ? "cursor-crosshair" : "cursor-move"}`}
                  aria-label={selectionMode === "brush" ? "Product image preview. Paint over the text to remove." : "Product image preview. Click or drag the dashed box onto the text area."}
                />
                <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white">{selectionMode === "brush" ? "Paint over the text to remove it" : "Click or drag the dashed box onto the white label"}</div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click(); }}
                onDragEnter={(event) => { event.preventDefault(); setDragOver(true); }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition ${dragOver ? "border-indigo-600 bg-indigo-50" : "border-slate-300 bg-slate-100 hover:border-indigo-400 hover:bg-indigo-50/50"}`}
              >
                <ImagePlus className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                <span className="mt-3 font-semibold text-slate-900">Drop an image here</span>
                <span className="mt-1 text-sm text-slate-500">or click to choose PNG, JPG, or WebP up to 10MB</span>
              </div>
            )}
          </div>
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3"><label className="text-sm font-semibold">1. Upload image<input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={loadImage} className="mt-2 block w-full text-sm" /></label>{image && <button type="button" onClick={() => fileInputRef.current?.click()} className="button-secondary shrink-0 px-3">Change image</button>}</div>
            {inputError && <p className="mt-3 text-sm text-red-700" role="alert">{inputError}</p>}
            <section className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4" aria-labelledby="workspace-heading">
              <div className="flex items-start justify-between gap-3"><div><p id="workspace-heading" className="text-sm font-semibold text-indigo-950">Choose an editing mode</p><p className="mt-1 text-xs leading-relaxed text-indigo-800">The first two modes are deterministic and free. AI refine uses 1 credit after a successful result.</p></div><Sparkles className="h-5 w-5 shrink-0 text-indigo-700" aria-hidden="true" /></div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Editing modes">
                {([["remove_text", "Remove text", Eraser], ["replace_text", "Replace text", Type], ["ai_refine", "AI refine", Sparkles], ["localize", "Localize", Languages]] as const).map(([mode, label, Icon]) => <button key={mode} type="button" role="tab" aria-selected={workspaceMode === mode} onClick={() => chooseWorkspaceMode(mode)} className={`flex min-h-14 items-center justify-center gap-2 rounded-md border px-2 py-2 text-sm font-semibold transition ${workspaceMode === mode ? "border-indigo-600 bg-white text-indigo-950 shadow-sm" : "border-indigo-100 bg-indigo-50/50 text-indigo-800 hover:border-indigo-300"}`}><Icon className="h-4 w-4" aria-hidden="true" />{label}</button>)}
              </div>

              {workspaceMode === "remove_text" && <div className="mt-4"><p className="rounded-md border border-indigo-200 bg-white p-3 text-sm leading-6 text-indigo-900">Select a box or use the brush below. The exported area is filled plain white and contains no replacement characters.</p><button type="button" onClick={() => { setAiOperation("remove_text"); void runAiEdit(); }} disabled={!sourceFile || aiBusy} className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-700 px-4 py-3 font-semibold text-white disabled:bg-slate-300"><Eraser className="h-4 w-4" /> Clear selected text</button></div>}

              {workspaceMode === "replace_text" && <div className="mt-4 space-y-3"><label className="block text-sm font-semibold text-indigo-950">Original text <span className="font-normal text-indigo-700">(optional reference)</span><input value={originalText} onChange={(event) => setOriginalText(event.target.value)} placeholder="e.g. Grand Opening" className="mt-2 w-full rounded-md border border-indigo-200 bg-white px-3 py-2.5 font-normal" /></label><label className="block text-sm font-semibold text-indigo-950">Replacement text<input value={replacementText} onFocus={rememberHistory} onChange={(event) => { setReplacementText(event.target.value); setText(event.target.value); }} placeholder="e.g. Now Closed" className="mt-2 w-full rounded-md border border-indigo-200 bg-white px-3 py-2.5 font-normal" /></label><button type="button" onClick={() => { setAiOperation("replace_text"); void runAiEdit(); }} disabled={!sourceFile || replacementText.trim().length < 3 || aiBusy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-700 px-4 py-3 font-semibold text-white disabled:bg-slate-300"><Type className="h-4 w-4" /> Apply exact replacement</button></div>}

              {workspaceMode === "ai_refine" && <div className="mt-4"><div className="grid gap-2 sm:grid-cols-2">{advancedOperations.map((operation) => { const config = aiOperations[operation]; const Icon = aiOperationIcons[operation]; return <button key={operation} type="button" onClick={() => { setAiOperation(operation); setAiInstruction(""); setRightsConfirmed(false); setAiMessage(""); }} className={`flex min-h-14 items-start gap-2 rounded-md border p-3 text-left ${aiOperation === operation ? "border-indigo-600 bg-white" : "border-indigo-100 bg-indigo-50/50 hover:border-indigo-300"}`}><Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" /><span><span className="block text-sm font-semibold text-indigo-950">{config.label}</span><span className="mt-1 block text-xs leading-5 text-indigo-800">{config.description}</span></span></button>; })}</div><label className="mt-4 block text-sm font-semibold text-indigo-950">Describe the edit<textarea value={aiInstruction} onChange={(event) => setAiInstruction(event.target.value)} maxLength={500} rows={4} placeholder={aiOperations[aiOperation].placeholder} className="mt-2 w-full rounded-md border border-indigo-200 bg-white p-3 font-normal" /></label>{aiOperations[aiOperation].requiresRights && <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-indigo-900"><input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-indigo-700" />I own this image or have permission to edit the overlay I described. This tool is not for removing third-party watermarks or branding.</label>}<button type="button" onClick={() => void runAiEdit()} disabled={!sourceFile || aiInstruction.trim().length < 3 || aiBusy || (aiOperations[aiOperation].requiresRights && !rightsConfirmed)} className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-700 px-4 py-3 font-semibold text-white disabled:bg-slate-300">{aiBusy ? "Editing securely..." : <><Sparkles className="h-4 w-4" /> Run AI refine · 1 credit</>}</button></div>}

              {workspaceMode === "localize" && <div className="mt-4"><p className="rounded-md border border-indigo-200 bg-white p-3 text-sm leading-6 text-indigo-900">Enter each final translation yourself. Every language version uses the exact browser renderer; no automatic translation is claimed.</p><div className="mt-3 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]"><label className="block text-sm font-semibold text-indigo-950">Language<select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} className="mt-2 w-full rounded-md border border-indigo-200 bg-white px-3 py-2.5 font-normal">{languages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block text-sm font-semibold text-indigo-950">Final localized text<input value={localizedText} onFocus={rememberHistory} onChange={(event) => setLocalizedText(event.target.value)} placeholder="Enter the exact wording for this language" className="mt-2 w-full rounded-md border border-indigo-200 bg-white px-3 py-2.5 font-normal" /></label></div><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={applyLocalizedText} disabled={!sourceFile || localizedText.trim().length < 1} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-indigo-700 px-3 py-2 font-semibold text-white disabled:bg-slate-300"><Type className="h-4 w-4" /> Preview language</button><button type="button" onClick={addLanguageVariant} disabled={!localizedText.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-indigo-300 px-3 py-2 font-semibold text-indigo-900 disabled:text-slate-400"><Plus className="h-4 w-4" /> Add to ZIP</button></div>{languageVariants.length > 0 && <div className="mt-4 space-y-2">{languageVariants.map((variant) => <div key={variant.id} className="flex items-center justify-between gap-3 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm"><span className="min-w-0 truncate"><strong>{languages.find(([value]) => value === variant.language)?.[1] || variant.language}:</strong> {variant.text}</span><button type="button" onClick={() => removeLanguageVariant(variant.id)} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label={`Remove ${variant.language} version`}><X className="h-4 w-4" /></button></div>)}<button type="button" onClick={() => void exportLanguageVariants("png")} disabled={!image || !languageVariants.length} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-indigo-700 px-3 py-2 font-semibold text-white disabled:bg-slate-300"><Download className="h-4 w-4" /> Export language ZIP</button></div>}</div>}
              {aiMessage && <p className="mt-3 text-sm text-indigo-950" role="status">{aiMessage}</p>}
            </section>
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4" aria-labelledby="local-edit-heading">
              <label className="flex items-start gap-2 text-sm font-semibold text-slate-900"><input type="checkbox" checked={localOverlayEnabled} onChange={(event) => setLocalOverlayEnabled(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-indigo-700" /><span><span id="local-edit-heading" className="block">Fine-tune the local result</span><span className="mt-1 block text-xs font-normal leading-5 text-slate-500">Use the box or brush to define exactly which pixels change. Nothing is uploaded.</span></span></label>
              {localOverlayEnabled && <div className="mt-4">
                <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => { rememberHistory(); setSelectionMode("box"); }} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${selectionMode === "box" ? "border-indigo-600 bg-indigo-50 text-indigo-900" : "border-slate-300 text-slate-700"}`}><RotateCcw className="h-4 w-4" /> Box select</button><button type="button" onClick={() => { rememberHistory(); setSelectionMode("brush"); setText(""); setReplacementText(""); }} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${selectionMode === "brush" ? "border-indigo-600 bg-indigo-50 text-indigo-900" : "border-slate-300 text-slate-700"}`}><Sparkles className="h-4 w-4" /> Brush select</button></div>
                {selectionMode === "brush" && <div className="mt-3"><label className="block text-sm font-semibold">Brush size: {brushSize}px<input type="range" min="8" max="180" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} className="mt-2 w-full" /></label><button type="button" onClick={() => { rememberHistory(); setBrushStrokes([]); }} disabled={!brushStrokes.length} className="mt-2 text-sm font-semibold text-indigo-700 disabled:text-slate-400">Clear brush strokes</button></div>}
                <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={undo} disabled={!historyPast.length} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:text-slate-400"><Undo2 className="h-4 w-4" /> Undo</button><button type="button" onClick={redo} disabled={!historyFuture.length} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:text-slate-400"><Redo2 className="h-4 w-4" /> Redo</button></div>
                <button type="button" onClick={() => setShowOriginal((current) => !current)} disabled={!image} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-900 disabled:text-slate-400">{showOriginal ? "Show edited preview" : "Show original preview"}</button>
                    {selectionMode === "box" && <label className="mt-4 block text-sm font-semibold">Replacement text <span className="font-normal text-slate-500">(leave blank to remove it)</span><textarea value={text} onFocus={rememberHistory} onChange={(event) => { setText(event.target.value); setReplacementText(event.target.value); }} rows={3} placeholder="Leave blank for a text-free white box" className="mt-2 w-full rounded-lg border border-slate-300 p-2 font-normal" /></label>}
                <label className="mt-4 block text-sm font-semibold">Font size: {fontSize}px<input type="range" min="12" max="120" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="mt-2 w-full" /></label>
                {image && <div className="mt-4 grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Overlay width: {Math.round(box.width)}px<input type="range" min="40" max={image.naturalWidth} value={Math.round(box.width)} onChange={(event) => resizeBox("width", Number(event.target.value))} className="mt-2 w-full" /></label><label className="text-sm font-semibold">Overlay height: {Math.round(box.height)}px<input type="range" min="32" max={image.naturalHeight} value={Math.round(box.height)} onChange={(event) => resizeBox("height", Number(event.target.value))} className="mt-2 w-full" /></label></div>}
                <div className="mt-4 grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Text color<input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} className="mt-2 block h-10 w-full" /></label><label className="text-sm font-semibold">Overlay color<input type="color" value={fillColor} onChange={(event) => setFillColor(event.target.value)} className="mt-2 block h-10 w-full" /></label></div>
                <label className="mt-4 block text-sm font-semibold">Alignment<select value={align} onChange={(event) => setAlign(event.target.value as CanvasTextAlign)} className="mt-2 w-full rounded-lg border border-slate-300 p-2 font-normal"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">Drag on the image to move the overlay area. The dashed boundary is preview-only and is never exported.</p>
              </div>}
            </section>
            {exported && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Export complete. Continue to <Link href="/marketplace-image-fixer/" className="font-semibold underline">Marketplace Image Fixer</Link> to prepare this file for Amazon, Etsy, or eBay.</div>}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => download("png")} disabled={!image || !localOverlayEnabled} className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white disabled:bg-slate-300">Export local PNG</button>
              <button onClick={() => download("jpeg")} disabled={!image || !localOverlayEnabled} className="rounded-lg border border-slate-300 px-4 py-3 font-semibold disabled:text-slate-400">Export local JPG</button>
            </div>
            <button type="button" onClick={resetSelection} disabled={!image || aiBusy} className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:text-slate-400">Reset selection</button>
          </aside>
        </div>
      </section>
      <FeedbackForm />
    </main>
  );
}
