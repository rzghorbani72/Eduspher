import { PlatformPrivacyPage } from '@/components/panel/platform-privacy/platform-privacy-page';
import { getServerAdminPanelUrl } from '@/lib/admin-panel-url.server';

export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
  const [adminRegisterUrl, bindingUrl] = await Promise.all([
    getServerAdminPanelUrl('/register'),
    getServerAdminPanelUrl('/privacy'),
  ]);
  return <PlatformPrivacyPage adminRegisterUrl={adminRegisterUrl} bindingUrl={bindingUrl} />;
}
