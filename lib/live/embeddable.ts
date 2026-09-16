/**
 * Hosts a meeting link can be embedded from (iframe-friendly, no frame-busting
 * header). Mirrored in Backend's `common/services/meeting-link.service.ts` —
 * keep both in sync when adding a host.
 *
 * Mentoma Meet (`JITSI_BASE_URL` / `NEXT_PUBLIC_JITSI_HOST`) is always allowed
 * so a self-hosted room embeds without a code change per deploy host.
 */
export const EMBEDDABLE_MEET_HOSTS = [
  'meet.jit.si',
  'meet.mentoma.ir',
  'skyroom.online',
  'www.skyroom.online',
] as const;

const configuredHost = (): string | null => {
  const raw = (process.env.NEXT_PUBLIC_JITSI_HOST ?? '').trim().toLowerCase();
  if (!raw) return null;
  try {
    return raw.includes('://') ? new URL(raw).hostname.toLowerCase() : raw;
  } catch {
    return raw;
  }
};

export const isEmbeddable = (url: string | null | undefined): boolean => {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    const configured = configuredHost();
    return host === configured || (EMBEDDABLE_MEET_HOSTS as readonly string[]).includes(host);
  } catch {
    return false;
  }
};

/** en: Mentoma Meet · fa: `{academy} جلسه` — for iframe / new-tab hash overrides. */
export const mentomaMeetAppName = (
  academyName: string | null | undefined,
  language: string,
): string => {
  const name = academyName?.trim();
  if (language === 'fa' && name) return `${name} جلسه`;
  return 'Mentoma Meet';
};

/**
 * Ensure Mentoma Meet URLs carry APP_NAME / subject when the backend omitted them
 * (e.g. older links). Leaves non-Meet hosts untouched.
 */
export const withMeetAppName = (
  url: string,
  academyName: string | null | undefined,
  language: string,
): string => {
  try {
    const parsed = new URL(url);
    if (!isEmbeddable(url) || parsed.hostname.toLowerCase().includes('skyroom')) {
      return url;
    }
    const appName = mentomaMeetAppName(academyName, language);
    const params = new URLSearchParams(parsed.hash.replace(/^#/, ''));
    params.set('config.defaultLanguage', JSON.stringify('fa'));
    params.set('interfaceConfig.APP_NAME', JSON.stringify('منتوما'));
    params.set('interfaceConfig.NATIVE_APP_NAME', JSON.stringify(appName));
    params.set('interfaceConfig.PROVIDER_NAME', JSON.stringify('منتوما'));
    params.set('interfaceConfig.SHOW_JITSI_WATERMARK', 'false');
    params.set('interfaceConfig.SHOW_POWERED_BY', 'false');
    params.set(
      'interfaceConfig.DEFAULT_LOGO_URL',
      JSON.stringify('https://mentoma.ir/meet-branding/logo-mark.svg'),
    );
    params.set(
      'interfaceConfig.DEFAULT_WELCOME_PAGE_LOGO_URL',
      JSON.stringify('https://mentoma.ir/meet-branding/logo-type.svg'),
    );
    params.set('config.subject', JSON.stringify(appName));
    params.set('config.localSubject', JSON.stringify(appName));
    parsed.hash = params.toString();
    return parsed.toString();
  } catch {
    return url;
  }
};
