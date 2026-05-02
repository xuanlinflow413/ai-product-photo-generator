import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { Demo } from "@/components/sections/demo";
import { Pricing } from "@/components/sections/pricing";
import { FAQ } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <Demo />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
