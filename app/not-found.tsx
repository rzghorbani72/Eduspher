import Link from '@/components/ui/link';
import { getAcademyContext } from '@/lib/store-context';
import { buildAcademyPath } from '@/lib/utils';
import { getCurrentAcademy, getAcademyBySlug } from '@/lib/api/server';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';

export default async function NotFound() {
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

  return (
    <div className="grid min-h-[80vh] place-items-center px-6 py-16 text-center">
      <div>
        <div className="relative mx-auto grid h-[110px] w-[110px] place-items-center">
          <div className="not-found-glow absolute inset-0 rounded-full" />
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="relative">
            <circle cx="6" cy="7" r="2.6" fill="var(--theme-primary)" />
            <circle cx="18" cy="6" r="2.6" fill="var(--theme-primary)" opacity="0.75" />
            <circle cx="12" cy="17" r="3" fill="var(--theme-primary)" />
            <path
              d="M7.6 8.4 11 15M16.6 7.2 13 15M8 7.3l8-1"
              stroke="var(--theme-primary)"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        </div>

        <div className="not-found-number mt-4 text-[clamp(72px,14vw,128px)]">404</div>

        <h1 className="mt-3 text-[clamp(22px,3vw,32px)] font-extrabold tracking-tight text-[var(--theme-foreground)]">
          {translate('pages.pageNotFound')}
        </h1>

        <p className="mx-auto mt-4 max-w-[420px] text-base leading-[1.85] text-[var(--theme-muted)]">
          {translate('pages.pageNotFoundDescription')}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={buildPath('/')}
            className="not-found-btn-primary inline-flex h-14 items-center justify-center rounded-[24px] px-8 text-[16px] font-bold no-underline transition-transform hover:-translate-y-0.5"
          >
            {translate('navigation.home')}
          </Link>
          <Link
            href={buildPath('/courses')}
            className="not-found-btn-secondary inline-flex h-14 items-center justify-center rounded-[24px] px-8 text-[15px] font-semibold no-underline transition-colors"
          >
            {translate('pages.viewCourses')}
          </Link>
        </div>
      </div>
    </div>
  );
}
