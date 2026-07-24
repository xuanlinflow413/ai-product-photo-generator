import type { Metadata } from "next";

const canonicalUrl = "https://editimages.app/edit-text-in-product-image/";

export const metadata: Metadata = {
  title: "AI Product Image Editor | EditImages",
  description: "Remove text from a white product-image label in your browser, or use focused AI tasks for authorized overlays, cleanup, backgrounds, and product scenes.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "AI Product Image Editor | EditImages",
    description: "Replace product-image wording exactly, review the result, and export it for your listing workflow.",
    url: canonicalUrl,
    type: "website",
  },
};

export default function EditTextInProductImageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
