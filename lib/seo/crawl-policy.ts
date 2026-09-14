import type { Metadata } from 'next';

/** Paths that must never appear in search results. */
export const NOINDEX_PATH_PREFIXES = [
  '/auth',
  '/account',
  '/checkout',
  '/payment',
  '/preview',
  '/learn',
  '/classes',
  '/academy-not-found',
] as const;

/** robots.txt disallow list — mirrors noindex paths plus non-page surfaces. */
export const CRAWL_DISALLOW_PATHS = [...NOINDEX_PATH_PREFIXES, '/api'] as const;

export const NOINDEX_ROBOTS: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};
