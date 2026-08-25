import { notFound } from "next/navigation";

import { CtaSection } from "@/components/panel/landing/cta-section";
import { FaqSection } from "@/components/panel/landing/faq-section";
import { LandingShell } from "@/components/panel/landing/landing-shell";
import { PricingSection } from "@/components/panel/landing/pricing-section";
import { SectionReveal } from "@/components/panel/landing/section-reveal";
import { getServerAdminPanelUrl } from "@/lib/admin-panel-url.server";
import { getPublicPlans } from "@/lib/api/server";
import { getAcademyContext } from "@/lib/store-context";

export const revalidate = 300;

/** Platform-only page: an academy's own site sells courses, not our plans. */
export default async function PricingPage() {
  const store = await getAcademyContext();
  if (store.slug) {
    notFound();
  }

  const adminLoginUrl = await getServerAdminPanelUrl("/login");
  const adminRegisterUrl = await getServerAdminPanelUrl("/register");
  const plans = await getPublicPlans().catch(() => []);

  return (
    <LandingShell loginUrl={adminLoginUrl} registerUrl={adminRegisterUrl}>
      <PricingSection as="h1" registerUrl={adminRegisterUrl} plans={plans} />
      <FaqSection />
      <CtaSection registerUrl={adminRegisterUrl} demoUrl="/academies" />

      <SectionReveal />
    </LandingShell>
  );
}
