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

type PlausibleEvent = {
  name: "seo_primary_cta_click" | "text_editor_file_selected" | "text_editor_export" | "marketplace_files_selected" | "marketplace_pack_prepared" | "marketplace_zip_export" | "pricing_cta_click" | "early_access_submit";
  props: Record<string, string>;
};

type Plausible = (name: PlausibleEvent["name"], options: { props: PlausibleEvent["props"]; url: string }) => void;

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

/** Project a conversion onto Plausible's separate, privacy-safe contract. */
export function plausibleEventFor(event: ConversionEvent): PlausibleEvent {
  switch (event.name) {
    case conversionEvents.seoPrimaryCtaClick: {
      const { properties } = event as Extract<ConversionEvent, { name: typeof conversionEvents.seoPrimaryCtaClick }>;
      return {
        name: properties.cta_id === "pricing_free_tools" || properties.cta_id === "pricing_paid_interest" ? "pricing_cta_click" : event.name,
        props: { page_path: properties.page_path, source_page: properties.source_page, cta_id: properties.cta_id },
      };
    }
    case conversionEvents.textEditorFileSelected: {
      const { properties } = event as Extract<ConversionEvent, { name: typeof conversionEvents.textEditorFileSelected }>;
      return { name: event.name, props: { page_path: properties.page_path, file_count_bucket: properties.file_count_bucket, result: properties.result } };
    }
    case conversionEvents.textEditorExport: {
      const { properties } = event as Extract<ConversionEvent, { name: typeof conversionEvents.textEditorExport }>;
      return { name: event.name, props: { page_path: properties.page_path, format: properties.format, result: properties.result } };
    }
    case conversionEvents.marketplaceFilesSelected: {
      const { properties } = event as Extract<ConversionEvent, { name: typeof conversionEvents.marketplaceFilesSelected }>;
      return { name: event.name, props: { page_path: properties.page_path, file_count_bucket: properties.file_count_bucket, result: properties.result } };
    }
    case conversionEvents.marketplacePackPrepared:
    case conversionEvents.marketplaceZipExport: {
      const { properties } = event as Extract<ConversionEvent, { name: typeof conversionEvents.marketplacePackPrepared | typeof conversionEvents.marketplaceZipExport }>;
      return { name: event.name, props: { page_path: properties.page_path, platform_selection: properties.platform_selection, file_count_bucket: properties.file_count_bucket, result: properties.result } };
    }
    case conversionEvents.earlyAccessSubmit: {
      const { properties } = event as Extract<ConversionEvent, { name: typeof conversionEvents.earlyAccessSubmit }>;
      return { name: event.name, props: { page_path: properties.page_path, result: properties.result } };
    }
  }
}

function trackFirstParty(event: ConversionEvent): void {
  const body = JSON.stringify(event);
  if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon("/api/analytics/events", new Blob([body], { type: "application/json" }))) return;
  void fetch("/api/analytics/events", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true, credentials: "omit" }).catch(() => undefined);
}

function trackPlausible(event: ConversionEvent): void {
  const plausible = (window as Window & { plausible?: Plausible }).plausible;
  if (typeof plausible !== "function") return;
  const projected = plausibleEventFor(event);
  plausible(projected.name, { props: projected.props, url: `${window.location.origin}${projected.props.page_path}` });
}

/** Analytics is deliberately fire-and-forget and can never block a product workflow. */
export function trackConversion(event: ConversionEvent): void {
  if (typeof window === "undefined") return;
  try {
    trackFirstParty(event);
  } catch {
    // Browser privacy controls and unavailable networking are non-fatal.
  }
  try {
    trackPlausible(event);
  } catch {
    // Analytics failures must not interrupt editing, export, or navigation.
  }
}
