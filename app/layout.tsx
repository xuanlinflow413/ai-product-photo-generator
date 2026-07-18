import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PlausibleScript } from "@/components/plausible-script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://editimages.app"),
  title: "EditImages — Marketplace Image Tools for E-commerce Sellers",
  description:
    "Prepare Amazon, Etsy, and eBay image packs locally in your browser, replace text on product images, and use focused cloud edits when available.",
  openGraph: {
    title: "EditImages — Marketplace Image Tools for E-commerce Sellers",
    description:
      "Prepare marketplace image packs locally and edit product-image text with focused workflows.",
    type: "website",
    locale: "en_US",
    url: "https://editimages.app",
  },
  twitter: {
    card: "summary",
    title: "EditImages",
    description: "Prepare marketplace image packs locally and edit product-image text.",
  },
  robots: "index, follow",
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <PlausibleScript />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
