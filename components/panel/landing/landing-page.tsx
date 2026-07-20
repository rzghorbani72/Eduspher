import type { StoreSummary } from "@/lib/api/types";

import { CtaSection } from "./cta-section";
import { FaqSection } from "./faq-section";
import { ForYouSection } from "./for-you-section";
import { HeroSection } from "./hero-section";
import { LandingMotion } from "./landing-motion";
import { LogosStrip } from "./logos-strip";
import { ProofSection } from "./proof-section";
import { PublishSection } from "./publish-section";
import { SectionReveal } from "./section-reveal";
import { ShowcaseSection } from "./showcase-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { StepsSection } from "./steps-section";
import { WhySection } from "./why-section";

type Props = {
  adminLoginUrl: string;
  adminRegisterUrl: string;
  academies: StoreSummary[];
};

export function LandingPage({
  adminLoginUrl,
  adminRegisterUrl,
  academies,
}: Props) {
  return (
    <div
      dir="rtl"
      className="lp-root min-h-screen bg-lp-surface font-[Vazirmatn,system-ui,sans-serif] text-lp-ink antialiased"
    >
      <SiteHeader loginUrl={adminLoginUrl} registerUrl={adminRegisterUrl} />

      <main>
        <HeroSection registerUrl={adminRegisterUrl} demoUrl="#examples" />
        <LogosStrip academies={academies} />
        <ForYouSection />
        <PublishSection
          registerUrl={adminRegisterUrl}
          pricingUrl="/pricing"
        />
        <WhySection />
        <StepsSection />
        <ShowcaseSection />
        <ProofSection academies={academies} />
        <FaqSection />
        <CtaSection registerUrl={adminRegisterUrl} demoUrl="#examples" />
      </main>

      <SiteFooter />

      <SectionReveal />
      <LandingMotion />
    </div>
  );
}
