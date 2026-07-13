import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GA4Script } from "@/components/ga4-script";

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
  title: "EditImages — Product Image Workspace for E-commerce Sellers",
  description:
    "Create product scenes, prepare marketplace image packs, and edit text in product images with focused tools for e-commerce sellers.",
  keywords: [
    "AI product photo generator",
    "product photo generator",
    "ecommerce product photo generator",
    "Amazon product photo generator",
    "Etsy product photo generator",
    "Shopify product image generator",
    "lifestyle product photo generator",
    "AI product photography tool",
    "marketplace image fixer",
    "Amazon image pack",
    "bulk product image resize",
  ],
  openGraph: {
    title: "EditImages — Product Image Workspace for E-commerce Sellers",
    description:
      "Create product scenes, prepare marketplace image packs, and edit text in product images.",
    type: "website",
    locale: "en_US",
    url: "https://editimages.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EditImages product image workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EditImages",
    description:
      "Preview AI-generated product photos for Amazon, Etsy, and Shopify listings.",
    images: ["/og-image.png"],
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
      <GA4Script />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
