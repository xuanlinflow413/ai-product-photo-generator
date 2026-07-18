import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileImage,
  FolderTree,
  ShieldCheck,
} from "lucide-react";

const canonicalUrl = "https://editimages.app/ebay-image-resizer/";

export const metadata: Metadata = {
  title: "eBay Image Resizer for 1600 x 1600 JPG Batch Exports | EditImages",
  description:
    "Prepare up to 25 product images as 1600 x 1600 JPG files locally in your browser and download an organized eBay folder.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "eBay Image Resizer for 1600 x 1600 JPG Batch Exports | EditImages",
    description:
      "Prepare up to 25 product images as an organized 1600 x 1600 JPG eBay pack in your browser.",
    type: "article",
    url: canonicalUrl,
  },
};

const steps = [
  {
    title: "Start with clear source files",
    description:
      "Square exports are easier to review when the source photo already presents the product clearly and does not depend on edge detail that may feel tight after framing.",
  },
  {
    title: "Add up to 25 images",
    description:
      "Batch one catalog refresh or handoff job at a time. The selected files remain in your browser during the local workflow.",
  },
  {
    title: "Select the eBay pack",
    description:
      "The eBay preset prepares square 1600 x 1600 JPG files. You can also add Amazon or Etsy folders when the same SKUs need several marketplaces.",
  },
  {
    title: "Review every preview",
    description:
      "Check that square framing has not made the product look undersized and that any existing labels or short lines of copy are still correct.",
  },
  {
    title: "Download the ZIP and manifest",
    description:
      "Export the organized folder and keep the manifest with the listing job so later edits can be traced back to the exact prepared files.",
  },
];

const faqs = [
  {
    question: "What size does the eBay preset create?",
    answer: "The eBay preset creates 1600 x 1600 JPG files.",
  },
  {
    question: "Can I resize several product images at once?",
    answer: "Yes. The current interface accepts up to 25 image files per session.",
  },
  {
    question: "Are my source images uploaded to a server?",
    answer:
      "No. The current Marketplace Image Fixer processes selected source files locally in your browser.",
  },
  {
    question: "Does this workflow guarantee eBay approval or listing performance?",
    answer:
      "No. The preset prepares dimensions and JPG output, but it does not perform a marketplace policy check or guarantee listing outcomes.",
  },
  {
    question: "Does EditImages upload files to eBay for me?",
    answer:
      "No. Download the prepared folder and upload the files yourself through your normal eBay workflow.",
  },
  {
    question: "Can I generate Amazon and Etsy folders in the same session?",
    answer:
      "Yes. The same tool also offers Amazon 2000 x 2000 JPG and Etsy 2000 x 2000 JPG presets.",
  },
];

export default function EbayImageResizerPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-semibold text-slate-900 hover:text-indigo-700">
            EditImages
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/resources/" className="text-slate-600 hover:text-indigo-700">
              Resources
            </Link>
            <Link href="/marketplace-image-fixer/" className="text-slate-600 hover:text-indigo-700">
              Tool
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
            eBay guide
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            eBay image resizer for organized 1600 x 1600 JPG batch exports
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Prepare up to 25 source photos as a consistent 1600 x 1600 JPG eBay
            pack. Review previews in your browser, then download one organized
            ZIP with a manifest.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/marketplace-image-fixer/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800"
            >
              Create an eBay image pack
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck
                className="h-5 w-5 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
              Source files stay in your browser
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:py-20">
        <div>
          <h2 className="text-3xl font-bold">What the eBay preset does</h2>
          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            The preset places each selected source image on a square canvas and
            exports a 1600 x 1600 JPG. After reviewing the previews, download
            the eBay folder in a ZIP with a manifest that records the prepared
            files.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Batch", "Up to 25 files"],
              ["Output", "1600 x 1600 JPG"],
              ["Delivery", "ZIP + manifest"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 p-5">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="border-l-4 border-amber-400 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-lg font-bold">A preparation shortcut, not a guarantee</h2>
          <p className="mt-3 text-sm leading-6">
            EditImages does not guarantee approval, visibility, or conversion on
            eBay. Use the preset to standardize the files, then review the final
            listing presentation and current marketplace guidance yourself.
          </p>
        </aside>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="text-3xl font-bold">
            How to resize an eBay image batch
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 md:grid-cols-2">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="bg-white p-6 sm:p-8 md:last:col-span-2"
              >
                <p className="text-sm font-semibold text-indigo-700">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Review before you upload</h2>
            <div className="mt-6 space-y-4 text-slate-600">
              {[
                "Check product scale, framing, and the amount of empty space.",
                "Verify current guidance for the intended eBay image slot.",
                "Confirm that any wording or labels on the source are still valid.",
                "Keep the manifest with the listing or handoff job.",
              ].map((item) => (
                <p key={item} className="flex gap-3 leading-7">
                  <CheckCircle2
                    className="mt-1 h-5 w-5 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Prepare source wording first</h2>
            <p className="mt-6 leading-7 text-slate-600">
              If the source image contains a short line of outdated wording,
              replace it before batch export in the local text overlay workflow.
              That workflow is intentionally narrow and does not automatically
              detect text, match fonts, or reconstruct the hidden background.
            </p>
            <Link
              href="/edit-text-in-product-image/"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-indigo-700 hover:text-indigo-900"
            >
              <FileImage className="h-5 w-5" aria-hidden="true" />
              Edit text in a product image
            </Link>
            <p className="mt-8 leading-7 text-slate-600">
              Need coordinated exports for several channels? Use the{" "}
              <Link
                href="/resize-product-images-for-marketplaces/"
                className="font-semibold text-indigo-700 hover:text-indigo-900"
              >
                multi-marketplace image resizing workflow
              </Link>{" "}
              to prepare Amazon, Etsy, and eBay folders from the same batch.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-indigo-200 bg-indigo-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
              Working tool
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Prepare the actual eBay pack in your browser
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-indigo-950/80">
              Open the Marketplace Image Fixer to select the eBay preset, review
              the previews, and export an organized ZIP.
            </p>
          </div>
          <Link href="/marketplace-image-fixer/" className="button-primary">
            Open Marketplace Image Fixer
            <FolderTree className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
        <h2 className="text-3xl font-bold">FAQ</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold">{faq.question}</h3>
              <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
