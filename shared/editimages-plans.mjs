export const EDITIMAGES_PLANS = [
  {
    id: "editimages-seller-monthly",
    name: "Seller",
    priceCents: 900,
    credits: 100,
    billingInterval: "month",
    checkoutMode: "subscription",
  },
];

export const SELLER_PLAN_ID = "editimages-seller-monthly";

export const SELLER_PLAN = EDITIMAGES_PLANS.find((plan) => plan.id === SELLER_PLAN_ID);

if (!SELLER_PLAN) {
  throw new Error("Seller plan is not configured");
}

export function formatPrice(priceCents) {
  return "$" + Math.round(priceCents / 100);
}

export function toApiPlan(plan) {
  return {
    id: plan.id,
    name: plan.name,
    price_cents: plan.priceCents,
    billing_interval: plan.billingInterval,
    credits_allocated: plan.credits,
  };
}
