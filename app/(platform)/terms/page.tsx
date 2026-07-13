import { PlatformTermsPage } from "@/components/panel/platform-terms/platform-terms-page";
import { getServerAdminPanelUrl } from "@/lib/admin-panel-url.server";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const [adminRegisterUrl, bindingUrl] = await Promise.all([
    getServerAdminPanelUrl("/register"),
    getServerAdminPanelUrl("/terms"),
  ]);
  return (
    <PlatformTermsPage adminRegisterUrl={adminRegisterUrl} bindingUrl={bindingUrl} />
  );
}
