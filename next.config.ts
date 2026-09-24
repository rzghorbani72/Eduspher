import { withSentryConfig } from '@sentry/nextjs/config';
import type { NextConfig } from 'next';

import { buildSecurityHeaders } from './lib/security/headers';

const isDevelopment = process.env.NODE_ENV !== 'production';
const SECURITY_HEADERS = buildSecurityHeaders(isDevelopment);

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

const nextConfig: NextConfig = {
  output: 'standalone',
  // Sentry OpenTelemetry hooks these; without a top-level install Turbopack
  // HMR can drop the module factory after layout edits (see terminal warnings).
  serverExternalPackages: ['import-in-the-middle', 'require-in-the-middle'],
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
        source: '/meet-branding/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://meet.mentoma.ir',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
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
