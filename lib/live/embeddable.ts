/**
 * Hosts a meeting link can be embedded from (iframe-friendly, no frame-busting
 * header). Mirrored in Backend's `common/services/meeting-link.service.ts` —
 * keep both in sync when adding a host.
 *
 * Mentoma Meet (`JITSI_BASE_URL` / `NEXT_PUBLIC_JITSI_HOST`) is always allowed
 * so a self-hosted room embeds without a code change per deploy host.
 */
const EMBEDDABLE_HOSTS = [
  'meet.jit.si',
  'meet.mentoma.ir',
  'skyroom.online',
  'www.skyroom.online',
];

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
    return host === configured || EMBEDDABLE_HOSTS.includes(host);
  } catch {
    return false;
  }
};

/** en: Mentoma Meet · fa: `{academy} جلسه` — for iframe / new-tab hash overrides. */
export const mentomaMeetAppName = (academyName: string | null | undefined, language: string): string => {
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
    if (!params.has('interfaceConfig.APP_NAME')) {
      params.set('interfaceConfig.APP_NAME', JSON.stringify(appName));
    }
    if (!params.has('config.subject')) {
      params.set('config.subject', JSON.stringify(appName));
    }
    parsed.hash = params.toString();
    return parsed.toString();
  } catch {
    return url;
  }
};
