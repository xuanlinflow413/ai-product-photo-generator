import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileImage, FolderTree, ShieldCheck } from "lucide-react";
import { TrackedLink } from "@/components/tracked-link";

const canonicalUrl = "https://editimages.app/product-image-qa-checklist/";

export const metadata: Metadata = {
  title: "Product Image QA Checklist for Amazon, Etsy and eBay | EditImages",
  description:
    "A practical preflight checklist for product-image exports, text changes, marketplace presets, and manual final review before upload.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "Product Image QA Checklist for Amazon, Etsy and eBay | EditImages",
    description:
      "Review product-image exports, wording, framing, and handoff before publishing a marketplace listing.",
    type: "article",
    url: canonicalUrl,
  },
};

const checklist = [
  {
    area: "Source file",
    checks: [
      "Start with the clearest source image available.",
      "Confirm the product still fills the canvas appropriately after square framing.",
      "Check that the file you are editing is the intended source for this listing.",
    ],
  },
  {
    area: "Wording and labels",
    checks: [
      "Verify prices, promo copy, units, and product labels are current.",
      "Replace outdated wording before batch resizing when needed.",
      "Keep the final wording review human; do not assume the tool validates claims.",
    ],
  },
  {
    area: "Marketplace export",
    checks: [
      "Choose the correct preset for Amazon, Etsy, eBay, or a combined batch.",
      "Review previews for empty space, clipping, and awkward padding.",
      "Remember that preset dimensions are shortcuts, not policy guarantees.",
    ],
  },
  {
    area: "Handoff and upload",
    checks: [
      "Download the ZIP and keep the manifest with the catalog job.",
      "Upload files manually through your normal marketplace workflow.",
      "Do one last listing-role and category check against current marketplace rules.",
    ],
  },
];

const misses = [
  "The wrong source image is resized into every marketplace folder.",
  "An outdated sale badge or short line of copy survives into the final export.",
  "Square framing makes the product look too small, even though dimensions are correct.",
  "The ZIP is downloaded, but no one keeps the manifest for later reference.",
];

const faqs = [
  {
    question: "Does this checklist guarantee approval on Amazon, Etsy, or eBay?",
    answer:
      "No. It is a manual review aid. Marketplace policies change and can vary by role or category, so final approval still depends on the current platform rules and your own review.",
  },
  {
    question: "Can EditImages run this checklist automatically?",
    answer:
      "No. The tools handle deterministic preparation steps such as local resizing, text overlays, and exports, but the final review remains human.",
  },
  {
    question: "Where should I fix outdated wording before export?",
    answer:
      "Use the local text-edit workflow first when the task is simply to cover a defined area and place replacement wording, then move the updated file into the marketplace export workflow.",
  },
];

export default function ProductImageQaChecklistPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">QA checklist</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            A preflight checklist for product-image exports before they go live
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Use this page when you need one shareable reference for wording checks, square framing review, preset selection, and upload handoff across Amazon, Etsy, and eBay workflows.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
          <div>
            <h2 className="text-3xl font-bold">Checklist</h2>
            <div className="mt-8 space-y-5">
              {checklist.map((group) => (
                <article key={group.area} className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="text-xl font-bold">{group.area}</h3>
                  <div className="mt-4 space-y-3">
                    {group.checks.map((check) => (
                      <p key={check} className="flex gap-3 leading-7 text-slate-600">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-700" />
                        <span>{check}</span>
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <aside className="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-indigo-700" />
                <div>
                  <h2 className="text-lg font-bold text-indigo-950">Use the checklist with the live tools</h2>
                  <p className="mt-3 text-sm leading-6 text-indigo-900">
                    The checklist covers review. The tools handle local text replacement, local marketplace packs, and credit-based cloud actions when available in your account.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3">
                <TrackedLink href="/marketplace-image-fixer/" className="button-primary" conversion={{ name: "resource_cta_click", properties: { page_path: "/product-image-qa-checklist/", cta_id: "resource_marketplace_tool" } }}>
                  Open Marketplace Image Fixer
                </TrackedLink>
                <TrackedLink href="/edit-text-in-product-image/" className="button-secondary" conversion={{ name: "resource_cta_click", properties: { page_path: "/product-image-qa-checklist/", cta_id: "resource_text_tool" } }}>
                  Open text editor
                </TrackedLink>
              </div>
            </aside>

            <aside className="rounded-lg border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-lg font-bold text-amber-950">Common misses this catches</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-amber-900">
                {misses.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </aside>

            <aside className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-bold">Related references</h2>
              <div className="mt-4 space-y-3">
                <Link href="/resize-product-images-for-marketplaces/" className="flex items-start gap-3 text-slate-700 hover:text-indigo-700">
                  <FolderTree className="mt-1 h-5 w-5 shrink-0" />
                  <span>Resize product images for Amazon, Etsy, and eBay</span>
                </Link>
                <Link href="/replace-text-on-product-image/" className="flex items-start gap-3 text-slate-700 hover:text-indigo-700">
                  <FileImage className="mt-1 h-5 w-5 shrink-0" />
                  <span>Replace text on a product image in your browser</span>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="text-3xl font-bold">FAQ</h2>
          <div className="mt-8 space-y-4">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-bold">{faq.question}</h3>
                <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
