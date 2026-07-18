import { MetadataRoute } from "next";

export const dynamic = "force-static";

const baseUrl = "https://editimages.app";
const contentDate = "2026-07-18";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, lastModified: contentDate, changeFrequency: "weekly", priority: 1 },
    { url: baseUrl + "/marketplace-image-fixer/", lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: baseUrl + "/resize-product-images-for-marketplaces/", lastModified: contentDate, changeFrequency: "monthly", priority: 0.75 },
    { url: baseUrl + "/amazon-product-image-resizer/", lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: baseUrl + "/etsy-listing-image-resizer/", lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: baseUrl + "/ebay-image-resizer/", lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: baseUrl + "/edit-text-in-product-image/", lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: baseUrl + "/replace-text-on-product-image/", lastModified: contentDate, changeFrequency: "monthly", priority: 0.75 },
    { url: baseUrl + "/resources/", lastModified: contentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: baseUrl + "/product-image-qa-checklist/", lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: baseUrl + "/support/", lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: baseUrl + "/privacy/", lastModified: contentDate, changeFrequency: "yearly", priority: 0.3 },
    { url: baseUrl + "/terms/", lastModified: contentDate, changeFrequency: "yearly", priority: 0.3 },
    { url: baseUrl + "/refunds/", lastModified: contentDate, changeFrequency: "yearly", priority: 0.3 },
  ];
}
