import { Suspense } from 'react';
import Link from '@/components/ui/link';
import { LifeBuoy } from 'lucide-react';

import { SupportCenter } from '@/components/account/support/support-center';
import { EmptyState } from '@/components/ui/empty-state';
import { getSession } from '@/lib/auth/session';
import { getAcademyContext } from '@/lib/store-context';
import { getCurrentAcademy, getAcademyBySlug } from '@/lib/api/server';
import { buildAcademyPath } from '@/lib/utils';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';

export default async function SupportPage() {
  const session = await getSession();
  const storeContext = await getAcademyContext();
  const buildPath = (path: string) =>
    buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  let currentAcademy = await getCurrentAcademy().catch(() => null);
  if (!currentAcademy && storeContext.slug) {
    currentAcademy = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }
  const language = getAcademyLanguage(
    currentAcademy?.language ?? null,
    currentAcademy?.country_code ?? null,
  );
  const translate = (key: string) => t(key, language);

  if (!session) {
    return (
      <EmptyState
        icon={<LifeBuoy className="size-7" aria-hidden="true" />}
        title={translate('account.loginToViewHub')}
        action={
          <Link
            href={buildPath('/auth/login')}
            className="bg-primary text-on-primary inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold"
          >
            {translate('auth.login')}
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<p className="text-muted text-sm">{translate('support.loading')}</p>}>
        <SupportCenter />
      </Suspense>
    </div>
  );
}
