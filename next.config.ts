import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV !== 'production';

/** Baked at build time when CI/build-args omit these (same idea as AdminPanel). */
const PRODUCTION_PUBLIC_DEFAULTS = {
  // v1 runs on the Iran (.ir) rail. api.mentoma.com has no DNS record, so a .com
  // fallback silently breaks every backend call when the build args are missing.
  BACKEND_ORIGIN: 'https://api.mentoma.ir',
  BACKEND_API_PATH: '/v1',
  APP_URL: 'https://mentoma.ir',
  ADMIN_PANEL_URL: 'https://admin.mentoma.ir',
  IR_DOMAIN: 'https://mentoma.ir',
  COM_DOMAIN: 'https://mentoma.com',
} as const;

const SECURITY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  // Content Security Policy - adjust as needed for your app
  {
    key: 'Content-Security-Policy',
    value: isDevelopment
      ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https:; style-src 'self' 'unsafe-inline' http://localhost:* https:; img-src 'self' data: blob: http://localhost:* https:; font-src 'self' data: http://localhost:* https:; connect-src 'self' http://localhost:* ws://localhost:* ws: wss: https:; media-src 'self' http://localhost:* https: blob: data:; worker-src 'self' blob:; frame-ancestors 'none';"
      : "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self' https: blob: data:; worker-src 'self' blob:; frame-ancestors 'none';",
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_BACKEND_ORIGIN:
      process.env.NEXT_PUBLIC_BACKEND_ORIGIN || PRODUCTION_PUBLIC_DEFAULTS.BACKEND_ORIGIN,
    NEXT_PUBLIC_BACKEND_API_PATH:
      process.env.NEXT_PUBLIC_BACKEND_API_PATH || PRODUCTION_PUBLIC_DEFAULTS.BACKEND_API_PATH,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || PRODUCTION_PUBLIC_DEFAULTS.APP_URL,
    NEXT_PUBLIC_ADMIN_PANEL_URL:
      process.env.NEXT_PUBLIC_ADMIN_PANEL_URL || PRODUCTION_PUBLIC_DEFAULTS.ADMIN_PANEL_URL,
    NEXT_PUBLIC_IR_DOMAIN:
      process.env.NEXT_PUBLIC_IR_DOMAIN || PRODUCTION_PUBLIC_DEFAULTS.IR_DOMAIN,
    NEXT_PUBLIC_COM_DOMAIN:
      process.env.NEXT_PUBLIC_COM_DOMAIN || PRODUCTION_PUBLIC_DEFAULTS.COM_DOMAIN,
  },
  /**
   * Browser API calls go to our own origin and are proxied to the backend here,
   * so the auth cookies are set on the academy's hostname instead of the API's.
   * See getClientBackendApiBaseUrl() in lib/env.ts for why that matters.
   * Server-side fetches keep using the absolute backend origin directly.
   */
  async rewrites() {
    const backendOrigin = (
      process.env.NEXT_PUBLIC_BACKEND_ORIGIN || PRODUCTION_PUBLIC_DEFAULTS.BACKEND_ORIGIN
    ).replace(/\/$/, '');
    return [
      {
        source: '/:lang(fa|en|ar|tr)/v1/:path*',
        destination: `${backendOrigin}/:lang/v1/:path*`,
      },
      {
        source: '/v1/:path*',
        destination: `${backendOrigin}/v1/:path*`,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ];
  },

  /**
   * No built-in optimizer, and no `unoptimized` either.
   *
   * `loaderFile` makes every <Image> rewrite its own URL (see
   * lib/images/image-loader.ts) instead of routing through `/_next/image`. The
   * backend renders the derivative once and caches it in the shared object
   * bucket, so this pod writes NOTHING to `.next/cache/images` — the unbounded
   * on-disk cache that would otherwise grow until Kubernetes evicts the pod for
   * exceeding its ephemeral-storage limit.
   *
   * The width ladder below must stay a subset of IMAGE_VARIANT_WIDTHS in
   * Backend/src/common/utils/image-variant.util.ts; a width outside it is
   * snapped up there, which would silently serve more pixels than requested.
   */
  images: {
    loader: 'custom',
    loaderFile: './lib/images/image-loader.ts',
    deviceSizes: [640, 828, 1080, 1280],
    imageSizes: [32, 64, 96, 128, 200, 320, 480],
    qualities: [45, 60, 75, 85],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Disable X-Powered-By header
  poweredByHeader: false,
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'rzghorbani72-mentoma',

  project: 'javascript-nextjs',
  sentryUrl: 'https://sentry.hamravesh.com/',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
