import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getCategories,
  getCourses,
  getBlogArticles,
  getCurrentAcademy,
  getAcademyBySlug,
  getAcademyBundlesPublic,
} from '@/lib/api/server';
import { getAcademyContext } from '@/lib/store-context';
import { buildAcademyPath, formatCurrencyWithAcademy, resolveAssetUrl } from '@/lib/utils';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { RoadmapTabs } from '@/components/courses/roadmap-tabs';
import { buildSiteMetadata } from '@/lib/seo/build-metadata';
import { getSeoRequestContext } from '@/lib/seo/request-context';

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await getSeoRequestContext();
  if (ctx.isPlatform) {
    return { robots: { index: false, follow: false } };
  }
  const store = await getAcademyContext();
  const academy = store.slug ? await getAcademyBySlug(store.slug).catch(() => null) : null;
  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);
  return buildSiteMetadata({
    title: academy ? `${translate('roadmap.title')} | ${academy.name}` : translate('roadmap.title'),
    description: translate('roadmap.subtitle'),
    ctx,
  });
}

export default async function RoadmapPage() {
  const storeContext = await getAcademyContext();
  if (!storeContext.slug) notFound();

  const buildPath = (path: string) =>
    buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  const [categories, coursePayload, articles, currentAcademy, bundles] = await Promise.all([
    getCategories().catch(() => []),
    getCourses({ limit: 100, published: true }).catch(() => null),
    getBlogArticles(storeContext.slug).catch(() => []),
    getCurrentAcademy().catch(() => null),
    getAcademyBundlesPublic().catch(() => []),
  ]);

  let academy = currentAcademy;
  if (!academy && storeContext.slug) {
    academy = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);

  const courses = coursePayload?.courses ?? [];

  // A bundle spanning several courses IS a learning path: the manager chose the
  // courses and their order, and priced the whole sequence. Those are the real
  // roadmaps.
  const bundleRoadmaps = bundles
    .filter((bundle) => bundle.Courses.length > 1)
    .map((bundle) => ({
      id: bundle.id,
      slug: bundle.slug,
      name: bundle.title ?? '',
      icon: '\u{1F9ED}',
      description: bundle.description ?? '',
      price: bundle.price,
      comparePrice: bundle.compare_at_price,
      courses: bundle.Courses.map((entry, idx) => ({
        id: entry.Course.id,
        slug: entry.Course.slug,
        step: idx + 1,
        title: entry.Course.title,
        short_description: entry.Course.short_description ?? '',
        price: 0,
        is_free: false,
        lessons_count: entry.Course.lessons_count,
        duration: entry.Course.duration,
        level: '',
      })),
    }))
    .filter((r) => r.name && r.courses.length > 0);

  // Fallback for an academy that has not built a bundle yet: group its courses
  // by category so the page is still useful. These are not ordered or priced as
  // a path, so they carry no slug and no bundle price.
  const categoryRoadmaps = categories
    .filter((cat) => courses.some((c) => c.Category?.id === cat.id))
    .map((cat) => ({
      id: cat.id,
      slug: null,
      name: cat.name,
      icon: cat.icon ?? '\u{1F4DA}',
      description: cat.description ?? '',
      price: null,
      comparePrice: null,
      courses: courses
        .filter((c) => c.Category?.id === cat.id)
        .map((c, idx) => ({
          id: c.id,
          slug: c.slug,
          step: idx + 1,
          title: c.title,
          short_description: c.short_description ?? '',
          price: c.price,
          is_free: c.is_free,
          lessons_count: c.lessons_count,
          duration: c.duration,
          level: '',
        })),
    }))
    .filter((r) => r.courses.length > 0);

  const roadmaps = bundleRoadmaps.length > 0 ? bundleRoadmaps : categoryRoadmaps;

  const store = (academy as Parameters<typeof formatCurrencyWithAcademy>[1]) ?? null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="animate-in fade-in slide-in-from-bottom-4 space-y-3 duration-500">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--theme-foreground)] sm:text-4xl">
          {translate('roadmap.title') || 'مرکز یادگیری'}
        </h1>
        <p className="text-muted max-w-2xl text-base leading-7">
          {translate('roadmap.subtitle') ||
            'یک مسیر ساختارمند را دنبال کنید یا دنبال آخرین مقالات ما را بخوانید.'}
        </p>
      </section>

      {/* Tabs: Roadmaps / Articles */}
      <RoadmapTabs
        roadmaps={roadmaps}
        articles={articles.map((a) => ({
          id: a.id,
          title: a.title,
          excerpt: a.excerpt ?? a.description ?? '',
          read_time: a.read_time ?? null,
          published_at: a.published_at ?? null,
          href: buildPath(`/blog/${a.slug}`),
          image: a.featured_image?.publicUrl ? resolveAssetUrl(a.featured_image.publicUrl) : null,
          category: a.category?.name ?? null,
        }))}
        store={store}
        language={language}
      />
    </div>
  );
}
