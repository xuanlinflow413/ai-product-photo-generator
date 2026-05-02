import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Product Photo Generator — Create E-commerce Images",
  description:
    "Preview AI-generated product photos for your online store. Upload a product image, pick a scene, and see how AI can transform your listings. Built for Amazon, Etsy, and Shopify sellers.",
  keywords: [
    "AI product photo generator",
    "product photo generator",
    "ecommerce product photo generator",
    "Amazon product photo generator",
    "Etsy product photo generator",
    "Shopify product image generator",
    "lifestyle product photo generator",
    "AI product photography tool",
  ],
  openGraph: {
    title: "AI Product Photo Generator — Create E-commerce Images",
    description:
      "Preview AI-generated product photos for your online store. Upload a product image, pick a scene, and see how AI can transform your listings.",
    type: "website",
    locale: "en_US",
    url: "https://ai-product-photo.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Product Photo Generator",
    description:
      "Preview AI-generated product photos for Amazon, Etsy, and Shopify listings.",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://ai-product-photo.vercel.app",
  },
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
