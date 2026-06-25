import { PlatformAboutPage } from "@/components/panel/platform-about/platform-about-page";
import { getAdminPanelUrl } from "@/lib/admin-panel-url";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  const adminRegisterUrl = getAdminPanelUrl("/register");
  return <PlatformAboutPage adminRegisterUrl={adminRegisterUrl} />;
}
