import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const accountSource = await readFile(new URL("../app/account/page.tsx", import.meta.url), "utf8");
const pricingSource = await readFile(new URL("../components/sections/pricing.tsx", import.meta.url), "utf8");
const faqSource = await readFile(new URL("../components/sections/faq.tsx", import.meta.url), "utf8");
const homeSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("Account renders the production Seller plan and exact checkout contract", () => {
  assert.match(accountSource, /plans\.find\(\(plan\) => plan\.id === SELLER_PLAN\.id\)/);
  assert.match(accountSource, /plan_id: planId/);
  assert.doesNotMatch(accountSource, /success_url:|cancel_url:/);
  assert.match(accountSource, /api<\{ sessionId: string; url: string \}>\("\/api\/checkout"/);
  assert.match(accountSource, /safeBillingUrl\(result\.url\)/);
  assert.match(accountSource, /new Set\(\["checkout\.stripe\.com", "billing\.stripe\.com"\]\)/);
  assert.doesNotMatch(accountSource, /endsWith\("stripe\.com"\)/);
  assert.match(accountSource, /Subscribe for \$\{formatSellerPrice\(sellerPlan\.price_cents\)\}\/month/);
});

test("Account consumes the production plans contract and reads checkout status after mount", () => {
  assert.match(accountSource, /billing_interval: string \| null; credits_allocated: number/);
  assert.match(accountSource, /sellerPlan\.credits_allocated/);
  assert.doesNotMatch(accountSource, /credits_per_period|sellerPlan\.interval/);
  assert.match(accountSource, /setCheckoutStatus\(value === "success" \|\| value === "canceled"/);
  assert.doesNotMatch(accountSource, /typeof window === "undefined"/);
});

test("Account covers signed-out, loading, checkout failure, active subscription, and history states", () => {
  assert.match(accountSource, /Your session has expired/);
  assert.match(accountSource, /role="status" aria-live="polite"/);
  assert.match(accountSource, /Your card has not been charged\. Please try again\./);
  assert.match(accountSource, /Manage subscription/);
  assert.match(accountSource, /Purchase history/);
  assert.match(accountSource, /Confirming your subscription/);
  assert.match(accountSource, /"active", "trialing", "past_due", "unpaid", "incomplete"/);
  assert.match(accountSource, /previous Seller subscription has ended/);
  assert.doesNotMatch(accountSource, /"past_due", "canceled"/);
  assert.match(accountSource, /status === "past_due" \|\| subscription\.status === "unpaid"/);
  assert.match(accountSource, /status === "incomplete" \? "Setup incomplete"/);
});

test("Account has stable narrow viewport layout and full-width mobile actions", () => {
  assert.match(accountSource, /overflow-x-hidden/);
  assert.match(accountSource, /grid gap-5 lg:grid-cols/);
  assert.ok([...accountSource.matchAll(/w-full sm:w-auto/g)].length >= 3);
  assert.doesNotMatch(accountSource, /rounded-(?:xl|2xl|3xl)/);
});

test("homepage pricing and FAQ describe the live plan without research-era copy", () => {
  const homepageBillingSource = `${pricingSource}\n${faqSource}\n${homeSource}`;
  assert.match(pricingSource, /100 credits every billing month/);
  assert.match(pricingSource, /Sign in to subscribe/);
  assert.match(pricingSource, /href: "\/account\/"/);
  assert.match(faqSource, /Unused monthly credits expire/);
  assert.doesNotMatch(homepageBillingSource, /pricing test|proposed|no payment is collected|Register paid interest|Planned:/i);
  assert.doesNotMatch(homeSource, /Waitlist/);
});