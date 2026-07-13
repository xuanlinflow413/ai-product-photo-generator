"use client";

import { useState } from "react";
import { ArrowRight, Bell, Mail } from "lucide-react";
import { conversionEvents, trackConversion } from "@/lib/conversion-analytics";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [useCase, setUseCase] = useState("");
  const [plan, setPlan] = useState("seller");
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, plan, useCase, company: form.get("company"), website: form.get("website") }),
      });
      if (!response.ok) {
        throw new Error(response.status === 503
          ? "Signup is not available yet. Please try again later."
          : "We could not save your request. Please check your email and retry.");
      }
      trackConversion({ name: conversionEvents.earlyAccessSubmit, properties: { page_path: "/", result: "success" } });
      setStatus("submitted");
    } catch (error) {

      setMessage(error instanceof Error ? error.message : "We could not save your request. Please retry.");
      setStatus("error");
    }
  }

  return (
    <section id="waitlist" className="bg-indigo-600 px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
          <Bell className="h-4 w-4" />
          Validate the Seller plan with us
        </div>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Would you pay $9/month for faster listing prep?
        </h2>
        <p className="mt-4 text-lg text-indigo-100">
          The local tools stay free. Tell us if saved workflow history, larger batch packs, and priority exports are worth a paid Seller plan. No charge today.
        </p>

        {status === "submitted" ? (
          <div className="mt-8 rounded-2xl bg-white/10 p-6 backdrop-blur">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <p className="text-lg font-semibold text-white">Interest saved — thank you.</p>
            <p className="mt-2 text-sm text-indigo-200">
              We will only contact you about Seller plan early access. You have not been charged.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl text-left">
            <div className="space-y-3 rounded-2xl bg-white/10 p-5 backdrop-blur">
              <label className="block text-sm font-medium text-white">
                Email
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@store.com" required className="mt-2 w-full rounded-xl border-0 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 outline-none ring-2 ring-white/30 transition focus:ring-white" />
              </label>
              <label className="block text-sm font-medium text-white">
                Which option best fits?
                <select value={plan} onChange={(event) => setPlan(event.target.value)} className="mt-2 w-full rounded-xl border-0 bg-white px-4 py-3 text-slate-900 outline-none ring-2 ring-white/30 focus:ring-white">
                  <option value="seller">Yes, I would consider $9/month</option>
                  <option value="undecided">Not sure — keep me informed</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-white">
                What slows down your listing image workflow? <span className="font-normal text-indigo-200">(optional)</span>
                <textarea value={useCase} onChange={(event) => setUseCase(event.target.value)} maxLength={500} rows={2} className="mt-2 w-full rounded-xl border-0 bg-white px-4 py-3 text-slate-900 outline-none ring-2 ring-white/30 focus:ring-white" />
              </label>
              <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <button type="submit" disabled={status === "submitting"} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-70">
                {status === "submitting" ? "Saving…" : "Register my interest"}
                <ArrowRight className="h-5 w-5" />
              </button>
              {status === "error" && <p role="alert" className="text-sm text-red-100">{message}</p>}
            </div>
          </form>
        )}
        <p className="mt-6 text-xs text-indigo-300">
          No payment is collected. We respect your privacy; unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}