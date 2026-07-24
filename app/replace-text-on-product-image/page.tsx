import type { Metadata } from "next";
import Link from "next/link";
import { TrackedLink } from "@/components/tracked-link";
import { conversionEvents } from "@/lib/conversion-analytics";
import {
  ArrowRight,
  CheckCircle2,
  FileImage,
  Move,
  Palette,
  ShieldCheck,
  Type,
} from "lucide-react";

const canonicalUrl =
  "https://editimages.app/replace-text-on-product-image/";

export const metadata: Metadata = {
  title: "Replace Text on a Product Image in Your Browser | EditImages",
  description:
    "Cover outdated wording, add replacement text, adjust basic styling, and export a product image as PNG or JPG in your browser.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "Replace Text on a Product Image in Your Browser | EditImages",
    description:
      "Follow a focused browser workflow to cover outdated wording, add replacement text, and export a product image as PNG or JPG.",
    type: "article",
    url: canonicalUrl,
  },
};

const steps = [
  {
    title: "Upload the source image",
    description:
      "Choose the PNG or JPG you want to update. Start from a copy so your original remains available for comparison.",
  },
  {
    title: "Position the overlay",
    description:
      "Drag the replacement area over the wording you need to cover. Select an overlay color that fits the surrounding area. On textured or detailed backgrounds, a flat overlay may remain visible.",
  },
  {
    title: "Enter and style the replacement text",
    description:
      "Type the new wording, then adjust font size, text color, and left, center, or right alignment. Review spelling, claims, prices, units, and language with the person responsible for the listing.",
  },
  {
    title: "Preview at listing size",
    description:
      "Inspect the image at the size buyers will see. Confirm that the text remains legible and that the overlay does not hide product details, safety information, or required labeling.",
  },
  {
    title: "Export PNG or JPG",
    description:
      "Download the preferred format. The dashed editing boundary is preview-only and is not included in the exported image.",
  },
];

const faqs = [
  {
    question: "Does EditImages automatically find text in my image?",
    answer:
      "No. You manually position the overlay and enter the replacement wording.",
  },
  {
    question: "Does it restore the original background behind the text?",
    answer:
      "The free local overlay uses a flat color. The same editor now offers a separate, credit-based AI background task when you want the surrounding image rebuilt.",
  },
  {
    question: "Can it match the original font automatically?",
    answer:
      "No automatic font matching is claimed. The verified controls cover font size, colors, alignment, and position.",
  },
  {
    question: "Does it translate product image text?",
    answer:
      "No translation feature was verified. You can enter translated copy prepared elsewhere and review it before export.",
  },
  {
    question: "Which formats can I export?",
    answer: "The verified editor exports PNG and JPG.",
  },
  {
    question: "Is the dashed boundary included in the download?",
    answer:
      "No. The public interface states that the dashed boundary is preview-only.",
  },
];

export default function ReplaceTextOnProductImagePage() {
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
            href="/edit-text-in-product-image/"
            className="text-right text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            Open text editor
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-semibold uppercase text-indigo-700">
            Product image text workflow
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold sm:text-6xl">
            Replace text on a product image without a full design workflow
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            A supplier label changes. A promotion ends. A short line of listing
            copy needs an update. When the job is to cover a defined area and
            place replacement wording, use a focused local browser canvas.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <TrackedLink
              href="/edit-text-in-product-image/"
              conversion={{ name: conversionEvents.seoPrimaryCtaClick, properties: { page_path: "/replace-text-on-product-image/", source_page: "/replace-text-on-product-image/", cta_id: "guide_hero_editor" } }}
              className="inline-flex max-w-full items-center justify-center gap-2 rounded-lg bg-indigo-700 px-5 py-3 text-center font-semibold leading-6 text-white hover:bg-indigo-800"
            >
              <span className="min-w-0">Edit your product image text</span>
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </TrackedLink>
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck
                className="h-5 w-5 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
              Your image stays in the browser
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:py-20">
        <div>
          <h2 className="text-3xl font-bold">What you can control</h2>
          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            Upload an image, move the overlay area, enter replacement copy,
            adjust its basic appearance, preview the result, and export PNG or
            JPG. The current editor provides manual, predictable controls rather
            than automatic image analysis.
          </p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2">
            {[
              [Move, "Manual overlay position"],
              [Type, "Text and font size"],
              [Palette, "Text and overlay colors"],
              [FileImage, "PNG or JPG export"],
            ].map(([Icon, label]) => (
              <div key={label as string} className="flex items-center gap-3 bg-white p-5">
                <Icon className="h-5 w-5 shrink-0 text-indigo-700" aria-hidden="true" />
                <span className="font-semibold">{label as string}</span>
              </div>
            ))}
          </div>
        </div>
        <aside className="border-l-4 border-amber-400 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-lg font-bold">Know the workflow limits</h2>
          <p className="mt-3 text-sm leading-6">
            The free local editor does not detect text or match fonts, and a flat
            overlay may remain visible on patterned areas. The editor also offers
            separate AI tasks for authorized overlays, cleanup, backgrounds, and
            product scenes. Review every AI result before publishing.
          </p>
        </aside>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="text-3xl font-bold">
            How to replace wording on a product photo
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
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">
              Practical uses for e-commerce teams
            </h2>
            <div className="mt-6 space-y-4 text-slate-600">
              {[
                "Correct a short line of outdated label or listing copy.",
                "Add a simple language overlay supplied by your translator.",
                "Update a bundle quantity or cover expired promotional wording.",
                "Prepare a clear overlay area before marketplace resizing.",
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
            <p className="mt-6 leading-7 text-slate-600">
              Complex lettering on patterned packaging usually needs a full
              image editor or a new source photo.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">
              Review accuracy and rights before publishing
            </h2>
            <p className="mt-6 leading-7 text-slate-600">
              The tool changes pixels; it does not validate the truth or legality
              of the new copy. Confirm product claims, trademarks, required
              disclosures, translation accuracy, and marketplace image policies
              yourself. Never cover safety information or required labeling.
            </p>
            <p className="mt-6 leading-7 text-slate-600">
              After editing, use the{" "}
              <Link
                href="/marketplace-image-fixer/"
                className="font-semibold text-indigo-700 hover:text-indigo-900"
              >
                Marketplace Image Fixer
              </Link>{" "}
              for local output preparation, or follow the{" "}
              <Link
                href="/resize-product-images-for-marketplaces/"
                className="font-semibold text-indigo-700 hover:text-indigo-900"
              >
                marketplace image resizing guide
              </Link>{" "}
              to organize Amazon, Etsy, and eBay packs.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-indigo-200 bg-indigo-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-indigo-800">
              Local manual editing workflow
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Cover old wording and place your replacement copy
            </h2>
          </div>
          <TrackedLink
            href="/edit-text-in-product-image/"
            conversion={{ name: conversionEvents.seoPrimaryCtaClick, properties: { page_path: "/replace-text-on-product-image/", source_page: "/replace-text-on-product-image/", cta_id: "guide_final_editor" } }}
            className="inline-flex max-w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-700 px-5 py-3 text-center font-semibold leading-6 text-white hover:bg-indigo-800"
          >
            <span className="min-w-0">Open the local text editor</span>
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </TrackedLink>
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
