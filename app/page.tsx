import type { Metadata } from "next";

import { LandingPage } from "@/components/panel/landing/landing-page";
import { PlatformOrganizationJsonLd } from "@/components/seo/platform-organization-json-ld";
import { getServerAdminPanelUrl } from "@/lib/admin-panel-url.server";
import { getAcademiesPublic, getPublicPlans } from "@/lib/api/server";
import { buildSiteMetadata } from "@/lib/seo/build-metadata";
import { buildLandingFaqJsonLd } from "@/lib/seo/landing-faq-json-ld";
import { getPlatformPageSeo } from "@/lib/seo/platform-pages";
import { getSeoRequestContext } from "@/lib/seo/request-context";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await getSeoRequestContext();
  const pageSeo = getPlatformPageSeo("/");
  return buildSiteMetadata({
    title: pageSeo?.title,
    description: pageSeo?.description,
    ctx,
  });
}

export default async function Home() {
  const adminLoginUrl = await getServerAdminPanelUrl("/login");
  const adminRegisterUrl = await getServerAdminPanelUrl("/register");
  const academies = await getAcademiesPublic().catch(() => []);
  const plans = await getPublicPlans().catch(() => []);
  const faqJsonLd = buildLandingFaqJsonLd();

  return (
    <>
      <PlatformOrganizationJsonLd />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <LandingPage
        adminLoginUrl={adminLoginUrl}
        adminRegisterUrl={adminRegisterUrl}
        academies={academies}
        plans={plans}
      />
    </>
  );
}
