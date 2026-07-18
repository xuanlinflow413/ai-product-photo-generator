import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy | EditImages",
  description: "How EditImages handles local image processing, AI edit uploads, analytics, and billing data.",
  alternates: { canonical: "https://editimages.app/privacy/" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-14 text-slate-900 sm:px-6 lg:py-20">
      <Link href="/" className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">Back to EditImages</Link>
      <h1 className="mt-8 text-4xl font-bold tracking-tight">Privacy</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated: July 18, 2026</p>
      <div className="mt-10 space-y-8 leading-7 text-slate-700">
        <section><h2 className="text-2xl font-bold text-slate-950">Local tools</h2><p className="mt-3">The Marketplace Image Fixer and local text editor process selected files in your browser. Those workflows do not upload the source files to EditImages servers.</p></section>
        <section><h2 className="text-2xl font-bold text-slate-950">AI edits</h2><p className="mt-3">When you explicitly run an AI edit, the selected image and instruction are sent to the configured model service for that request. The request is not intended to be stored as an EditImages asset. Do not upload confidential material unless you are authorized to do so.</p></section>
        <section><h2 className="text-2xl font-bold text-slate-950">Accounts and billing</h2><p className="mt-3">Sign-in, subscription, credits, and payment status are handled through the configured account and billing services. Payment card details are handled by the payment provider, not stored in the EditImages site database.</p></section>
        <section><h2 className="text-2xl font-bold text-slate-950">Analytics</h2><p className="mt-3">We use aggregate conversion events such as tool starts, successful exports, and pricing clicks. Events are designed not to include image contents, filenames, instructions, order IDs, or message text.</p></section>
        <section><h2 className="text-2xl font-bold text-slate-950">Contact</h2><p className="mt-3">For privacy questions or deletion requests, email <a className="font-semibold text-indigo-700 hover:text-indigo-900" href="mailto:support@editimages.app">support@editimages.app</a>.</p></section>
      </div>
    </main>
  );
}
