"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Resources", href: "/resources/" },
    { label: "Scene Demo", href: "#demo" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-slate-900">
          <Camera className="h-6 w-6 text-indigo-600" />
          <span className="text-lg font-semibold">EditImages</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => link.href.startsWith("/") ? (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600"
            >
              {link.label}
            </Link>
          ) : (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/marketplace-image-fixer/"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Image Packs
          </Link>
          <Link href="/edit-text-in-product-image/" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Edit Text</Link>
          <Link
            href="/account/"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Sign in
          </Link>
          <Link href="/marketplace-image-fixer/" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Open Tools
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6 text-slate-700" />
          ) : (
            <Menu className="h-6 w-6 text-slate-700" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => link.href.startsWith("/") ? (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/marketplace-image-fixer/"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600"
              onClick={() => setMobileOpen(false)}
            >
              Image Packs
            </Link>
            <Link href="/edit-text-in-product-image/" className="text-sm font-medium text-slate-600 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>Edit Text</Link>
            <Link
              href="/account/"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/marketplace-image-fixer/"
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
              onClick={() => setMobileOpen(false)}
            >
              Open Tools
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
