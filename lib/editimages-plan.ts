export const SELLER_PLAN = {
  id: "editimages-seller-monthly",
  name: "Seller",
  priceCents: 900,
  creditsPerPeriod: 100,
  interval: "month",
} as const;

export function formatSellerPrice(priceCents: number = SELLER_PLAN.priceCents): string {
  return `$${Math.round(priceCents / 100)}`;
}