import { Eraser, ImagePlus, Type } from "lucide-react";
import Link from "next/link";

const workflows = [
  [Type, "Text removal and exact overlay", "Clear a white label", "Remove every character inside a white box, or render replacement wording exactly in the browser without spending a credit.", "/edit-text-in-product-image/"],
  [ImagePlus, "AI background and scene", "Generate a product scene", "Upload one product image, describe a scene, and review a real AI-generated result before publishing.", "/#ai-generator"],
  [Eraser, "Marketplace pack export", "Prepare listing files", "After review, prepare Amazon, Etsy, and eBay JPG folders with a local ZIP and manifest.", "/marketplace-image-fixer/"],
] as const;

export function ToolWorkspace() {
  return (
    <section id="workflows" className="bg-slate-50 px-4 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Focused product image work</p><h2 className="mt-2 text-3xl font-bold text-slate-900">Make the change, then prepare the listing files</h2><p className="mt-3 text-slate-600">Start with exact browser text replacement or the AI edit that matches the image task. Use marketplace preparation only after the image is ready to review and export.</p></div>
        <div className="grid gap-5 md:grid-cols-3">
          {workflows.map(([Icon, eyebrow, title, description, href]) => (
            <Link key={title} href={href} className="rounded-lg border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md"><Icon className="h-5 w-5 text-indigo-700" aria-hidden="true" /><p className="mt-4 text-sm font-semibold text-indigo-700">{eyebrow}</p><h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p></Link>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600">Need platform dimensions first? Read the <Link href="/resize-product-images-for-marketplaces/" className="font-semibold text-indigo-700 hover:text-indigo-900">Amazon, Etsy, and eBay resizing guide</Link>.</p>
      </div>
    </section>
  );
}
