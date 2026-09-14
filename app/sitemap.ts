import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

import { getAcademiesPublic, getBlogArticles, getCourses } from '@/lib/api/server';
import { env } from '@/lib/env';
import {
  buildAbsoluteUrl,
  buildCrossMarketUrl,
  getAcademyPublicHost,
  getRegionFromHostname,
} from '@/lib/seo/domains';
import { PLATFORM_SITEMAP_PATHS, getSitemapPriority } from '@/lib/seo/platform-pages';
import { coursePath } from '@/lib/content-paths';

type SitemapEntry = MetadataRoute.Sitemap[number];

function entry(
  host: string,
  path: string,
  opts: {
    priority: number;
    changeFrequency: SitemapEntry['changeFrequency'];
    lastModified?: Date;
  },
): SitemapEntry {
  const faIR = buildCrossMarketUrl(host, path, 'ir');
  const en = buildCrossMarketUrl(host, path, 'com');
  return {
    url: buildAbsoluteUrl(host, path),
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: {
      languages: {
        'fa-IR': faIR,
        en,
        'x-default': faIR,
      },
    },
  };
}

async function platformSitemap(host: string): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const rows: MetadataRoute.Sitemap = PLATFORM_SITEMAP_PATHS.map((path) =>
    entry(host, path, {
      priority: getSitemapPriority(path),
      changeFrequency: path === '/' ? 'weekly' : 'monthly',
      lastModified: now,
    }),
  );

  const [academies, articles] = await Promise.all([
    getAcademiesPublic({ limit: 200 }).catch(() => []),
    getBlogArticles().catch(() => []),
  ]);

  for (const article of articles ?? []) {
    rows.push(
      entry(host, `/blog/${article.slug}`, {
        priority: 0.65,
        changeFrequency: 'monthly',
        lastModified: article.published_at ? new Date(article.published_at) : now,
      }),
    );
  }

  const region = getRegionFromHostname(host);
  for (const academy of academies) {
    if (!academy.slug) continue;
    const academyHost = getAcademyPublicHost(academy.slug, region);
    rows.push({
      url: `https://${academyHost}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  return rows;
}

async function academySitemap(
  host: string,
  academySlug: string | null,
): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const rows: MetadataRoute.Sitemap = [
    entry(host, '/', {
      priority: 1,
      changeFrequency: 'weekly',
      lastModified: now,
    }),
    entry(host, '/courses', {
      priority: 0.9,
      changeFrequency: 'daily',
      lastModified: now,
    }),
    entry(host, '/blog', {
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: now,
    }),
    entry(host, '/bundles', {
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: now,
    }),
    entry(host, '/roadmap', {
      priority: 0.6,
      changeFrequency: 'weekly',
      lastModified: now,
    }),
    entry(host, '/about', {
      priority: 0.5,
      changeFrequency: 'monthly',
      lastModified: now,
    }),
    entry(host, '/contact', {
      priority: 0.5,
      changeFrequency: 'monthly',
      lastModified: now,
    }),
  ];

  const [coursePayload, articles] = await Promise.all([
    getCourses({ limit: 200, published: true }).catch(() => null),
    getBlogArticles(academySlug).catch(() => []),
  ]);

  for (const course of coursePayload?.courses ?? []) {
    rows.push(
      entry(host, coursePath(course.slug), {
        priority: 0.8,
        changeFrequency: 'weekly',
        lastModified: now,
      }),
    );
  }

  for (const article of articles ?? []) {
    rows.push(
      entry(host, `/blog/${article.slug}`, {
        priority: 0.65,
        changeFrequency: 'monthly',
        lastModified: article.published_at ? new Date(article.published_at) : now,
      }),
    );
  }

  return rows;
}

/**
 * Host-aware sitemap: platform lists Mentoma marketing pages + academy homes;
 * academy hosts list that school's public catalog.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerStore = await headers();
  const host = headerStore.get('host')?.split(':')[0] ?? new URL(env.appUrl).hostname;
  const isPlatform = headerStore.get('x-panel-root') === '1';
  const isAcademyHost =
    headerStore.get('x-academy-subdomain') === '1' || Boolean(headerStore.get('x-academy-slug'));

  if (isPlatform || !isAcademyHost) {
    return platformSitemap(host);
  }

  return academySitemap(host, headerStore.get('x-academy-slug'));
}
