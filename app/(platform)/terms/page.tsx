import { PlatformTermsPage } from "@/components/panel/platform-terms/platform-terms-page";
import { getServerAdminPanelUrl } from "@/lib/admin-panel-url.server";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const adminRegisterUrl = await getServerAdminPanelUrl("/register");
  return <PlatformTermsPage adminRegisterUrl={adminRegisterUrl} />;
}
