import { PlatformRefundPage } from '@/components/panel/platform-refund/platform-refund-page';
import { getServerAdminPanelUrl } from '@/lib/admin-panel-url.server';

export const dynamic = 'force-dynamic';

export default async function RefundPage() {
  const adminRegisterUrl = await getServerAdminPanelUrl('/register');
  return <PlatformRefundPage adminRegisterUrl={adminRegisterUrl} />;
}
