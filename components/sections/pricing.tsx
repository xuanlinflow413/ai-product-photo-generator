"use client";

import { Check, Zap } from "lucide-react";
import { conversionEvents, trackConversion } from "@/lib/conversion-analytics";

const plans = [
  {
    name: "Free",
    description: "For individual images and local workflows",
    price: "$0",
    period: "forever",
    icon: null,
    features: ["Upload and preview locally", "Marketplace ZIP packs", "Text overlay editor", "Scene workflow preview", "No account required"],
    cta: "Use free tools",
    href: "#workflows",
    highlight: false,
  },
  {
    name: "Seller (proposed)",
    description: "Help us validate the next paid workflow",
    price: "$9",
    period: "/month",
    icon: Zap,
    features: ["Free local tools stay available", "Planned: saved workflow history", "Planned: larger batch packs", "Planned: priority high-resolution exports", "Shape the first paid release"],
    cta: "Register paid interest",
    href: "#waitlist",
    highlight: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Simple now. Seller plan next?</h2>
          <p className="mt-2 text-slate-600">Keep single-image and local tools free. Help validate a paid seller workflow.</p>
          <p className="mt-2 text-sm text-amber-600">Seller is a pricing test, not a purchasable plan. No payment is collected today.</p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div key={plan.name} className={`relative rounded-2xl border p-6 ${plan.highlight ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600" : "border-slate-200 bg-white"}`}>
                {plan.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Pricing test</span>}
                <div className="mb-4 flex items-center gap-3">
                  {Icon && <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"><Icon className="h-5 w-5" /></div>}
                  <div><h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3><p className="text-xs text-slate-500">{plan.description}</p></div>
                </div>
                <div className="mb-6"><span className="text-3xl font-bold text-slate-900">{plan.price}</span><span className="text-sm text-slate-500">{plan.period}</span></div>
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />{feature}</li>)}
                </ul>
                <a href={plan.href} onClick={() => trackConversion({ name: conversionEvents.seoPrimaryCtaClick, properties: { page_path: "/", source_page: "/", cta_id: plan.name === "Free" ? "pricing_free_tools" : "pricing_paid_interest" } })} className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${plan.highlight ? "bg-indigo-600 text-white hover:bg-indigo-700" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>{plan.cta}</a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}