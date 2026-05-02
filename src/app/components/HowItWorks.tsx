"use client";

import { ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload Your Product Photo",
      description: "Drag and drop or click to upload. Works with any product image.",
    },
    {
      number: "02",
      title: "Pick a Scene",
      description: "Choose from white background, lifestyle, luxury, or seasonal settings.",
    },
    {
      number: "03",
      title: "Preview AI Results",
      description: "See mock generated images to explore what's possible. Full generation coming soon.",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-16 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            How It Works
          </h2>
          <p className="text-gray-600">
            Three simple steps to preview your product photos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%]">
                  <ArrowRight className="h-5 w-5 text-gray-300" />
                </div>
              )}
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-600">{step.number}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
