"use client";

import { useState } from "react";
import { Mail, ArrowRight, Bell } from "lucide-react";

const TALLY_URL = process.env.NEXT_PUBLIC_TALLY_WAITLIST_URL;

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    if (TALLY_URL) {
      // Redirect to Tally form with pre-filled email
      const url = new URL(TALLY_URL);
      url.searchParams.set("email", email);
      window.open(url.toString(), "_blank");
    }

    setSubmitted(true);
  };

  return (
    <section id="waitlist" className="bg-indigo-600 px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
          <Bell className="h-4 w-4" />
          Get early access
        </div>

        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Join the Waitlist
        </h2>
        <p className="mt-4 text-lg text-indigo-100">
          Be the first to know when real AI product photo generation launches.
          No spam — just one email when we are ready.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-2xl bg-white/10 p-6 backdrop-blur">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <p className="text-lg font-semibold text-white">
              {TALLY_URL
                ? "Redirecting to form..."
                : "Thanks for your interest!"}
            </p>
            <p className="mt-2 text-sm text-indigo-200">
              {TALLY_URL
                ? "Please complete the form in the new tab."
                : "We will email you as soon as AI generation is available."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8">
            {TALLY_URL ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 rounded-xl border-0 bg-white px-5 py-4 text-base text-slate-900 placeholder-slate-400 outline-none ring-2 ring-white/30 transition focus:ring-white"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-600 transition hover:bg-indigo-50"
                >
                  Join Waitlist
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <p className="text-lg font-medium text-white">
                  Waitlist form coming soon
                </p>
                <p className="mt-2 text-sm text-indigo-200">
                  We are setting up the waitlist system. Check back shortly or
                  follow us for updates.
                </p>
              </div>
            )}
          </form>
        )}

        <p className="mt-6 text-xs text-indigo-300">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
