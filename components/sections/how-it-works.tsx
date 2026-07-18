"use client";

import { LayoutTemplate, SlidersHorizontal, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: LayoutTemplate,
    title: "Pick the Right Workflow",
    description:
      "Start with the marketplace pack workflow for repeat exports, the text editor for wording changes, or the optional scene demo for concept previews.",
  },
  {
    number: "02",
    icon: SlidersHorizontal,
    title: "Prepare the Asset Locally",
    description:
      "Resize for Amazon, Etsy, and eBay presets or place a replacement text overlay directly in the browser without uploading the source file.",
  },
  {
    number: "03",
    icon: Download,
    title: "Export What You Need",
    description:
      "Download structured marketplace folders, PNG/JPG edits, or use credits only when a cloud action is available in your account.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            How It Works
          </h2>
          <p className="mt-2 text-slate-600">
            Three simple steps for the product-image jobs that recur every week.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 text-center"
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                  Step {step.number}
                </span>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
