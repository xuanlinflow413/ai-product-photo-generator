"use client";

import { Check, Zap, Building2 } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Try the demo and explore scene templates",
    price: "$0",
    period: "forever",
    icon: null,
    features: [
      "Upload & preview locally",
      "6 scene templates",
      "Mock generation preview",
      "No account required",
    ],
    cta: "Try Demo",
    href: "#demo",
    highlight: false,
  },
  {
    name: "Pro",
    description: "For solo sellers with regular product updates",
    price: "$12",
    period: "/month",
    icon: Zap,
    features: [
      "Everything in Free",
      "Real AI generation",
      "200 generations / month",
      "4 images per generation",
      "2048×2048 resolution",
      "All 15+ scene templates",
      "Commercial usage",
    ],
    cta: "Join Waitlist",
    href: "#waitlist",
    highlight: true,
  },
  {
    name: "Business",
    description: "For teams and agencies managing many SKUs",
    price: "$29",
    period: "/month",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Unlimited generations",
      "8 images per generation",
      "4096×4096 resolution",
      "Batch upload (50 at once)",
      "Custom background upload",
      "API access",
      "Priority support",
    ],
    cta: "Join Waitlist",
    href: "#waitlist",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Pricing</h2>
          <p className="mt-2 text-slate-600">
            Start free. Upgrade when you are ready for real AI generation.
          </p>
          <p className="mt-2 text-sm text-amber-600">
            Note: Pro and Business plans are planned features. Join the waitlist to get early access.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 ${
                  plan.highlight
                    ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}

                <div className="mb-4 flex items-center gap-3">
                  {Icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                      <Icon className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>

                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${
                    plan.highlight
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
