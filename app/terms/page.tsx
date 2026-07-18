import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms | EditImages",
  description: "Terms for using EditImages local image tools, AI edits, accounts, and exports.",
  alternates: { canonical: "https://editimages.app/terms/" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-14 text-slate-900 sm:px-6 lg:py-20">
      <Link href="/" className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">Back to EditImages</Link>
      <h1 className="mt-8 text-4xl font-bold tracking-tight">Terms</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated: July 18, 2026</p>
      <div className="mt-10 space-y-8 leading-7 text-slate-700">
        <section><h2 className="text-2xl font-bold text-slate-950">Use of the service</h2><p className="mt-3">Use EditImages only for lawful work that you are authorized to perform. You are responsible for the source files, text, trademarks, claims, and marketplace listings you create or publish.</p></section>
        <section><h2 className="text-2xl font-bold text-slate-950">Tool limitations</h2><p className="mt-3">Presets, previews, and exports do not guarantee marketplace approval, ranking, accessibility, conversion, or legal compliance. Review final assets against current platform and category requirements.</p></section>
        <section><h2 className="text-2xl font-bold text-slate-950">Credits and subscriptions</h2><p className="mt-3">Credit use, billing intervals, renewal, cancellation, and available plans are shown in the pricing and account surfaces. Do not assume a future or unavailable feature is included in a paid plan.</p></section>
        <section><h2 className="text-2xl font-bold text-slate-950">Availability</h2><p className="mt-3">We may change, suspend, or retire features. Local exports and cloud actions may have different availability and limits.</p></section>
        <section><h2 className="text-2xl font-bold text-slate-950">Contact</h2><p className="mt-3">Questions about these terms can be sent to <a className="font-semibold text-indigo-700 hover:text-indigo-900" href="mailto:support@editimages.app">support@editimages.app</a>.</p></section>
      </div>
    </main>
  );
}
