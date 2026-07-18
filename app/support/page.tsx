import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Support | EditImages",
  description: "Get help with EditImages marketplace packs, text editing, AI edits, credits, and billing.",
  alternates: { canonical: "https://editimages.app/support/" },
};

const topics = [
  ["Marketplace packs", "Check the selected platform, preview framing, browser memory, and the downloaded manifest."],
  ["Text replacement", "Confirm the overlay area, wording, colors, and exported PNG/JPG before moving to the marketplace tool."],
  ["AI edits", "Include the approximate time and account email. Do not include source images or sensitive instructions unless requested."],
  ["Billing", "Use the account page for the billing portal, or contact support for checkout, credit, and renewal issues."],
];

export default function SupportPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-14 text-slate-900 sm:px-6 lg:py-20">
      <Link href="/" className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">Back to EditImages</Link>
      <div className="mt-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Support</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Get unstuck without sending your source files</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">Start with the relevant workflow checklist below. If the problem remains, send a short description and we will help diagnose the next step.</p>
        <a href="mailto:support@editimages.app" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800">
          <Mail className="h-4 w-4" />
          Email support@editimages.app
        </a>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {topics.map(([title, body]) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-lg border border-indigo-200 bg-indigo-50 p-6">
        <h2 className="text-xl font-bold text-indigo-950">Useful next pages</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link href="/product-image-qa-checklist/" className="inline-flex items-center gap-2 font-semibold text-indigo-800 hover:text-indigo-950">QA checklist <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/resources/" className="inline-flex items-center gap-2 font-semibold text-indigo-800 hover:text-indigo-950">Resources <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </main>
  );
}
