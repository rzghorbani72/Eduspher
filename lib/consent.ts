/**
 * Marketing-cookie consent read by the analytics loader. Iran v1 has no GDPR
 * duty, so a visitor who never chose counts as accepted; an explicit
 * `declined` cookie is still honoured. The EU phase brings the banner back.
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
  return readCookie(COOKIE_NAME) === 'declined' ? 'declined' : 'accepted';
}

export function onConsentChange(callback: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, callback);
  return () => window.removeEventListener(CONSENT_EVENT, callback);
}
