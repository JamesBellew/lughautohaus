import { About } from "@/components/about";
import { Faq } from "@/components/faq";
import { Finishes } from "@/components/finishes";
import { Hero } from "@/components/hero";
import { MobileQuoteBar } from "@/components/mobile-quote-bar";
import { MotionProvider } from "@/components/motion";
import { Packages } from "@/components/packages";
import { Partners } from "@/components/partners";
import { Process } from "@/components/process";
import { Quote } from "@/components/quote";
import { QuoteProvider } from "@/components/quote-context";
import { Results } from "@/components/results";
import { Services } from "@/components/services";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export default function Home() {
  return (
    <MotionProvider>
      <QuoteProvider>
        <SiteNav />
        <main>
          <Hero />
          <About />
          <Services />
          <Results />
          <Finishes />
          <Packages />
          <Process />
          <Partners />
          <Faq />
          <Quote />
        </main>
        <SiteFooter />
        <MobileQuoteBar />
      </QuoteProvider>
    </MotionProvider>
  );
}
