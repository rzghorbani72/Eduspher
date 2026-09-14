/**
 * Enamad (Iranian e-commerce trust seal) site-ownership verification.
 *
 * The platform seal on mentoma.ir uses a fixed code. Academy seals use that
 * academy's own code on its custom domain — never this one.
 */
export const ENAMAD_CODE = '56180294';

/** Mentoma's own trustseal widget — used on platform surfaces only, never on an academy page. */
export const PLATFORM_ENAMAD_SEAL_ID = '7370484';
export const PLATFORM_ENAMAD_SEAL_CODE = 'JQB9S5hD9i2hI9kLvZiyE3UH0Znbj14F';

export const isEnamadTitleVerification = process.env.NEXT_PUBLIC_ENAMAD_VERIFY_TITLE === 'true';

const PLATFORM_ENAMAD_HOSTS = new Set(['mentoma.ir', 'www.mentoma.ir', 'localhost', '127.0.0.1']);

export function parseEnamadTxtPath(pathname: string): string | null {
  const match = pathname.match(/^\/(\d{4,20})\.txt$/);
  return match?.[1] ?? null;
}

export function isPlatformEnamadHost(host: string): boolean {
  const normalized = host.split(':')[0]?.toLowerCase() ?? '';
  return PLATFORM_ENAMAD_HOSTS.has(normalized);
}
