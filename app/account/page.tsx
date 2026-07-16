"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, CreditCard, ExternalLink, LogOut, RefreshCw, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { SELLER_PLAN, formatSellerPrice } from "@/lib/editimages-plan";

type Session = {
  authenticated: boolean;
  user: { email: string; name: string | null } | null;
  credits: { balance: number; lifetime_used: number; lifetime_purchased: number } | null;
  subscription: { status: string; plan_id: string; current_period_end: number; cancel_at_period_end: number } | null;
  purchases: Array<{ plan_id: string; status: string; purchased_at: number }>;
};

type Plan = { id: string; name: string; price_cents: number; interval: string | null; credits_per_period: number };
type LoadState = "loading" | "ready" | "signed-out" | "error";

function formatDate(epochSeconds?: number): string {
  if (!epochSeconds) return "Not available";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(epochSeconds * 1000));
}

function safeBillingUrl(value: string): string {
  const url = new URL(value);
  const allowedHosts = new Set(["checkout.stripe.com", "billing.stripe.com"]);
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) throw new Error("Invalid billing destination");
  return url.toString();
}

export default function Account() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [accountError, setAccountError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const loadAccount = useCallback(async () => {
    setLoadState("loading");
    setAccountError("");
    try {
      const [nextSession, result] = await Promise.all([
        api<Session>("/api/auth/session"),
        api<{ plans: Plan[] }>("/api/plans"),
      ]);
      if (!nextSession.authenticated) {
        setLoadState("signed-out");
        return;
      }
      setSession(nextSession);
      setPlans(result.plans);
      setLoadState("ready");
    } catch {
      setAccountError("Your account data is temporarily unavailable. No changes were made.");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      api<Session>("/api/auth/session"),
      api<{ plans: Plan[] }>("/api/plans"),
    ]).then(([nextSession, result]) => {
      if (!active) return;
      if (!nextSession.authenticated) {
        setLoadState("signed-out");
        return;
      }
      setSession(nextSession);
      setPlans(result.plans);
      setLoadState("ready");
    }).catch(() => {
      if (!active) return;
      setAccountError("Your account data is temporarily unavailable. No changes were made.");
      setLoadState("error");
    });
    return () => { active = false; };
  }, []);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    window.location.assign("/login/");
  }

  async function checkout(planId: string) {
    if (checkoutPlanId) return;
    setCheckoutPlanId(planId);
    setCheckoutError("");
    try {
      const result = await api<{ sessionId: string; url: string }>("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          plan_id: planId,
          success_url: `${window.location.origin}/account/?checkout=success`,
          cancel_url: `${window.location.origin}/account/?checkout=canceled`,
        }),
      });
      window.location.assign(safeBillingUrl(result.url));
    } catch (reason) {
      setCheckoutError(reason instanceof Error && reason.message.includes("active subscription")
        ? "Seller is already active. Refresh your account to see the latest status."
        : "Your card has not been charged. Please try again.");
      setCheckoutPlanId(null);
    }
  }

  async function openPortal() {
    setPortalLoading(true);
    setCheckoutError("");
    try {
      const result = await api<{ url: string }>("/api/billing/portal", { method: "POST" });
      window.location.assign(safeBillingUrl(result.url));
    } catch {
      setCheckoutError("We couldn’t open subscription management. Please try again.");
      setPortalLoading(false);
    }
  }

  if (loadState === "loading") return <AccountShell><div role="status" aria-live="polite" className="grid gap-4 sm:grid-cols-2"><Skeleton /><Skeleton /></div></AccountShell>;
  if (loadState === "signed-out") return <AccountShell><StatusPanel title="Your session has expired" body="Sign in again to view your EditImages credits and subscription."><Link href="/login/" className="button-primary">Sign in</Link></StatusPanel></AccountShell>;
  if (loadState === "error" || !session) return <AccountShell><StatusPanel title="We couldn’t load your account" body={accountError}><button onClick={() => void loadAccount()} className="button-primary"><RefreshCw className="h-4 w-4" />Try again</button></StatusPanel></AccountShell>;

  const sellerPlan = plans.find((plan) => plan.id === SELLER_PLAN.id);
  const subscription = session.subscription;
  const isSubscribed = Boolean(subscription && ["active", "trialing", "past_due", "canceled"].includes(subscription.status));
  const queryStatus = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("checkout");
  const creditBalance = session.credits?.balance ?? 0;

  return (
    <AccountShell onLogout={() => void logout()} email={session.user?.email}>
      {queryStatus === "canceled" && <Notice tone="neutral">Checkout canceled. No charge was made.</Notice>}
      {queryStatus === "success" && <Notice tone={isSubscribed ? "success" : "neutral"}>{isSubscribed ? "Subscription active. Your Seller plan is ready." : "Confirming your subscription. Refresh in a moment if your account has not updated yet."}</Notice>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="credit-balance-title">
          <div className="flex items-start justify-between gap-4"><div><p id="credit-balance-title" className="text-sm font-semibold text-slate-600">Credit balance</p><p className="mt-2 text-4xl font-bold text-slate-950">{creditBalance} <span className="text-lg font-medium text-slate-500">{creditBalance === 1 ? "credit" : "credits"}</span></p></div><span className="rounded-md bg-emerald-50 p-2 text-emerald-700"><Sparkles className="h-5 w-5" /></span></div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{isSubscribed ? "Your Seller allowance includes 100 credits each billing month. Unused monthly credits do not roll over." : creditBalance > 0 ? "Your one-time welcome credits are ready to use." : "You’re out of credits. Subscribe to Seller to continue using credit-based actions."}</p>
          <Link href="/edit-text-in-product-image/" className="button-primary mt-6 w-full sm:w-auto">Open workspace <ExternalLink className="h-4 w-4" /></Link>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="welcome-title">
          <div className="flex items-center gap-3"><span className="rounded-md bg-indigo-50 p-2 text-indigo-700"><CreditCard className="h-5 w-5" /></span><h2 id="welcome-title" className="font-semibold text-slate-950">Your first 2 credits are on us</h2></div>
          <p className="mt-4 text-sm leading-6 text-slate-600">New EditImages accounts receive 2 one-time credits. No payment method is required. Use them for successful AI edits or cloud exports.</p>
          <p className="mt-3 text-sm font-medium text-slate-800">Local editing tools do not use credits.</p>
          {session.credits && <p className="mt-4 inline-flex rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">2 welcome credits added</p>}
        </section>
      </div>

      <section className="mt-8 border-t border-slate-200 pt-8" aria-labelledby="plan-title">
        <div className="mb-5"><p className="text-xs font-bold uppercase text-indigo-700">Subscription</p><h2 id="plan-title" className="mt-1 text-xl font-bold text-slate-950">{isSubscribed ? "Current plan" : "Seller monthly"}</h2></div>
        {isSubscribed && subscription ? (
          <div className="rounded-lg border border-slate-300 bg-white p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-3"><p className="text-2xl font-bold text-slate-950">Seller</p><SubscriptionBadge status={subscription.status} canceled={Boolean(subscription.cancel_at_period_end)} /></div><p className="mt-1 text-sm text-slate-600">{formatSellerPrice()}/month · 100 credits per billing month</p></div><button onClick={() => void openPortal()} disabled={portalLoading} className="button-secondary w-full sm:w-auto">{portalLoading ? "Opening…" : "Manage subscription"}<ExternalLink className="h-4 w-4" /></button></div><p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600">{subscription.cancel_at_period_end ? `Your plan remains active until ${formatDate(subscription.current_period_end)}. It will not renew.` : subscription.status === "past_due" ? "We couldn’t renew your subscription. Update your payment method to keep Seller active." : `Renews on ${formatDate(subscription.current_period_end)}.`}</p></div>
        ) : sellerPlan ? (
          <div className="rounded-lg border-2 border-slate-900 bg-white p-5 sm:p-7"><div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"><div><p className="text-sm font-semibold text-indigo-700">For ongoing image work</p><h3 className="mt-2 text-2xl font-bold text-slate-950">{sellerPlan.name}</h3><p className="mt-1 text-sm text-slate-600">For sellers who need ongoing AI edits and cloud exports.</p><p className="mt-5 text-4xl font-bold text-slate-950">{formatSellerPrice(sellerPlan.price_cents)} <span className="text-base font-medium text-slate-500">/ month</span></p></div><ul className="space-y-3 text-sm text-slate-700">{[`${sellerPlan.credits_per_period} credits every billing month`, "1 credit per successful AI edit", "1 credit per successful cloud export", "Local editing tools stay free", "Cancel anytime"].map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{feature}</li>)}</ul></div><div className="mt-6 border-t border-slate-200 pt-6"><button onClick={() => void checkout(sellerPlan.id)} disabled={Boolean(checkoutPlanId)} aria-label={checkoutPlanId ? "Opening checkout" : undefined} className="button-primary w-full sm:w-auto">{checkoutPlanId ? "Opening secure checkout…" : `Subscribe for ${formatSellerPrice(sellerPlan.price_cents)}/month`}<ExternalLink className="h-4 w-4" /></button><p className="mt-3 text-xs leading-5 text-slate-500">Renews monthly until canceled. Unused monthly credits do not roll over. No automatic overage charges.</p></div></div>
        ) : <Notice tone="neutral">Seller checkout is temporarily unavailable. No changes were made to your account.</Notice>}
        {checkoutError && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4"><p className="font-semibold text-red-900">We couldn’t complete that billing action</p><p className="mt-1 text-sm text-red-800">{checkoutError}</p></div>}
      </section>

      <section className="mt-8 border-t border-slate-200 pt-8" aria-labelledby="credits-explained-title"><h2 id="credits-explained-title" className="text-xl font-bold text-slate-950">Credits explained</h2><div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">{[["What uses a credit?", "A successful AI edit or cloud export uses 1 credit. Local editing tools use none."], ["What if an action fails?", "Failed or canceled actions should not use a credit."], ["Do credits roll over?", "Unused Seller monthly credits do not roll over to the next billing month."], ["What happens at zero?", "Credit-based actions pause. There are no automatic overage charges, and local tools remain available."]].map(([title, body]) => <div key={title}><h3 className="text-sm font-semibold text-slate-900">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{body}</p></div>)}</div></section>

      {session.purchases.length > 0 && <section className="mt-8 border-t border-slate-200 pt-8" aria-labelledby="purchase-title"><h2 id="purchase-title" className="text-xl font-bold text-slate-950">Purchase history</h2><div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">{session.purchases.map((purchase) => <div key={`${purchase.plan_id}-${purchase.purchased_at}`} className="flex flex-col justify-between gap-2 p-4 text-sm sm:flex-row sm:items-center"><div><p className="font-medium text-slate-900">{purchase.plan_id}</p><p className="mt-1 text-slate-500">{formatDate(purchase.purchased_at)}</p></div><span className="font-semibold capitalize text-emerald-700">{purchase.status}</span></div>)}</div></section>}
    </AccountShell>
  );
}

function AccountShell({ children, onLogout, email }: { children: React.ReactNode; onLogout?: () => void; email?: string }) {
  return <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6"><Link href="/" className="text-lg font-bold tracking-normal text-slate-950">EditImages</Link><div className="flex items-center gap-2"><Link href="/edit-text-in-product-image/" className="button-secondary px-3"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Back to workspace</span></Link>{onLogout && <button onClick={onLogout} aria-label="Sign out" title="Sign out" className="rounded-md border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"><LogOut className="h-4 w-4" /></button>}</div></div></header><div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12"><div className="mb-7"><h1 className="text-3xl font-bold text-slate-950">Account</h1><p className="mt-2 break-all text-sm text-slate-600">{email || "Manage your EditImages credits and subscription."}</p></div>{children}</div></main>;
}

function Skeleton() { return <div className="h-44 animate-pulse rounded-lg border border-slate-200 bg-white p-6"><div className="h-4 w-28 rounded bg-slate-200" /><div className="mt-5 h-10 w-40 rounded bg-slate-200" /><div className="mt-5 h-4 w-full rounded bg-slate-100" /></div>; }
function StatusPanel({ title, body, children }: { title: string; body: string; children: React.ReactNode }) { return <section className="max-w-xl rounded-lg border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p><div className="mt-5">{children}</div></section>; }
function Notice({ children, tone }: { children: React.ReactNode; tone: "success" | "neutral" }) { return <div role="status" className={`mb-5 rounded-lg border px-4 py-3 text-sm ${tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700"}`}>{children}</div>; }
function SubscriptionBadge({ status, canceled }: { status: string; canceled: boolean }) { const label = canceled ? "Canceled" : status === "past_due" ? "Payment issue" : "Active"; const color = label === "Active" ? "bg-emerald-50 text-emerald-700" : label === "Payment issue" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"; return <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${color}`}>{label}</span>; }