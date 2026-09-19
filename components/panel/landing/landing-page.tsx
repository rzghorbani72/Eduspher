import type { StoreSummary } from '@/lib/api/types';
import type { PublicPlan } from '@/lib/api/server';

import { CreatorsSection } from './creators-section';
import { CtaSection } from './cta-section';
import { FaqSection } from './faq-section';
import { ForYouSection } from './for-you-section';
import { HeroSection } from './hero-section';
import { LandingMotion } from './landing-motion';
import { LandingShell } from './landing-shell';
import { LogosStrip } from './logos-strip';
import { PricingSection } from './pricing-section';
import { PublishSection } from './publish-section';
import { SectionReveal } from './section-reveal';
import { StepsSection } from './steps-section';
import { WhySection } from './why-section';

type Props = {
  adminLoginUrl: string;
  adminRegisterUrl: string;
  academies: StoreSummary[];
  plans: PublicPlan[];
};

export function LandingPage({ adminLoginUrl, adminRegisterUrl, academies, plans }: Props) {
  return (
    <LandingShell loginUrl={adminLoginUrl} registerUrl={adminRegisterUrl}>
      <HeroSection registerUrl={adminRegisterUrl} demoUrl="/academies" demoSectionId="examples" />
      <LogosStrip academies={academies} />
      <ForYouSection />
      <PublishSection registerUrl={adminRegisterUrl} pricingUrl="#pricing" />
      <StepsSection />
      <WhySection />
      <CreatorsSection academies={academies} />
      <PricingSection loginUrl={adminLoginUrl} plans={plans} />
      <FaqSection />
      <CtaSection registerUrl={adminRegisterUrl} demoUrl="/academies" demoSectionId="examples" />

      <SectionReveal />
      <LandingMotion />
    </LandingShell>
  );
}
