import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://editimages.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    { url: "https://editimages.app/marketplace-image-fixer/", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://editimages.app/edit-text-in-product-image/", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
