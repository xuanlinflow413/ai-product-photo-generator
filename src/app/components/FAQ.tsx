"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Is this free to try?",
    answer: "Yes, the demo is completely free. No signup or payment required.",
  },
  {
    question: "Do I need to create an account?",
    answer: "No. The demo works instantly in your browser.",
  },
  {
    question: "What happens to my uploaded photos?",
    answer: "Photos are processed locally in your browser. We don't store them on any server.",
  },
  {
    question: "Can I download the generated images?",
    answer: "The demo shows preview results. Full-resolution downloads will be available in the paid version.",
  },
  {
    question: "Which e-commerce platforms does this work for?",
    answer: "The generated photos work for Amazon, eBay, Etsy, Shopify, TikTok Shop, and any platform that accepts standard image formats.",
  },
  {
    question: "What photo should I upload?",
    answer: "A clear photo of your product with good lighting works best. The product should be clearly visible and take up most of the frame.",
  },
  {
    question: "When will the full version be available?",
    answer: "We're actively developing the full AI generation feature. Join the waitlist to get early access.",
  },
  {
    question: "Will there be a paid plan?",
    answer: "Yes, we plan to offer a Pro plan with full-resolution downloads, more scenes, and additional features. A free tier with limited previews will also be available.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full py-16 bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
