import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refunds and Billing Support | EditImages",
  description: "Billing, cancellation, failed AI edit credit refunds, and support information for EditImages.",
  alternates: { canonical: "https://editimages.app/refunds/" },
};

export default function RefundsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-14 text-slate-900 sm:px-6 lg:py-20">
      <Link href="/" className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">Back to EditImages</Link>
      <h1 className="mt-8 text-4xl font-bold tracking-tight">Refunds and billing support</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated: July 18, 2026</p>
      <div className="mt-10 space-y-8 leading-7 text-slate-700">
        <section><h2 className="text-2xl font-bold text-slate-950">Failed AI edits</h2><p className="mt-3">A failed or canceled AI edit should not permanently consume a credit. If the balance is incorrect, contact support with the approximate time and account email. Do not send image contents or sensitive instructions in the first message.</p></section>
        <section><h2 className="text-2xl font-bold text-slate-950">Subscriptions</h2><p className="mt-3">You can cancel a recurring subscription through the billing portal. Cancellation stops future renewal; access normally continues through the current paid period unless the billing service says otherwise.</p></section>
        <section><h2 className="text-2xl font-bold text-slate-950">Payment disputes</h2><p className="mt-3">For duplicate charges, incorrect plan charges, or a checkout problem, email <a className="font-semibold text-indigo-700 hover:text-indigo-900" href="mailto:support@editimages.app">support@editimages.app</a> with the account email, approximate time, and provider receipt if available.</p></section>
        <section><h2 className="text-2xl font-bold text-slate-950">Local exports</h2><p className="mt-3">Free local exports do not create a server-side order. If a browser download fails, retry the export or contact support with the browser and file-count details.</p></section>
      </div>
    </main>
  );
}
