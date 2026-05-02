"use client";

import { Zap, Target, Shield } from "lucide-react";

const features = [
  {
    icon: <Zap className="h-6 w-6 text-blue-600" />,
    title: "See Results Instantly",
    description: "Upload and preview AI-generated product photos in seconds",
  },
  {
    icon: <Target className="h-6 w-6 text-blue-600" />,
    title: "Built for Sellers",
    description: "Designed for Amazon, Etsy, Shopify, and independent stores",
  },
  {
    icon: <Shield className="h-6 w-6 text-blue-600" />,
    title: "No Commitment",
    description: "Try the demo now. No signup, no payment, no setup.",
  },
];

export default function Features() {
  return (
    <section className="w-full py-12 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-50 rounded-xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
