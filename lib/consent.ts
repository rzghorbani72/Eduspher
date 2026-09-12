/**
 * Marketing-cookie consent shared between the GDPR banner and the analytics
 * loader. A plain window event (not React context) so a script component far
 * from the banner in the tree can react the instant the visitor decides.
 */
const COOKIE_NAME = 'gdpr_consent';
const CONSENT_EVENT = 'gdpr-consent-changed';

export type ConsentValue = 'accepted' | 'declined' | null;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getMarketingConsent(): ConsentValue {
  const value = readCookie(COOKIE_NAME);
  return value === 'accepted' || value === 'declined' ? value : null;
}

export function setMarketingConsent(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}

export function onConsentChange(callback: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, callback);
  return () => window.removeEventListener(CONSENT_EVENT, callback);
}
