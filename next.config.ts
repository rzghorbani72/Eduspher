import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== 'production';

const SECURITY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  },
  // Content Security Policy - adjust as needed for your app
  {
    key: 'Content-Security-Policy',
    value: isDevelopment
      ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https:; style-src 'self' 'unsafe-inline' http://localhost:* https:; img-src 'self' data: blob: http://localhost:* https:; font-src 'self' data: http://localhost:* https:; connect-src 'self' http://localhost:* ws://localhost:* wss: https:; media-src 'self' http://localhost:* https: blob: data:;"
      : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self' https: blob: data:;"
  }
];

const nextConfig: NextConfig = {
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
  
  // Image optimization settings
  images: {
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

export default nextConfig;
