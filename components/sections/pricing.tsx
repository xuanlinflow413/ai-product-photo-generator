"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { conversionEvents, trackConversion } from "@/lib/conversion-analytics";
import { SELLER_PLAN, formatSellerPrice } from "@/lib/editimages-plan";

const plans = [
  {
    name: "Local tools",
    description: "For preparing images in your browser",
    price: "$0",
    period: "",
    features: ["Marketplace image packs", "Text overlay editor", "Local previews and exports", "No credits used for local tools"],
    cta: "Use free tools",
    href: "#workflows",
    highlight: false,
  },
  {
    name: SELLER_PLAN.name,
    description: "For sellers using AI edits and cloud exports each month",
    price: formatSellerPrice(),
    period: "/ month",
    features: ["100 credits every billing month", "1 credit per successful AI edit", "1 credit per successful cloud export", "Local editing tools included free"],
    cta: "Sign in to subscribe",
    href: "/account/",
    highlight: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center"><p className="text-xs font-bold uppercase text-indigo-700">Pricing</p><h2 className="mt-2 text-3xl font-bold text-slate-900">100 credits for your monthly product image work</h2><p className="mx-auto mt-3 max-w-2xl text-slate-600">Use credits for successful AI edits and cloud exports. Keep using local editing tools for free.</p></div>
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-lg border p-6 ${plan.highlight ? "border-2 border-slate-900 bg-slate-50" : "border-slate-200 bg-white"}`}>
              {plan.highlight && <span className="mb-5 inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"><Sparkles className="h-3.5 w-3.5" />For ongoing image work</span>}
              <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3><p className="mt-1 min-h-10 text-sm text-slate-500">{plan.description}</p>
              <div className="my-6"><span className="text-4xl font-bold text-slate-900">{plan.price}</span>{plan.period && <span className="ml-1 text-sm text-slate-500">{plan.period}</span>}</div>
              <ul className="mb-6 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{feature}</li>)}</ul>
              <Link href={plan.href} onClick={() => trackConversion({ name: conversionEvents.seoPrimaryCtaClick, properties: { page_path: "/", source_page: "/", cta_id: plan.highlight ? "pricing_subscribe" : "pricing_free_tools" } })} className={plan.highlight ? "button-primary w-full" : "button-secondary w-full"}>{plan.cta}</Link>
              <p className="mt-3 text-xs leading-5 text-slate-500">{plan.highlight ? "Unused monthly credits do not roll over. Renews monthly until canceled. No automatic overage charges." : "No subscription required."}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-slate-600">New accounts receive 2 one-time welcome credits after signing in. No payment method is required for the welcome grant.</p>
      </div>
    </section>
  );
}