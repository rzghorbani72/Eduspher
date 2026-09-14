import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Package } from 'lucide-react';

import { BundleCard } from '@/components/bundles/bundle-card';
import { BundlesFaq } from '@/components/courses/bundles-faq';
import {
  getAcademyBundlesPublic,
  getAcademyBySlug,
  getAcademyPlansPublic,
  getCourses,
  getCurrentAcademy,
  getCurrentUser,
} from '@/lib/api/server';
import { toStudentBundles } from '@/lib/bundles';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { buildSiteMetadata } from '@/lib/seo/build-metadata';
import { getSeoRequestContext } from '@/lib/seo/request-context';
import { getAcademyContext } from '@/lib/store-context';
import { buildAcademyPath, formatCurrencyWithAcademy } from '@/lib/utils';

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
    title: academy ? `${translate('bundles.title')} | ${academy.name}` : translate('bundles.title'),
    description: translate('bundles.subtitle'),
    ctx,
  });
}

export default async function BundlesPage() {
  const storeContext = await getAcademyContext();
  if (!storeContext.slug) notFound();

  const [packages, offerBundles, user, currentAcademy, coursePayload] = await Promise.all([
    getAcademyPlansPublic('PACKAGE').catch(() => []),
    getAcademyBundlesPublic(),
    getCurrentUser().catch(() => null),
    getCurrentAcademy().catch(() => null),
    getCourses({ limit: 100, published: true }).catch(() => null),
  ]);

  const academy = currentAcademy ?? (await getAcademyBySlug(storeContext.slug).catch(() => null));
  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);
  const store =
    user?.currentAcademy ?? (academy as Parameters<typeof formatCurrencyWithAcademy>[1]) ?? null;
  const money = (value: number) => formatCurrencyWithAcademy(value, store, undefined, language);

  const loginHref = buildAcademyPath(
    storeContext.isSubdomain ? null : storeContext.slug,
    '/auth/login?redirect=/bundles',
  );

  // Individual course prices turn a bundle price into a visible saving.
  const coursePrices = new Map(
    (coursePayload?.courses ?? []).map((course) => [course.id, course.price ?? 0]),
  );

  const bundles = toStudentBundles(packages, offerBundles);
  const featuredIndex = bundles.length > 1 ? Math.ceil(bundles.length / 2) - 1 : 0;

  return (
    <div className="space-y-16">
      <section className="animate-in fade-in slide-in-from-bottom-4 space-y-4 py-8 text-center duration-500">
        <div className="border-theme bg-card inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium text-(--theme-primary)">
          <Package size={14} />
          <span>{translate('bundles.badge')}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-(--theme-foreground) sm:text-5xl">
          {translate('bundles.title')}
        </h1>
        <p className="text-muted mx-auto max-w-2xl text-base leading-7">
          {translate('bundles.subtitle')}
        </p>
      </section>

      {bundles.length === 0 ? (
        <div className="rounded-theme border-theme bg-card text-muted border p-12 text-center">
          <Package size={40} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-semibold">{translate('bundles.noBundles')}</p>
        </div>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle, index) => {
            const listPrice = bundle.courses.reduce(
              (sum, course) => sum + (coursePrices.get(course.id) ?? 0),
              0,
            );
            return (
              <BundleCard
                key={bundle.key}
                bundle={bundle}
                listPrice={listPrice}
                priceLabel={money(bundle.price)}
                listPriceLabel={money(listPrice)}
                isFeatured={index === featuredIndex}
                loginHref={loginHref}
              />
            );
          })}
        </section>
      )}

      <BundlesFaq />
    </div>
  );
}
