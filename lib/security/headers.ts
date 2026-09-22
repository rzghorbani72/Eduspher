import { EMBEDDABLE_MEET_HOSTS } from '../live/embeddable';

/** GA4 gtag + Microsoft Clarity script hosts (tag + the follow-up loader). */
const MARKETING_SCRIPT_SRC = [
  'https://www.googletagmanager.com',
  'https://*.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://www.clarity.ms',
  'https://scripts.clarity.ms',
  'https://*.clarity.ms',
].join(' ');

/** Collect/replay endpoints. `https:` stays so API and storage calls keep working. */
const MARKETING_CONNECT_SRC = [
  'https://www.googletagmanager.com',
  'https://*.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://analytics.google.com',
  'https://*.analytics.google.com',
  'https://*.g.doubleclick.net',
  'https://www.google.com',
  'https://*.google.com',
  'https://www.clarity.ms',
  'https://*.clarity.ms',
  'https://sentry.hamravesh.com',
  'https://*.sentry.hamravesh.com',
].join(' ');

const MARKETING_FRAME_SRC = [
  'https://www.googletagmanager.com',
  'https://*.googletagmanager.com',
  'https://www.clarity.ms',
  'https://*.clarity.ms',
].join(' ');

/** Academy storefront hosts the marketing landing may embed (samples iframes). */
function academyFrameSrc(): string {
  const hosts = new Set<string>();
  for (const raw of [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_IR_DOMAIN,
    process.env.NEXT_PUBLIC_COM_DOMAIN,
    'https://mentoma.ir',
    'https://mentoma.com',
  ]) {
    if (!raw?.trim()) continue;
    try {
      const { protocol, hostname } = new URL(raw);
      hosts.add(`${protocol}//${hostname}`);
      hosts.add(`${protocol}//*.${hostname}`);
    } catch {
      // ignore invalid env URLs
    }
  }
  return [...hosts].join(' ');
}

function extraJitsiHost(): string | null {
  const raw = (process.env.NEXT_PUBLIC_JITSI_HOST ?? '').trim().toLowerCase();
  if (!raw) return null;
  try {
    return raw.includes('://') ? new URL(raw).hostname.toLowerCase() : raw;
  } catch {
    return raw;
  }
}

/** https origins the live-class iframe is allowed to load. */
export function meetFrameOrigins(): string[] {
  const hosts = new Set<string>(EMBEDDABLE_MEET_HOSTS);
  const extra = extraJitsiHost();
  if (extra) hosts.add(extra);
  return [...hosts].map((host) => `https://${host}`);
}

export function buildPermissionsPolicy(isDevelopment: boolean): string {
  if (isDevelopment) {
    return [
      'camera=*',
      'microphone=*',
      'display-capture=*',
      'fullscreen=*',
      'geolocation=()',
      'browsing-topics=()',
    ].join(', ');
  }
  const quoted = meetFrameOrigins()
    .map((origin) => `"${origin}"`)
    .join(' ');
  return [
    `camera=(self ${quoted})`,
    `microphone=(self ${quoted})`,
    `display-capture=(self ${quoted})`,
    `fullscreen=(self ${quoted})`,
    'geolocation=()',
    'browsing-topics=()',
  ].join(', ');
}

export function buildContentSecurityPolicy(isDevelopment: boolean): string {
  if (isDevelopment) {
    return [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https: data: blob:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https:",
      "style-src 'self' 'unsafe-inline' http://localhost:* https:",
      "img-src 'self' data: blob: http://localhost:* https:",
      "font-src 'self' data: http://localhost:* https:",
      "connect-src 'self' http://localhost:* ws://localhost:* ws: wss: https:",
      "media-src 'self' http://localhost:* https: blob: data:",
      "worker-src 'self' blob:",
      "frame-src 'self' http://localhost:* https: blob:",
      // frame-ancestors is set per-response in proxy.ts (academy home may be
      // framed by the marketing site; everything else stays 'none').
    ].join('; ');
  }

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${MARKETING_SCRIPT_SRC}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' https: ${MARKETING_CONNECT_SRC}`,
    "media-src 'self' https: blob: data:",
    "worker-src 'self' blob:",
    `frame-src 'self' blob: ${meetFrameOrigins().join(' ')} ${MARKETING_FRAME_SRC} ${academyFrameSrc()}`,
  ].join('; ');
}

export function buildSecurityHeaders(isDevelopment: boolean) {
  return [
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: buildPermissionsPolicy(isDevelopment) },
    { key: 'Content-Security-Policy', value: buildContentSecurityPolicy(isDevelopment) },
  ];
}
