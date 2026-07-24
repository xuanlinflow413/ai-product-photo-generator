import { ChevronDown, HelpCircle } from "lucide-react";
import { SELLER_PLAN } from "@/lib/editimages-plan";

export const faqs = [
  { question: "Can I use the marketplace image pack without an account?", answer: "Yes. Local marketplace processing and ZIP export do not require an account. Sign in only if you choose an account-based cloud edit." },
  { question: "Are my product images uploaded?", answer: "No. The marketplace pack and text overlay workflows process files in your browser. The local source files are not sent to a third-party service." },
  { question: "How many files can I prepare at once?", answer: "You can select up to 25 PNG, JPG, or WebP files, with a 10MB per-file limit and a 50MB total batch limit." },
  { question: "What does the downloaded ZIP include?", answer: "The ZIP contains separate Amazon, Etsy, and eBay folders for the presets you selected, plus a manifest.json describing each output and its limitations." },
  { question: "What image sizes are exported?", answer: "Amazon and Etsy presets export 2000 x 2000 JPG files. The eBay preset exports 1600 x 1600 JPG files. Review each preview before you publish." },
  { question: "What uses a credit?", answer: "A successful AI edit uses 1 credit. Local editing tools and local ZIP exports do not use credits." },
  { question: "Will a failed edit use a credit?", answer: "No. A failed or canceled action should not use a credit. If your balance looks incorrect, contact support with the time of the action." },
  { question: "Do monthly credits roll over?", answer: "No. Seller includes " + SELLER_PLAN.creditsPerPeriod + " credits for each billing month. Unused monthly credits expire when the next billing month begins." },
  { question: "What happens when I run out of credits?", answer: "Credit-based actions pause until your next monthly reset. EditImages does not charge automatic overage fees. Local tools remain available." },
  { question: "How do the 2 welcome credits work?", answer: "Eligible new EditImages accounts receive 2 one-time credits after signing in. No payment method is required, and the grant does not start a subscription." },
  { question: "Are credits shared with other products?", answer: "No. Your sign-in may be shared, but EditImages credits are separate and can only be used in EditImages." },
  { question: "Can I cancel anytime?", answer: "Yes. You can cancel from Manage subscription. Your Seller access continues through the end of the current paid billing period, and you will not be charged again unless you resubscribe." },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Marketplace image workflow FAQ</h2>
          <p className="mt-2 text-slate-600">Clear answers about local processing, file limits, exports, and optional account features.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="group overflow-hidden rounded-lg border border-slate-200 bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-600 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-3 text-sm font-medium text-slate-900"><HelpCircle className="h-4 w-4 shrink-0 text-indigo-600" />{faq.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-4"><p className="pl-7 text-sm leading-relaxed text-slate-600">{faq.answer}</p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
