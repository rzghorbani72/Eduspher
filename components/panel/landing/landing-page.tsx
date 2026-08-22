import type { StoreSummary } from "@/lib/api/types";
import type { PublicPlan } from "@/lib/api/server";

import { CreatorsSection } from "./creators-section";
import { CtaSection } from "./cta-section";
import { FaqSection } from "./faq-section";
import { ForYouSection } from "./for-you-section";
import { HeroSection } from "./hero-section";
import { LandingMotion } from "./landing-motion";
import { LogosStrip } from "./logos-strip";
import { PricingSection } from "./pricing-section";
import { PublishSection } from "./publish-section";
import { SectionReveal } from "./section-reveal";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { StepsSection } from "./steps-section";
import { WhySection } from "./why-section";

type Props = {
  adminLoginUrl: string;
  adminRegisterUrl: string;
  academies: StoreSummary[];
  plans: PublicPlan[];
};

export function LandingPage({
  adminLoginUrl,
  adminRegisterUrl,
  academies,
  plans,
}: Props) {
  return (
    <div
      dir="rtl"
      data-theme="light"
      className="lp-root min-h-screen bg-lp-surface font-[Vazirmatn,system-ui,sans-serif] text-lp-ink antialiased"
    >
      {/* Restores the saved theme before first paint so a returning dark-mode
          visitor never sees a white flash. Runs ahead of hydration, which is
          why ThemeToggle reads the DOM instead of holding React state. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem('landing-theme');if(t==='dark'){document.currentScript.parentElement.dataset.theme='dark'}}catch(e){}`,
        }}
      />

      <SiteHeader loginUrl={adminLoginUrl} registerUrl={adminRegisterUrl} />

      <main>
        <HeroSection registerUrl={adminRegisterUrl} demoUrl="#examples" />
        <LogosStrip academies={academies} />
        <ForYouSection />
        <PublishSection registerUrl={adminRegisterUrl} pricingUrl="#pricing" />
        <WhySection />
        {/* <StepsSection /> */}
        <CreatorsSection academies={academies} />
        <PricingSection registerUrl={adminRegisterUrl} plans={plans} />
        <FaqSection />
        <CtaSection registerUrl={adminRegisterUrl} demoUrl="#examples" />
      </main>

      <SiteFooter />

      <SectionReveal />
      <LandingMotion />
    </div>
  );
}
