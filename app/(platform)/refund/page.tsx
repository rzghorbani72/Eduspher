import { PlatformRefundPage } from "@/components/panel/platform-refund/platform-refund-page";
import { getAdminPanelUrl } from "@/lib/admin-panel-url";

export const dynamic = "force-dynamic";

export default function RefundPage() {
  const adminRegisterUrl = getAdminPanelUrl("/register");
  return <PlatformRefundPage adminRegisterUrl={adminRegisterUrl} />;
}
