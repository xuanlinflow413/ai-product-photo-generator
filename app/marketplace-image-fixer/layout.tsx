import type { Metadata } from "next";

const url = "https://editimages.app/marketplace-image-fixer/";

export const metadata: Metadata = {
  title: "Marketplace Image Fixer | EditImages",
  description: "Prepare product images for Amazon, Etsy, and eBay with local browser processing.",
  alternates: { canonical: url },
  openGraph: {
    title: "Marketplace Image Fixer | EditImages",
    description: "Prepare product images for Amazon, Etsy, and eBay with local browser processing.",
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
    description: "Prepare product images for Amazon, Etsy, and eBay with local browser processing.",
  }) }} /></>;
}
