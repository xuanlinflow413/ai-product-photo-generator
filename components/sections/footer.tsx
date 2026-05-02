import { Camera } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-slate-700">
            <Camera className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold">AI Product Photo</span>
          </div>

          <nav className="flex gap-6 text-sm text-slate-500">
            <a href="#demo" className="hover:text-indigo-600">
              Demo
            </a>
            <a href="#pricing" className="hover:text-indigo-600">
              Pricing
            </a>
            <a href="#faq" className="hover:text-indigo-600">
              FAQ
            </a>
          </nav>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 sm:text-left">
          <p>
            © {new Date().getFullYear()} AI Product Photo Generator. All
            rights reserved.
          </p>
          <p className="mt-1">
            Built for Amazon, Etsy, and Shopify sellers.
          </p>
        </div>
      </div>
    </footer>
  );
}
