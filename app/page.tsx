import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Pricing } from "@/components/sections/pricing";
import { FAQ, faqs } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { ToolWorkspace } from "@/components/sections/tool-workspace";
import { FeedbackForm } from "@/components/sections/feedback-form";
import { AiImageGenerator } from "@/components/sections/ai-image-generator";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EditImages",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description:
      "A focused product image editor for e-commerce sellers, with exact browser text replacement plus AI edits for overlays, backgrounds, cleanup, and product scenes.",
    url: "https://editimages.app",
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="flex min-h-screen flex-col">
        <Navbar />
        <Hero />
        <ToolWorkspace />
        <AiImageGenerator />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <FeedbackForm />
        <Footer />
      </main>
    </>
  );
}
