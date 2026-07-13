import { PlatformAboutPage } from "@/components/panel/platform-about/platform-about-page";
import { getServerAdminPanelUrl } from "@/lib/admin-panel-url.server";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const adminRegisterUrl = await getServerAdminPanelUrl("/register");
  return <PlatformAboutPage adminRegisterUrl={adminRegisterUrl} />;
}
