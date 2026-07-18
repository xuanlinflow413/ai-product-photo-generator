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

const canonicalUrl = "https://editimages.app/amazon-product-image-resizer/";

export const metadata: Metadata = {
  title: "Amazon Product Image Resizer for Batch JPG Packs | EditImages",
  description:
    "Prepare up to 25 product images as 2000 x 2000 JPG files locally in your browser and download an organized Amazon folder.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "Amazon Product Image Resizer for Batch JPG Packs | EditImages",
    description:
      "Prepare up to 25 product images as an organized 2000 x 2000 JPG Amazon pack in your browser.",
    type: "article",
    url: canonicalUrl,
  },
};

const steps = [
  {
    title: "Start with clear source photos",
    description:
      "Use the best originals available. Resizing can standardize the canvas, but it cannot restore missing detail or make a low-resolution source genuinely sharper.",
  },
  {
    title: "Add up to 25 image files",
    description:
      "Keep source filenames easy to associate with each product. Your selected files remain in the browser during this local workflow.",
  },
  {
    title: "Select the Amazon pack",
    description:
      "The Amazon preset prepares square 2000 x 2000 JPG files. You can also select Etsy or eBay packs when the same products are sold elsewhere.",
  },
  {
    title: "Review every preview",
    description:
      "Check product scale, edges, empty space, and the effect of square framing. Confirm Amazon's current requirements for the image role and category separately.",
  },
  {
    title: "Download the ZIP and manifest",
    description:
      "Export the organized folder and keep its manifest with your catalog job. Uploading the finished files to Amazon remains a separate manual step.",
  },
];

const faqs = [
  {
    question: "What size does the Amazon preset create?",
    answer: "The Amazon preset creates 2000 x 2000 JPG files.",
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
    question: "Does this remove or replace the background?",
    answer:
      "No. This workflow resizes images onto a white square canvas and prepares JPG output files. It does not remove or replace backgrounds.",
  },
  {
    question: "Will the exported images automatically meet Amazon policy?",
    answer:
      "No. The preset does not perform an automatic policy check or guarantee compliance, approval, or listing performance. Review Amazon's current requirements before upload.",
  },
  {
    question: "Does EditImages upload files to Seller Central?",
    answer:
      "No. There is no Seller Central account integration. Download the files and upload them through your normal workflow.",
  },
  {
    question: "Can I prepare Etsy and eBay copies too?",
    answer:
      "Yes. The same tool also offers an Etsy 2000 x 2000 JPG preset and an eBay 1600 x 1600 JPG preset.",
  },
];

export default function AmazonProductImageResizerPage() {
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
            Local Amazon image preparation
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold sm:text-6xl">
            Resize product images for an Amazon listing batch
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Prepare up to 25 source photos as a consistent 2000 x 2000 JPG
            Amazon pack. Review the previews in your browser, then download an
            organized ZIP with a manifest.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/marketplace-image-fixer/?platform=amazon"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800"
            >
              Create an Amazon image pack
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
          <h2 className="text-3xl font-bold">What the Amazon preset does</h2>
          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            The preset places each selected source image on a white square
            canvas and exports a 2000 x 2000 JPG. After reviewing the previews,
            download the Amazon folder in a ZIP with a manifest that records
            the prepared files.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Batch", "Up to 25 files"],
              ["Output", "2000 x 2000 JPG"],
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
          <h2 className="text-lg font-bold">A production preset, not approval</h2>
          <p className="mt-3 text-sm leading-6">
            EditImages does not perform an Amazon policy audit or guarantee
            approval. Requirements can change and vary by image role or
            category, so compare each export with current Amazon guidance
            before publishing.
          </p>
        </aside>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="text-3xl font-bold">
            How to resize an Amazon product image batch
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
                "Check product scale, edges, framing, and empty space.",
                "Verify the current rules for the image role and product category.",
                "Confirm that source labels and promotional wording are current.",
                "Keep the manifest with the catalog job for reference.",
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
            <h2 className="text-3xl font-bold">Prepare the source first</h2>
            <p className="mt-6 leading-7 text-slate-600">
              If an image contains an outdated label or short line of copy, use
              the local text overlay workflow before resizing. It does not
              automatically detect old text, match fonts, or restore the hidden
              background.
            </p>
            <Link
              href="/edit-text-in-product-image/"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-indigo-700 hover:text-indigo-900"
            >
              <FileImage className="h-5 w-5" aria-hidden="true" />
              Edit text in a product image
            </Link>
            <p className="mt-8 leading-7 text-slate-600">
              Need assets for more than one sales channel? Follow the{" "}
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
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-semibold text-indigo-800">
              <FolderTree className="h-5 w-5" aria-hidden="true" />
              Local batch workflow
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Prepare an organized Amazon image folder
            </h2>
          </div>
          <Link
            href="/marketplace-image-fixer/"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800"
          >
            Prepare the batch locally
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
