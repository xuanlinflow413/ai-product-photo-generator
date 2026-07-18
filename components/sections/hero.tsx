"use client";

import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              <Sparkles className="h-4 w-4" />
              Local tools for repeated product-image work
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Prepare Product Images{" "}
              <span className="text-indigo-600">Without the Tool Shuffle</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Build marketplace-ready packs, replace wording directly on an image, and keep source files in your browser while you work for{" "}
              <span className="font-medium text-slate-900">Amazon</span>,{" "}
              <span className="font-medium text-slate-900">Etsy</span>, and{" "}
              <span className="font-medium text-slate-900">eBay</span>{" "}
              listings. Focused workflows, batch preparation, and paid credits only when you use cloud actions.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
              <a
                href="/marketplace-image-fixer/"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Prepare a Free Pack
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="/edit-text-in-product-image/"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Edit Image Text
              </a>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Free local workflows are available now. Sign in only when you need credits for cloud features.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mx-0">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-xl">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Source Photo
                  </p>
                  <div className="aspect-square overflow-hidden rounded-xl bg-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"
                      alt="Source product photo used in the local editing workflows"
                      className="h-full w-full object-cover opacity-80"
                      loading="eager"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-center text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Scene Demo
                  </p>
                  <div className="aspect-square overflow-hidden rounded-xl border-2 border-indigo-200">
                    <img
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"
                      alt="Optional scene-preview demo for product-photo concepts"
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-lg">
              <p className="text-sm font-medium text-slate-900">
                Local tools live
              </p>
              <p className="text-xs text-slate-500">
                Marketplace packs and text edits
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
