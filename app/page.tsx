import { PlatformLandingPage } from "@/components/panel/platform-landing-page";
import { getAdminPanelUrl } from "@/lib/admin-panel-url";
import { getAcademiesPublic } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const adminLoginUrl = getAdminPanelUrl("/login");
  const adminRegisterUrl = getAdminPanelUrl("/register");
  const academies = await getAcademiesPublic().catch(() => []);

  return (
    <PlatformLandingPage
      adminLoginUrl={adminLoginUrl}
      adminRegisterUrl={adminRegisterUrl}
      academies={academies}
    />
  );
}
