export const MAX_MARKETPLACE_FILES = 25;
export const MAX_MARKETPLACE_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_MARKETPLACE_OUTPUT_NAME_LENGTH = 255;
export const SUPPORTED_MARKETPLACE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type MarketplacePlatform = "Amazon" | "Etsy" | "eBay";
export type MarketplaceFile = { name: string; size: number; type: string };

export const marketplaceRules: Record<MarketplacePlatform, { folder: string; size: number; format: "jpeg"; note: string }> = {
  Amazon: { folder: "amazon", size: 2000, format: "jpeg", note: "2000 x 2000 JPG" },
  Etsy: { folder: "etsy", size: 2000, format: "jpeg", note: "2000 x 2000 JPG" },
  eBay: { folder: "ebay", size: 1600, format: "jpeg", note: "1600 x 1600 JPG" },
};

export function isSupportedMarketplaceFile(file: MarketplaceFile): boolean {
  return (SUPPORTED_MARKETPLACE_MIME_TYPES as readonly string[]).includes(file.type) && file.size <= MAX_MARKETPLACE_FILE_BYTES;
}

export function selectMarketplaceFiles<T extends MarketplaceFile>(current: T[], incoming: T[]) {
  const valid = incoming.filter(isSupportedMarketplaceFile);
  const available = Math.max(0, MAX_MARKETPLACE_FILES - current.length);
  const accepted = valid.slice(0, available);
  return {
    files: [...current, ...accepted],
    accepted,
    invalidCount: incoming.length - valid.length,
    overflowCount: Math.max(0, valid.length - available),
  };
}

export function marketplaceOutputName(name: string, index: number): string {
  const fileName = name.split(/[\\/]/).pop() ?? "";
  const normalizedBase = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const sequence = String(index + 1).padStart(2, "0");
  const extension = ".jpg";
  const maxBaseLength = Math.max(1, MAX_MARKETPLACE_OUTPUT_NAME_LENGTH - sequence.length - 1 - extension.length);
  const truncatedBase = (normalizedBase || "product").slice(0, maxBaseLength).replace(/-+$/g, "");
  const safeBase = truncatedBase || "product".slice(0, maxBaseLength);
  return `${sequence}-${safeBase}${extension}`;
}

export function selectionMessage(invalidCount: number, overflowCount: number): string | null {
  if (invalidCount && overflowCount) return "Some files were skipped. Use PNG, JPG, or WebP up to 10MB each, with no more than 25 files per pack.";
  if (invalidCount) return "Some files were skipped. Use PNG, JPG, or WebP up to 10MB each.";
  if (overflowCount) return "Only the first 25 valid images were added. Remove a file before adding another.";
  return null;
}

export function isNewPackEvent(previousKey: string | null, currentKey: string): boolean {
  return previousKey !== currentKey;
}
