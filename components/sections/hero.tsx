"use client";
/* eslint-disable @next/next/no-img-element -- the hero uses one external product reference image. */

import { ArrowRight, CheckCircle2, Eraser, ImagePlus, ShieldCheck, Type, Wand2 } from "lucide-react";

const editTasks = [
  [Type, "Replace text", "Refresh a label, price, or promotion."],
  [Eraser, "Clean an image", "Remove authorized overlays or distractions."],
  [ImagePlus, "Change background", "Create a clean studio or lifestyle setting."],
  [Wand2, "Create a scene", "Keep the product while changing the setting."],
] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              <ShieldCheck className="h-4 w-4" />
              AI product image editing for sellers
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Edit Product Images With AI, <span className="text-indigo-600">Without a Reshoot</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Replace product text exactly in the browser, or clean an authorized overlay, change a background, or create a new product scene with AI. Upload one image, choose an edit, and review the result before you publish.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
              <a
                href="/edit-text-in-product-image/"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-indigo-700 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-800"
              >
                Edit a product image
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="/marketplace-image-fixer/"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-800"
              >
                Prepare marketplace files
              </a>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-600 lg:justify-start">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" />One credit per successful AI edit</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Review before publishing</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mx-0">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-xl">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Product image editor</p>
                <span className="text-xs font-medium text-indigo-700">Choose one focused edit</span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="aspect-square overflow-hidden rounded-lg bg-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&h=700&fit=crop"
                    alt="Product image ready for a focused AI edit"
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="grid gap-2">
                  {editTasks.map(([Icon, title, description]) => (
                    <div key={title} className="flex min-h-14 items-center gap-3 rounded-lg border border-indigo-100 bg-white p-3">
                      <Icon className="h-5 w-5 shrink-0 text-indigo-700" aria-hidden="true" />
                      <span className="min-w-0"><span className="block text-sm font-semibold text-slate-900">{title}</span><span className="block text-xs leading-5 text-slate-500">{description}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-2 max-w-56 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-lg sm:-right-4">
              <p className="text-sm font-medium text-slate-900">Keep the product recognizable</p>
              <p className="text-xs leading-5 text-slate-500">AI output needs your review before listing use.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
