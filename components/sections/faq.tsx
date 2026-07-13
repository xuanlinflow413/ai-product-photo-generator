"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What does this demo do?",
    answer:
      "This demo lets you upload a product photo, choose a scene template, and see a preview of how the AI generation flow would work. The generated results shown are placeholder images — real AI generation is not yet connected.",
  },
  {
    question: "Is my product photo uploaded to your server?",
    answer:
      "No. In this demo, your image stays in your browser and is never uploaded to any server. It is only used for local preview on your device.",
  },
  {
    question: "When will real AI generation be available?",
    answer:
      "Real AI generation is not available today. The current pricing test focuses on seller interest in faster listing-preparation workflows; register your interest if you want updates.",
  },
  {
    question: "Can I use the demo-generated images for my store?",
    answer:
      "The demo shows placeholder images only — they are not generated from your product and should not be used in your store. Wait for the Pro version for real AI-generated images.",
  },
  {
    question: "What scene templates are available?",
    answer:
      "The demo includes 6 scene templates: Clean White Background, Lifestyle on Table, In Hand / Being Used, Nature / Outdoor, Luxury Minimalist, and Holiday / Seasonal. The full version will add more.",
  },
  {
    question: "Do I need to remove the background before uploading?",
    answer:
      "No. The full version will include automatic background removal. For this demo, just upload any product photo — no editing needed.",
  },
  {
    question: "What platforms are supported?",
    answer:
      "The generated images will be suitable for Amazon, Etsy, Shopify, TikTok Shop, and other e-commerce platforms. White-background images will meet Amazon's main image requirements. The demo currently shows placeholder previews only.",
  },
  {
    question: "How much will the full version cost?",
    answer:
      "The local tools remain free. We are testing interest in a proposed $9/month Seller plan for saved workflow history, larger batch packs, and priority exports. It is not available to purchase and no payment is collected today.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "There is nothing to refund today because EditImages does not collect payment. Any future paid launch will publish its actual refund terms before checkout.",
  },
  {
    question: "How do I join the waitlist?",
    answer:
      "Click 'Register paid interest,' then submit your email and whether you would consider the proposed Seller price. Your response is stored as product research and does not create an order or charge you.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">FAQ</h2>
          <p className="mt-2 text-slate-600">
            Common questions about the demo and upcoming features.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-slate-900">
                    <HelpCircle className="h-4 w-4 shrink-0 text-indigo-600" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="pl-7 text-sm leading-relaxed text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
