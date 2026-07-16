import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Demo } from "@/components/sections/demo";
import { Pricing } from "@/components/sections/pricing";
import { FAQ } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { ToolWorkspace } from "@/components/sections/tool-workspace";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EditImages",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A focused product image workspace for e-commerce sellers, with local batch preparation and text editing tools.",
    url: "https://editimages.app",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex min-h-screen flex-col">
        <Navbar />
        <Hero />
        <ToolWorkspace />
        <HowItWorks />
        <Demo />
        <Pricing />
        <FAQ />
        <Footer />
      </main>
    </>
  );
}
