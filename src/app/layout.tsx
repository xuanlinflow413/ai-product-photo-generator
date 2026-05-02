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
  title: "AI Product Photo Generator — Create E-Commerce Product Images",
  description: "Upload your product photo, choose a scene, and see how AI can transform it into professional e-commerce images. Try the demo — no signup needed.",
  keywords: ["AI product photo generator", "product photo generator", "ecommerce product photo generator", "Amazon product photo generator", "Shopify product image generator", "Etsy product photo tool", "lifestyle product photo generator"],
  openGraph: {
    title: "AI Product Photo Generator — Create E-Commerce Product Images",
    description: "Upload your product photo, choose a scene, and see how AI can transform it into professional e-commerce images.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Product Photo Generator",
    description: "Upload your product photo, choose a scene, and see how AI can transform it into professional e-commerce images.",
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
