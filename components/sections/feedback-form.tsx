"use client";

import { FormEvent, useState } from "react";
import { MessageSquare, Send } from "lucide-react";

type FeedbackStatus = "idle" | "sending" | "success" | "error";

const categories = [
  ["text_edit", "Text removal or overlay"],
  ["ai_edit", "AI edit result"],
  ["marketplace", "Marketplace export"],
  ["other", "Other suggestion"],
] as const;

export function FeedbackForm() {
  const [category, setCategory] = useState<(typeof categories)[number][0]>("text_edit");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FeedbackStatus>("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (message.trim().length < 10 || status === "sending") return;
    setStatus("sending");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          email: email.trim(),
          pagePath: window.location.pathname,
          company: "",
          website: "",
        }),
      });
      if (!response.ok) throw new Error("Feedback request failed");
      setMessage("");
      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="feedback" className="border-y border-slate-200 bg-slate-50 px-4 py-14">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <MessageSquare className="h-6 w-6 text-indigo-700" aria-hidden="true" />
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Tell us what needs to work better</h2>
          <p className="mt-3 max-w-xl leading-7 text-slate-600">Send a concrete example, such as a white-box text removal that still leaves characters behind. We use these reports to prioritize the next improvements.</p>
        </div>
        <form onSubmit={submit} className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-900">Suggestion type
              <select value={category} onChange={(event) => setCategory(event.target.value as (typeof categories)[number][0])} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal">
                {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-900">Email (optional)
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} placeholder="you@example.com" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal" />
            </label>
          </div>
          <label className="mt-4 block text-sm font-semibold text-slate-900">What happened or what should change?
            <textarea required minLength={10} maxLength={2000} rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe the image, the action you chose, and the result you expected." className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal" />
          </label>
          <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
            <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500" role="status">{status === "success" ? "Thanks. Your suggestion was received." : status === "error" ? "We could not submit this yet. Please try again." : "Please do not include passwords or private image files."}</p>
            <button type="submit" disabled={status === "sending" || message.trim().length < 10} className="button-primary shrink-0"><Send className="h-4 w-4" aria-hidden="true" />{status === "sending" ? "Sending…" : "Send suggestion"}</button>
          </div>
        </form>
      </div>
    </section>
  );
}
