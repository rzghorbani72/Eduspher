import { PlatformTermsPage } from "@/components/panel/platform-terms/platform-terms-page";
import { getAdminPanelUrl } from "@/lib/admin-panel-url";

export const dynamic = "force-dynamic";

export default function TermsPage() {
  const adminRegisterUrl = getAdminPanelUrl("/register");
  return <PlatformTermsPage adminRegisterUrl={adminRegisterUrl} />;
}
