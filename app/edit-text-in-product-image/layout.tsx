import type { Metadata } from "next";

const url = "https://editimages.app/edit-text-in-product-image/";

export const metadata: Metadata = {
  title: "Edit Text in Product Image | EditImages",
  description: "Replace text on product images locally in your browser and export PNG or JPG.",
  alternates: { canonical: url },
  openGraph: {
    title: "Edit Text in Product Image | EditImages",
    description: "Replace text on product images locally in your browser and export PNG or JPG.",
    url,
    type: "website",
  },
};

export default function EditTextLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Edit Text in Product Image",
    url,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web browser",
    description: "Replace text on product images locally in your browser and export PNG or JPG.",
  }) }} /></>;
}
