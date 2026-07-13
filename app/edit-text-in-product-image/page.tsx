"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Box = { x: number; y: number; width: number; height: number };

export default function EditTextInProductImagePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [box, setBox] = useState<Box>({ x: 20, y: 20, width: 220, height: 90 });
  const [text, setText] = useState("Replace this text");
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState("#111827");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [align, setAlign] = useState<CanvasTextAlign>("center");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    ctx.fillStyle = fillColor;
    ctx.fillRect(box.x, box.y, box.width, box.height);
    ctx.fillStyle = textColor;
    ctx.font = `600 ${fontSize}px Arial`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    const x = align === "left" ? box.x + 12 : align === "right" ? box.x + box.width - 12 : box.x + box.width / 2;
    ctx.fillText(text, x, box.y + box.height / 2, box.width - 24);
    ctx.strokeStyle = "#4f46e5";
    ctx.setLineDash([8, 5]);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.setLineDash([]);
  }, [image, box, text, fontSize, textColor, fillColor, align]);

  function loadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const next = new Image();
    next.onload = () => {
      setImage(next);
      setBox({ x: Math.round(next.naturalWidth * 0.1), y: Math.round(next.naturalHeight * 0.1), width: Math.round(next.naturalWidth * 0.8), height: Math.max(80, Math.round(next.naturalHeight * 0.18)) });
    };
    next.src = URL.createObjectURL(file);
  }

  function moveBox(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragging || !image || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;
    setBox((current) => ({ ...current, x: Math.max(0, Math.min(image.naturalWidth - current.width, (event.clientX - rect.left) * scaleX - current.width / 2)), y: Math.max(0, Math.min(image.naturalHeight - current.height, (event.clientY - rect.top) * scaleY - current.height / 2)) }));
  }

  function download(type: "png" | "jpeg") {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `editimages-product-text.${type === "png" ? "png" : "jpg"}`;
    link.href = canvas.toDataURL(`image/${type}`, 0.92);
    link.click();
  }

  return <main className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"><Link href="/" className="font-semibold">EditImages</Link><Link href="/marketplace-image-fixer/" className="text-sm font-medium text-indigo-600">Marketplace image packs</Link></div></header><section className="mx-auto max-w-6xl px-4 py-12"><div className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Local browser tool</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Edit text in a product image</h1><p className="mt-4 text-lg text-slate-600">Upload an image, position a replacement overlay, preview it live, and export PNG or JPG. Your image stays in this browser; this MVP does not promise automatic font or background restoration.</p></div><div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><canvas ref={canvasRef} onPointerDown={() => setDragging(true)} onPointerUp={() => setDragging(false)} onPointerLeave={() => setDragging(false)} onPointerMove={moveBox} className="mx-auto max-h-[620px] w-full rounded-lg bg-slate-100 object-contain" />{!image && <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-100 text-center text-slate-500">Choose an image to start editing</div>}</div><aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><label className="block text-sm font-semibold">1. Upload image<input type="file" accept="image/*" onChange={loadImage} className="mt-2 block w-full text-sm" /></label><label className="mt-6 block text-sm font-semibold">2. Replacement text<textarea value={text} onChange={(event) => setText(event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-slate-300 p-2 font-normal" /></label><label className="mt-4 block text-sm font-semibold">Font size: {fontSize}px<input type="range" min="12" max="120" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="mt-2 w-full" /></label><div className="mt-4 grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Text color<input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} className="mt-2 block h-10 w-full" /></label><label className="text-sm font-semibold">Overlay color<input type="color" value={fillColor} onChange={(event) => setFillColor(event.target.value)} className="mt-2 block h-10 w-full" /></label></div><label className="mt-4 block text-sm font-semibold">Alignment<select value={align} onChange={(event) => setAlign(event.target.value as CanvasTextAlign)} className="mt-2 w-full rounded-lg border border-slate-300 p-2 font-normal"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label><p className="mt-4 text-xs leading-relaxed text-slate-500">Drag on the image to move the overlay area. The dashed boundary is included only in the preview and is not exported.</p><div className="mt-6 grid grid-cols-2 gap-3"><button onClick={() => download("png")} disabled={!image} className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white disabled:bg-slate-300">Export PNG</button><button onClick={() => download("jpeg")} disabled={!image} className="rounded-lg border border-slate-300 px-4 py-3 font-semibold disabled:text-slate-400">Export JPG</button></div></aside></div></section></main>;
}
