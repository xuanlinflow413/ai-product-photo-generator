"use client";

import { Check, Mail } from "lucide-react";
import { useState, useCallback } from "react";

interface PricingTier {
  name: string;
  badge?: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonAction: string;
  highlighted?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free Demo",
    price: "$0",
    description: "Try before you buy. No commitment.",
    features: [
      "Upload and preview",
      "6 scene templates",
      "Browser-only processing",
      "No signup required",
    ],
    buttonText: "Try Demo Now",
    buttonAction: "#upload",
  },
  {
    name: "Pro Plan",
    badge: "Coming Soon",
    price: "$9",
    period: "/month",
    description: "Full access when we launch.",
    features: [
      "Full-resolution downloads",
      "All scene templates",
      "Priority generation",
      "Early access to new features",
    ],
    buttonText: "Join Waitlist",
    buttonAction: "waitlist",
    highlighted: true,
  },
  {
    name: "Business",
    badge: "Coming Soon",
    price: "$29",
    period: "/month",
    description: "For teams and agencies.",
    features: [
      "Bulk processing",
      "Custom scenes",
      "API access",
      "Dedicated support",
    ],
    buttonText: "Contact Us",
    buttonAction: "mailto:hello@aiproductphoto.com",
  },
];

export default function Pricing() {
  const [email, setEmail] = useState("");
  const [showWaitlist, setShowWaitlist] = useState(false);

  const handleButtonClick = useCallback((action: string) => {
    if (action === "waitlist") {
      setShowWaitlist(true);
      return;
    }
    if (action.startsWith("mailto:")) {
      window.open(action, "_blank");
      return;
    }
    const el = document.querySelector(action);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section id="pricing" className="w-full py-16 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Simple Pricing
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-xl border p-6 ${
                tier.highlighted
                  ? "border-blue-500 bg-white shadow-lg scale-105"
                  : "border-gray-200 bg-white"
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs font-medium rounded-full">
                  {tier.badge}
                </span>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {tier.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-gray-500">{tier.period}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleButtonClick(tier.buttonAction)}
                className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                  tier.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>

        {showWaitlist && (
          <div className="mt-12 max-w-md mx-auto animate-fade-in">
            <div className="bg-white rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Join the Waitlist
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Want early access to the full AI generator? We&apos;ll notify you when Pro features are ready.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    alert("Thanks! We'll notify you when Pro is ready.");
                    setShowWaitlist(false);
                    setEmail("");
                  }}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
                >
                  Join Waitlist
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
