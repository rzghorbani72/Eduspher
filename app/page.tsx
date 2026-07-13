import { PlatformLandingPage } from "@/components/panel/platform-landing-page";
import { PlatformOrganizationJsonLd } from "@/components/seo/platform-organization-json-ld";
import { getServerAdminPanelUrl } from "@/lib/admin-panel-url.server";
import { getAcademiesPublic } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const adminLoginUrl = await getServerAdminPanelUrl("/login");
  const adminRegisterUrl = await getServerAdminPanelUrl("/register");
  const academies = await getAcademiesPublic().catch(() => []);

  return (
    <>
      <PlatformOrganizationJsonLd />
      <PlatformLandingPage
        adminLoginUrl={adminLoginUrl}
        adminRegisterUrl={adminRegisterUrl}
        academies={academies}
      />
    </>
  );
}
