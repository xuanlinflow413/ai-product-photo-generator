import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, FolderTree, Images, ShieldCheck } from "lucide-react";

const canonicalUrl = "https://editimages.app/resources/";

export const metadata: Metadata = {
  title: "Product Image Resources for Marketplace Operators | EditImages",
  description:
    "A compact resource hub for marketplace image prep, text replacement, batch export workflows, and preflight QA checklists.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "Product Image Resources for Marketplace Operators | EditImages",
    description:
      "Reference pages, checklists, and working tools for marketplace image preparation.",
    type: "website",
    url: canonicalUrl,
  },
};

const resources = [
  {
    href: "/product-image-qa-checklist/",
    eyebrow: "Checklist",
    title: "Product image QA checklist",
    body: "A preflight review sheet for resizing, wording, framing, and handoff before a listing image goes live.",
    icon: ShieldCheck,
  },
  {
    href: "/resize-product-images-for-marketplaces/",
    eyebrow: "Guide",
    title: "Resize product images for marketplaces",
    body: "A multi-marketplace workflow for preparing Amazon, Etsy, and eBay JPG packs in one browser session.",
    icon: FolderTree,
  },
  {
    href: "/amazon-product-image-resizer/",
    eyebrow: "Guide",
    title: "Amazon product image resizer",
    body: "A focused Amazon-specific reference for 2000 x 2000 JPG preparation and manual final review.",
    icon: Images,
  },
  {
    href: "/etsy-listing-image-resizer/",
    eyebrow: "Guide",
    title: "Etsy listing image resizer",
    body: "A focused Etsy-specific reference for 2000 x 2000 JPG preparation and manual final review.",
    icon: Images,
  },
  {
    href: "/ebay-image-resizer/",
    eyebrow: "Guide",
    title: "eBay image resizer",
    body: "A focused eBay-specific reference for 1600 x 1600 JPG preparation and manual final review.",
    icon: Images,
  },
  {
    href: "/replace-text-on-product-image/",
    eyebrow: "Guide",
    title: "Replace text on a product image",
    body: "A narrow guide for covering outdated wording and placing replacement copy before export.",
    icon: FileText,
  },
];

const audiences = [
  "Marketplace operators preparing the same asset set for several channels.",
  "Agencies and catalog assistants who need a repeatable pre-upload review process.",
  "Sellers who want a simple resource to share internally before handing off image work.",
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Resources</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Reference pages worth sending before the image work starts
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Use these pages when you need a clean external link for marketplace image prep, manual QA, and browser-local export workflows.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/product-image-qa-checklist/" className="button-primary">
              Open the QA checklist
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/marketplace-image-fixer/" className="button-secondary">
              Open the live tool
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-5 md:grid-cols-2">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Link
                key={resource.href}
                href={resource.href}
                className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">{resource.eyebrow}</p>
                    <h2 className="mt-2 text-2xl font-bold">{resource.title}</h2>
                  </div>
                  <span className="rounded-md bg-indigo-50 p-2 text-indigo-700">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-4 leading-7 text-slate-600">{resource.body}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:py-20">
          <div>
            <h2 className="text-3xl font-bold">Who these links help</h2>
            <div className="mt-6 space-y-4 text-slate-600">
              {audiences.map((item) => (
                <p key={item} className="flex gap-3 leading-7">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-700" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Pair resources with the working tools</h2>
            <p className="mt-6 leading-7 text-slate-600">
              The resource pages explain the workflow and its limits. The live tools handle local marketplace packs, local text replacement, and credit-based cloud actions when you sign in.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/marketplace-image-fixer/" className="button-primary">
                Marketplace Image Fixer
              </Link>
              <Link href="/edit-text-in-product-image/" className="button-secondary">
                Edit image text
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
