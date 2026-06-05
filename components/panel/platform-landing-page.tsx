import type { StoreSummary } from "@/lib/api/types";
import { LandingHeader } from "./platform-landing/landing-header";
import { HeroSection } from "./platform-landing/hero-section";
import { ProofBar } from "./platform-landing/proof-bar";
import { FeaturesSection } from "./platform-landing/features-section";
import { DemosSection } from "./platform-landing/demos-section";
import { PricingSection } from "./platform-landing/pricing-section";
import { CtaSection } from "./platform-landing/cta-section";
import { LandingFooter } from "./platform-landing/landing-footer";

type Props = {
  adminLoginUrl: string;
  adminRegisterUrl: string;
  academies: StoreSummary[];
};

export function PlatformLandingPage({ adminLoginUrl, adminRegisterUrl, academies }: Props) {
  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#F8F7F2", fontFamily: "'Vazirmatn', sans-serif", color: "#100F0C" }}
    >
      {/* Vazirmatn font — React 19 hoists link tags to <head> */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;900&display=swap"
        rel="stylesheet"
      />

      <LandingHeader adminLoginUrl={adminLoginUrl} />
      <HeroSection adminRegisterUrl={adminRegisterUrl} academies={academies} />
      <ProofBar academies={academies} />
      <FeaturesSection />
      <DemosSection academies={academies} />
      <PricingSection adminRegisterUrl={adminRegisterUrl} adminLoginUrl={adminLoginUrl} />
      <CtaSection adminRegisterUrl={adminRegisterUrl} />
      <LandingFooter />
    </div>
  );
}
