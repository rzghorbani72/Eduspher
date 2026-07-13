import { PlatformContactPage } from "@/components/panel/platform-contact/platform-contact-page";
import { getServerAdminPanelUrl } from "@/lib/admin-panel-url.server";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const adminRegisterUrl = await getServerAdminPanelUrl("/register");
  return <PlatformContactPage adminRegisterUrl={adminRegisterUrl} />;
}
