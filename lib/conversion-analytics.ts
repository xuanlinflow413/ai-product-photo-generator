export const conversionEvents = {
  seoPrimaryCtaClick: "seo_primary_cta_click",
  textEditorFileSelected: "text_editor_file_selected",
  textEditorExport: "text_editor_export",
  marketplaceFilesSelected: "marketplace_files_selected",
  marketplacePackPrepared: "marketplace_pack_prepared",
  marketplaceZipExport: "marketplace_zip_export",
  earlyAccessSubmit: "early_access_submit",
} as const;

type PagePath = "/" | "/replace-text-on-product-image/" | "/edit-text-in-product-image/" | "/marketplace-image-fixer/";
type Result = "success" | "validation_error" | "processing_error";
export type FileCountBucket = "1" | "2_5" | "6_10" | "11_25";
export type PlatformSelection = "amazon" | "etsy" | "ebay" | "amazon_etsy" | "amazon_ebay" | "etsy_ebay" | "amazon_etsy_ebay";

export type ConversionEvent =
  | { name: typeof conversionEvents.seoPrimaryCtaClick; properties: { page_path: PagePath; source_page: PagePath | "direct"; cta_id: "guide_hero_editor" | "guide_final_editor" | "pricing_free_tools" | "pricing_paid_interest" } }
  | { name: typeof conversionEvents.textEditorFileSelected; properties: { page_path: "/edit-text-in-product-image/"; file_count_bucket: "1"; result: Result } }
  | { name: typeof conversionEvents.textEditorExport; properties: { page_path: "/edit-text-in-product-image/"; format: "png" | "jpg"; result: Result } }
  | { name: typeof conversionEvents.marketplaceFilesSelected; properties: { page_path: "/marketplace-image-fixer/"; file_count_bucket: FileCountBucket; result: Result } }
  | { name: typeof conversionEvents.marketplacePackPrepared; properties: { page_path: "/marketplace-image-fixer/"; platform_selection: PlatformSelection; file_count_bucket: FileCountBucket; result: Result } }
  | { name: typeof conversionEvents.marketplaceZipExport; properties: { page_path: "/marketplace-image-fixer/"; platform_selection: PlatformSelection; file_count_bucket: FileCountBucket; result: Result } }
  | { name: typeof conversionEvents.earlyAccessSubmit; properties: { page_path: "/"; result: Result } };

export function fileCountBucket(count: number): FileCountBucket {
  if (count <= 1) return "1";
  if (count <= 5) return "2_5";
  if (count <= 10) return "6_10";
  return "11_25";
}

export function platformSelection(platforms: string[]): PlatformSelection {
  const normalized = ["amazon", "etsy", "ebay"].filter((platform) => platforms.some((value) => value.toLowerCase() === platform));
  if (normalized.length === 0) throw new Error("At least one supported marketplace is required");
  return normalized.join("_") as PlatformSelection;
}

/** Analytics is deliberately fire-and-forget and can never block a product workflow. */
export function trackConversion(event: ConversionEvent): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify(event);
    if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon("/api/analytics/events", new Blob([body], { type: "application/json" }))) return;
    void fetch("/api/analytics/events", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true, credentials: "omit" }).catch(() => undefined);
  } catch {
    // Browser privacy controls and unavailable networking are non-fatal.
  }
}
