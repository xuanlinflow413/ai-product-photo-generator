import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, CheckCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Product Photo Guide for E-Commerce Sellers",
  description:
    "A guide to exact browser text replacement and focused AI product-photo editing for marketplace sellers.",
  alternates: { canonical: "/ai-product-photo/" },
  robots: { index: false, follow: false },
};

const sections = [
  ["Hero product shots", "Create clean product images for marketplace listings, landing pages, and paid ads."],
  ["Lifestyle scenes", "Place products into kitchens, desks, bathrooms, outdoor scenes, or seasonal backgrounds."],
  ["Variant testing", "Try different angles, props, and backgrounds before committing to a full shoot."],
  ["Listing refreshes", "Update older Amazon, Shopify, or Etsy pages with more polished visuals."],
];

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-950">
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950">
          ← Back to EditImages
        </Link>
        <div className="mt-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600">
            <Camera className="h-4 w-4" />
            AI product photo planning guide
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            AI product photo workflows for e-commerce sellers
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            EditImages uses deterministic browser rendering when wording must be exact, plus focused AI image editing for authorized overlays, cleanup, backgrounds, and product scenes. Start with one source image and review every output before using it in a listing.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/#ai-generator" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800">
              Open the AI product image editor
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#use-cases" className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">
              See use cases
            </a>
          </div>
        </div>
      </section>

      <section id="use-cases" className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-5xl gap-4 px-6 py-12 sm:grid-cols-2">
          {sections.map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <Sparkles className="h-5 w-5 text-gray-500" />
              <h2 className="mt-4 text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-14">
        <h2 className="text-2xl font-bold tracking-tight">What EditImages supports today</h2>
        <div className="mt-6 space-y-4 text-gray-600">
          {[
            "Exact browser text replacement when spelling, numbers, or translations must be preserved.",
            "Focused AI edits for authorized overlays, cleanup, backgrounds, and scenes.",
            "Local Amazon, Etsy, and eBay image packs after you review the edited result.",
          ].map((item) => (
            <p key={item} className="flex gap-3">
              <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
              <span>{item}</span>
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}
