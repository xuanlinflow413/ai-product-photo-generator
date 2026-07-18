import {
  SELLER_PLAN as SHARED_SELLER_PLAN,
  formatPrice,
} from "@/shared/editimages-plans.mjs";

const sharedSellerPlan = SHARED_SELLER_PLAN!;

export const SELLER_PLAN = {
  id: sharedSellerPlan.id,
  name: sharedSellerPlan.name,
  priceCents: sharedSellerPlan.priceCents,
  creditsPerPeriod: sharedSellerPlan.credits,
  interval: sharedSellerPlan.billingInterval,
} as const;

export function formatSellerPrice(priceCents: number = SELLER_PLAN.priceCents): string {
  return formatPrice(priceCents);
}
