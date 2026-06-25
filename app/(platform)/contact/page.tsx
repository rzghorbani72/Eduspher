import { PlatformContactPage } from "@/components/panel/platform-contact/platform-contact-page";
import { getAdminPanelUrl } from "@/lib/admin-panel-url";

export const dynamic = "force-dynamic";

export default function ContactPage() {
  const adminRegisterUrl = getAdminPanelUrl("/register");
  return <PlatformContactPage adminRegisterUrl={adminRegisterUrl} />;
}
