import type { StoreSummary } from '@/lib/api/types';
import type { PublicPlan } from '@/lib/api/server';

import { AcademySection } from './academy-section';
import { CoursesSection } from './courses-section';
import { CtaSection } from './cta-section';
import { DomainSection } from './domain-section';
import { FaqSection } from './faq-section';
import { FeaturesSection } from './features-section';
import { HeroSection } from './hero-section';
import { LandingShell } from './landing-shell';
import { LiveSection } from './live-section';
import { PersonasSection } from './personas-section';
import { PricingSection } from './pricing-section';
import { ProblemSection } from './problem-section';
import { SalesSection } from './sales-section';
import { SamplesSection } from './samples-section';
import { SolutionSection } from './solution-section';
import { StepsSection } from './steps-section';
import { StudentsSection } from './students-section';

type Props = {
  adminLoginUrl: string;
  adminRegisterUrl: string;
  academies: StoreSummary[];
  plans: PublicPlan[];
};

export function LandingPage({ adminLoginUrl, adminRegisterUrl, academies, plans }: Props) {
  return (
    <LandingShell loginUrl={adminLoginUrl} registerUrl={adminRegisterUrl}>
      <HeroSection registerUrl={adminRegisterUrl} />
      <PersonasSection registerUrl={adminRegisterUrl} />
      <StepsSection />
      <LiveSection />
      {/* <SolutionSection /> */}
      <FeaturesSection />
      <DomainSection />
      {/* <CoursesSection /> */}
      {/* <StudentsSection /> */}
      {/* <SalesSection /> */}
      <ProblemSection />
      {/* <AcademySection /> */}
      <SamplesSection academies={academies} />
      <PricingSection registerUrl={adminRegisterUrl} plans={plans} />
      <FaqSection />
      <CtaSection registerUrl={adminRegisterUrl} />
    </LandingShell>
  );
}
