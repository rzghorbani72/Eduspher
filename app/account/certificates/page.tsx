import { Award } from 'lucide-react';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { DataPanel } from '@/components/shared/data-list/data-panel';
import { EmptyState } from '@/components/ui/empty-state';
import Link from '@/components/ui/link';
import { getMyCertificates } from '@/lib/api/account-server';
import { getAcademyBySlug } from '@/lib/api/server';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { getAcademyContext } from '@/lib/store-context';
import { buildAcademyPath, formatDate } from '@/lib/utils';

export default async function AccountCertificatesPage() {
  const academyContext = await getAcademyContext();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;

  const [certificates, academy] = await Promise.all([
    getMyCertificates(),
    academyContext.slug ? getAcademyBySlug(academyContext.slug).catch(() => null) : null,
  ]);

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={translate('account.certificates')}
        description={translate('account.certificatesDescription')}
        icon={Award}
      />

      <DataPanel title={translate('account.certificates')}>
        {certificates.length === 0 ? (
          <EmptyState
            compact
            icon={<Award className="size-7" aria-hidden="true" />}
            title={translate('account.noCertificates')}
          />
        ) : (
          <ul className="space-y-3">
            {certificates.map((certificate) => (
              <li
                key={certificate.id}
                className="border-theme bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-(--theme-foreground)">
                    {certificate.Course?.title ?? translate('account.unknown')}
                  </p>
                  <p className="text-muted mt-1 text-xs">
                    {certificate.certificate_number} · {formatDate(certificate.issued_at, language)}
                  </p>
                </div>
                <Link
                  href={buildAcademyPath(
                    slugForPaths,
                    `/certificates/${certificate.certificate_number}`,
                  )}
                  className="border-theme rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-(--theme-muted)"
                >
                  {translate('account.viewCertificate')}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DataPanel>
    </div>
  );
}
