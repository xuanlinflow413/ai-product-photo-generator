import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Archive,
  CheckCircle2,
  FileImage,
  FolderTree,
  ShieldCheck,
} from "lucide-react";

const canonicalUrl =
  "https://editimages.app/resize-product-images-for-marketplaces/";

export const metadata: Metadata = {
  title: "Resize Product Images for Multiple Marketplaces | EditImages",
  description:
    "Turn up to 25 product images into organized Amazon, Etsy and eBay JPG packs in your browser, then download one ZIP with a manifest.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "Resize Product Images for Multiple Marketplaces | EditImages",
    description:
      "Prepare organized Amazon, Etsy and eBay JPG packs locally in your browser.",
    type: "article",
    url: canonicalUrl,
  },
};

const presets = [
  { marketplace: "Amazon", output: "2000 x 2000 JPG" },
  { marketplace: "Etsy", output: "2000 x 2000 JPG" },
  { marketplace: "eBay", output: "1600 x 1600 JPG" },
];

const steps = [
  {
    title: "Add your product images",
    description:
      "Open the Marketplace Image Fixer and select up to 25 source files. Clear originals with enough resolution give you more useful exports.",
  },
  {
    title: "Choose your output packs",
    description:
      "Select Amazon, Etsy, eBay, or any combination of the three. Each selected marketplace receives its own folder.",
  },
  {
    title: "Review before export",
    description:
      "Check the previews for unwanted padding, small product presentation, or a composition that does not suit a square canvas.",
  },
  {
    title: "Download the organized ZIP",
    description:
      "Export the selected folders together and keep the included manifest with the job for a clear record of what was prepared.",
  },
];

const faqs = [
  {
    question: "Are my product images uploaded to a server?",
    answer:
      "No. The current Marketplace Image Fixer processes the selected files locally in your browser.",
  },
  {
    question: "How many images can I add?",
    answer: "You can add up to 25 image files in one session.",
  },
  {
    question: "Which marketplace presets are available?",
    answer:
      "Amazon and Etsy use 2000 x 2000 JPG presets. eBay uses a 1600 x 1600 JPG preset.",
  },
  {
    question: "Does the export guarantee marketplace approval?",
    answer:
      "No. The presets prepare dimensions and format, but requirements can change and vary by listing. Check the current marketplace rules before publishing.",
  },
  {
    question: "Does EditImages upload files to a marketplace or sync Shopify?",
    answer:
      "No. You download the ZIP and upload the selected files yourself. The current workflow has no marketplace upload or Shopify sync.",
  },
  {
    question: "Can I edit text before resizing?",
    answer:
      "Yes. Use the separate local product image text editor, export a PNG or JPG, and then add that file to the marketplace workflow.",
  },
];

export default function ResizeProductImagesForMarketplacesPage() {
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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="font-semibold text-slate-950">
            EditImages
          </Link>
          <Link
            href="/marketplace-image-fixer/"
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            Open image fixer
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-semibold uppercase text-indigo-700">
            Marketplace image workflow
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold sm:text-6xl">
            Resize product images for multiple marketplaces
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Prepare one source batch for Amazon, Etsy, and eBay without
            repeating the resize and export process for every channel. Choose
            two or more packs for the multi-marketplace workflow, review the
            results, and download separate folders plus a manifest in one ZIP.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/marketplace-image-fixer/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800"
            >
              Open Marketplace Image Fixer
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck
                className="h-5 w-5 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
              1–25 files supported; 2+ marketplaces is the best fit
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:py-20">
        <div>
          <h2 className="text-3xl font-bold">
            One source batch, separate marketplace folders
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            Select any combination of Amazon, Etsy, and eBay. EditImages uses
            the selected output presets locally and prepares platform folders
            in one ZIP, with a manifest for review.
          </p>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Preparing only one channel? Use the focused{" "}
            <Link
              href="/amazon-product-image-resizer/"
              className="font-semibold text-indigo-700 hover:text-indigo-900"
            >
              Amazon product image resizer guide
            </Link>{" "}
            for the 2000 x 2000 JPG workflow and pre-upload review points.
          </p>
          <div className="mt-8 overflow-hidden rounded-lg border border-slate-200">
            {presets.map(({ marketplace, output }) => (
              <div
                key={marketplace}
                className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 last:border-b-0 sm:px-5"
              >
                <span className="font-semibold">{marketplace}</span>
                <span className="text-right text-sm text-slate-600">
                  {output}
                </span>
              </div>
            ))}
          </div>
        </div>
        <aside className="border-l-4 border-amber-400 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-lg font-bold">Preset, not a guarantee</h2>
          <p className="mt-3 text-sm leading-6">
            These dimensions are production shortcuts. Marketplace rules can
            change and may vary by image role or category. Review every export
            against current listing requirements before publishing.
          </p>
        </aside>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="text-3xl font-bold">
            How to prepare a marketplace image pack
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 md:grid-cols-2">
            {steps.map((step, index) => (
              <article key={step.title} className="bg-white p-6 sm:p-8">
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
            <h2 className="text-3xl font-bold">When this workflow is useful</h2>
            <div className="mt-6 space-y-4 text-slate-600">
              {[
                "Opening a second sales channel with an existing photo library.",
                "Refreshing a group of listings with consistent output files.",
                "Handing image preparation to another operator with a manifest.",
                "Preparing source photos manually before marketplace upload.",
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
            <h2 className="text-3xl font-bold">Keep the final review human</h2>
            <p className="mt-6 leading-7 text-slate-600">
              EditImages handles deterministic resizing and format
              preparation. It does not evaluate marketplace policy, image
              quality, category restrictions, trademarks, accessibility, or
              whether an image will convert.
            </p>
            <Link
              href="/replace-text-on-product-image/"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-indigo-700 hover:text-indigo-900"
            >
              <FileImage className="h-5 w-5" aria-hidden="true" />
              Learn how to replace text before resizing
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-indigo-200 bg-indigo-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-semibold text-indigo-800">
              <FolderTree className="h-5 w-5" aria-hidden="true" />
              Local marketplace pack workflow
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Prepare the files, then review before publishing
            </h2>
          </div>
          <Link
            href="/marketplace-image-fixer/"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800"
          >
            Open Marketplace Image Fixer
            <Archive className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
        <h2 className="text-3xl font-bold">Frequently asked questions</h2>
        <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map(({ question, answer }) => (
            <article key={question} className="py-6">
              <h3 className="text-lg font-bold">{question}</h3>
              <p className="mt-3 leading-7 text-slate-600">{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
