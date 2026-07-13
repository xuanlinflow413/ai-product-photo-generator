import Link from "next/link";

export function ToolWorkspace() {
  return (
    <section id="workflows" className="bg-slate-50 px-4 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Focused workflows</p><h2 className="mt-2 text-3xl font-bold text-slate-900">Product image work, without the tool pile</h2><p className="mt-3 text-slate-600">Use the right workflow for the job: preview product scenes, prepare marketplace packs, or edit wording directly in a local browser canvas.</p></div>
        <div className="grid gap-5 md:grid-cols-3">
          <Link href="#demo" className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><p className="text-sm font-semibold text-indigo-600">01 · Product scenes</p><h3 className="mt-2 text-xl font-semibold text-slate-900">Preview your next listing image</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">Keep the existing product photo demo for quick scene exploration.</p></Link>
          <Link href="/marketplace-image-fixer/" className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><p className="text-sm font-semibold text-indigo-600">02 · Marketplace packs</p><h3 className="mt-2 text-xl font-semibold text-slate-900">Batch-ready Amazon, Etsy, eBay files</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">Resize locally, review previews, and export a ZIP with a manifest.</p></Link>
          <Link href="/edit-text-in-product-image/" className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><p className="text-sm font-semibold text-indigo-600">03 · Edit text</p><h3 className="mt-2 text-xl font-semibold text-slate-900">Replace wording on a product image</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">Select an overlay area, type replacement copy, and export locally.</p></Link>
        </div>
      </div>
    </section>
  );
}
