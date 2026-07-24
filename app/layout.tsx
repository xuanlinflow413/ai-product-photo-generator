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
  title: "AI Product Image Editor for E-commerce Sellers | EditImages",
  description:
    "Replace product-image wording exactly in the browser, use focused AI tasks for authorized overlays, backgrounds, cleanup, and scenes, then prepare marketplace-ready exports.",
  openGraph: {
    title: "AI Product Image Editor for E-commerce Sellers | EditImages",
    description:
      "Replace wording exactly or use focused AI edits, review the result, and prepare Amazon, Etsy, and eBay exports.",
    type: "website",
    locale: "en_US",
    url: "https://editimages.app",
  },
  twitter: {
    card: "summary",
    title: "EditImages",
    description: "Replace product-image wording exactly or use focused AI tasks, then prepare marketplace exports.",
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
