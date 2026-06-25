import { PlatformPrivacyPage } from "@/components/panel/platform-privacy/platform-privacy-page";
import { getAdminPanelUrl } from "@/lib/admin-panel-url";

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  const adminRegisterUrl = getAdminPanelUrl("/register");
  return <PlatformPrivacyPage adminRegisterUrl={adminRegisterUrl} />;
}
