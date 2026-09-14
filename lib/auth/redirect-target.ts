/**
 * A `?redirect=` value comes from the URL, so it is attacker-controllable. Only
 * same-origin relative paths are safe to navigate to after sign-in — anything
 * else (absolute URL, protocol-relative "//evil.com", javascript:) is an open
 * redirect and is discarded in favour of the caller's fallback.
 */
export const safeRedirectPath = (value: string | null | undefined, fallback: string): string => {
  if (!value) return fallback;
  const candidate = value.trim();
  if (!candidate.startsWith('/')) return fallback;
  if (candidate.startsWith('//')) return fallback;
  if (candidate.includes('\\')) return fallback;
  // Bouncing back to an auth page would loop the user straight into sign-in again.
  if (/^\/(?:[^/]+\/)?auth\//.test(candidate)) return fallback;
  return candidate;
};
