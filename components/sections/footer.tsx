import { Camera } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-slate-700">
            <Camera className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold">EditImages</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500 sm:justify-end">
            <a href="/resources/" className="hover:text-indigo-600">
              Resources
            </a>
            <a href="/product-image-qa-checklist/" className="hover:text-indigo-600">
              QA Checklist
            </a>
            <a href="#demo" className="hover:text-indigo-600">
              Scene Demo
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-indigo-600">
              Pricing
            </a>
            <a href="#faq" className="hover:text-indigo-600">
              FAQ
            </a>
            <a href="/marketplace-image-fixer/" className="hover:text-indigo-600">
              Image Packs
            </a>
            <a href="/edit-text-in-product-image/" className="hover:text-indigo-600">Edit Text</a>
          </nav>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 sm:text-left">
          <p>
            © {new Date().getFullYear()} EditImages. All
            rights reserved.
          </p>
          <p className="mt-1">
            Built for Amazon, Etsy, and eBay sellers.
          </p>
        </div>
      </div>
    </footer>
  );
}
