import { env } from '@/lib/env';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { QUICK_SIGNUP_SLUG_PARAM } from '@/lib/slug';

type Props = {
  slug: string;
  address: string;
  /** An expired academy used this address before it was purged. */
  released: boolean;
};

/** Shown on a free subdomain instead of a 404: invite the visitor to claim it. */
export function AddressAvailable({ slug, address, released }: Props) {
  const language = getAcademyLanguage(null, null);
  const translate = (key: string) => t(key, language);
  const createUrl = new URL('/', env.appUrl);
  createUrl.searchParams.set(QUICK_SIGNUP_SLUG_PARAM, slug);

  return (
    <div className="grid min-h-[80vh] place-items-center px-6 py-16 text-center">
      <div>
        <p
          dir="ltr"
          className="text-[clamp(28px,6vw,48px)] font-extrabold tracking-tight text-[var(--theme-primary)]"
        >
          {address}
        </p>
        <h1 className="mt-4 text-[clamp(22px,3vw,32px)] font-extrabold tracking-tight text-[var(--theme-foreground)]">
          {translate(released ? 'pages.addressReleasedTitle' : 'pages.addressAvailableTitle')}
        </h1>
        <p className="mx-auto mt-4 max-w-[460px] text-base leading-[1.85] text-[var(--theme-muted)]">
          {translate(
            released ? 'pages.addressReleasedDescription' : 'pages.addressAvailableDescription',
          )}
        </p>
        <a
          href={createUrl.toString()}
          className="not-found-btn-primary mt-9 inline-flex h-14 items-center justify-center rounded-[24px] px-8 text-[16px] font-bold no-underline transition-transform hover:-translate-y-0.5"
        >
          {translate('pages.createAcademyAtAddress')}
        </a>
      </div>
    </div>
  );
}
