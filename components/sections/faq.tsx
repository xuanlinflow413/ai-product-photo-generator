"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  { question: "What uses a credit?", answer: "A successful AI edit uses 1 credit. A successful cloud export also uses 1 credit. Local editing tools do not use credits." },
  { question: "Will a failed edit use a credit?", answer: "No. A failed or canceled action should not use a credit. If your balance looks incorrect, contact support with the time of the action." },
  { question: "Do monthly credits roll over?", answer: "No. Seller includes 100 credits for each billing month. Unused monthly credits expire when the next billing month begins." },
  { question: "What happens when I run out of credits?", answer: "Credit-based actions pause until your next monthly reset. EditImages does not charge automatic overage fees. Local tools remain available." },
  { question: "How do the 2 welcome credits work?", answer: "Eligible new EditImages accounts receive 2 one-time credits after signing in. No payment method is required, and the grant does not start a subscription." },
  { question: "Are credits shared with other products?", answer: "No. Your sign-in may be shared, but EditImages credits are separate and can only be used in EditImages." },
  { question: "Can I cancel anytime?", answer: "Yes. You can cancel from Manage subscription. Your Seller access continues through the end of the current paid billing period, and you will not be charged again unless you resubscribe." },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return <section id="faq" className="bg-slate-50 px-4 py-16"><div className="mx-auto max-w-3xl"><div className="mb-10 text-center"><h2 className="text-3xl font-bold text-slate-900">Credits and billing FAQ</h2><p className="mt-2 text-slate-600">Clear answers about usage, monthly credits, and your subscription.</p></div><div className="space-y-3">{faqs.map((faq, index) => { const isOpen = openIndex === index; return <div key={faq.question} className="overflow-hidden rounded-lg border border-slate-200 bg-white"><button onClick={() => setOpenIndex(isOpen ? null : index)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-600"><span className="flex items-center gap-3 text-sm font-medium text-slate-900"><HelpCircle className="h-4 w-4 shrink-0 text-indigo-600" />{faq.question}</span><ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} /></button>{isOpen && <div className="px-5 pb-4"><p className="pl-7 text-sm leading-relaxed text-slate-600">{faq.answer}</p></div>}</div>; })}</div></div></section>;
}