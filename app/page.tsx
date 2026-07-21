import { LandingPage } from "@/components/panel/landing/landing-page";
import { PlatformOrganizationJsonLd } from "@/components/seo/platform-organization-json-ld";
import { getServerAdminPanelUrl } from "@/lib/admin-panel-url.server";
import { getAcademiesPublic, getPublicPlans } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const adminLoginUrl = await getServerAdminPanelUrl("/login");
  const adminRegisterUrl = await getServerAdminPanelUrl("/register");
  const academies = await getAcademiesPublic().catch(() => []);
  // Prices come from the API, never the static copy: the platform owner can
  // reprice from the panel and the landing page must not keep quoting the old
  // number (and must show an upcoming change before it lands).
  const plans = await getPublicPlans().catch(() => []);

  return (
    <>
      <PlatformOrganizationJsonLd />
      <LandingPage
        adminLoginUrl={adminLoginUrl}
        adminRegisterUrl={adminRegisterUrl}
        academies={academies}
        plans={plans}
      />
    </>
  );
}
