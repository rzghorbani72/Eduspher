import { env } from '@/lib/env';
import type { LanguageCode } from '@/lib/i18n/config';
import { t } from '@/lib/i18n';

/**
 * Attribution line every footer carries: the year plus a link back to the
 * platform landing page. The target domain follows the deployed region, so an
 * EU build never sends visitors to the IR site.
 */
export function PoweredBy({
  language = 'fa',
  className,
}: {
  language?: LanguageCode | null;
  className?: string;
}) {
  const platformUrl = env.appRegion === 'EU' ? env.comDomain : env.irDomain;
  const locale = language === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US';
  const year = new Date().toLocaleDateString(locale, { year: 'numeric' });

  return (
    <span className={className}>
      © {year} · {t('footer.poweredBy', language ?? 'fa')}{' '}
      <a
        href={platformUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium underline-offset-4 hover:underline"
      >
        {env.siteName}
      </a>
    </span>
  );
}
