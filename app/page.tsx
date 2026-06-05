import { PlatformLandingPage } from "@/components/panel/platform-landing-page";
import { getAdminPanelUrl } from "@/lib/admin-panel-url";
import { getAcademiesPublic } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const adminLoginUrl = getAdminPanelUrl("/login");
  const adminRegisterUrl = getAdminPanelUrl("/register");
  const allAcademies = await getAcademiesPublic().catch(() => []);
  const academies = allAcademies.filter((a) => a.is_active !== false);

  return (
    <PlatformLandingPage
      adminLoginUrl={adminLoginUrl}
      adminRegisterUrl={adminRegisterUrl}
      academies={academies}
    />
  );
}
