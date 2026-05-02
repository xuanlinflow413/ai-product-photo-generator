"use client";

import { Upload, Palette, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Product Photo",
    description:
      "Drag and drop or click to upload any product image. No editing needed — the AI will handle background removal and positioning.",
  },
  {
    number: "02",
    icon: Palette,
    title: "Choose a Scene Template",
    description:
      "Pick from 6 professionally designed scenes: white background, lifestyle, in-hand, outdoor, luxury, or seasonal.",
  },
  {
    number: "03",
    icon: Download,
    title: "Preview AI-Generated Results",
    description:
      "See how your product looks in the chosen scene. In the full version, download high-res images ready for your store.",
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
            Three simple steps to preview AI product photography for your
            e-commerce listings.
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
