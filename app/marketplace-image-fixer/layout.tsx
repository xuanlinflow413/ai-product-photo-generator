import type { Metadata } from "next";

const url = "https://editimages.app/marketplace-image-fixer/";

export const metadata: Metadata = {
  title: "Multi-Marketplace Image Pack Maker | EditImages",
  description: "Process one local image batch into separate Amazon, Etsy, and eBay folders, a manifest, and one organized ZIP.",
  alternates: { canonical: url },
  openGraph: {
    title: "Multi-Marketplace Image Pack Maker | EditImages",
    description: "Process one local image batch into separate Amazon, Etsy, and eBay folders, a manifest, and one organized ZIP.",
    url,
    type: "website",
  },
};

export default function MarketplaceImageFixerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Marketplace Image Fixer",
    url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    description: "Process one local image batch into separate Amazon, Etsy, and eBay folders, a manifest, and one organized ZIP.",
  }) }} /></>;
}
