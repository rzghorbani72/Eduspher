import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getAcademyBundlePublic,
  getAcademyBySlug,
  getCurrentAcademy,
  getCurrentUser,
} from '@/lib/api/server';
import { bundleFromOffer } from '@/lib/bundles';
import { BundleCard } from '@/components/bundles/bundle-card';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { formatMinutes } from '@/components/courses/curriculum/format';
import { buildSiteMetadata } from '@/lib/seo/build-metadata';
import { getSeoRequestContext } from '@/lib/seo/request-context';
import { getAcademyContext } from '@/lib/store-context';
import { buildAcademyPath, formatCurrencyWithAcademy, toPersianDigits } from '@/lib/utils';

interface RoadmapDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RoadmapDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const ctx = await getSeoRequestContext();
  if (ctx.isPlatform) {
    return { robots: { index: false, follow: false } };
  }
  const store = await getAcademyContext();
  const [academy, bundle] = await Promise.all([
    store.slug ? getAcademyBySlug(store.slug).catch(() => null) : null,
    getAcademyBundlePublic(slug),
  ]);
  if (!bundle) return { robots: { index: false, follow: false } };
  return buildSiteMetadata({
    title: academy ? `${bundle.title} | ${academy.name}` : (bundle.title ?? undefined),
    description: bundle.description ?? undefined,
    ctx,
  });
}

/**
 * One learning path's own page — the destination for "دیدن مسیر" on the home
 * template and for the roadmap list's "دیدن مسیر" button. The path is a real
 * `Offer` spanning several courses: the order is `sort_order`, the price and
 * saving are the offer's own, and the buy box is the same `BundleCard` used on
 * `/bundles`, so a path is bought exactly the way a bundle is.
 */
export default async function RoadmapDetailPage({ params }: RoadmapDetailPageProps) {
  const { slug } = await params;
  const storeContext = await getAcademyContext();
  if (!storeContext.slug) notFound();

  const [bundle, currentAcademy, user] = await Promise.all([
    getAcademyBundlePublic(slug),
    getCurrentAcademy().catch(() => null),
    getCurrentUser().catch(() => null),
  ]);
  if (!bundle) notFound();

  const academy = currentAcademy ?? (await getAcademyBySlug(storeContext.slug).catch(() => null));
  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);
  const store =
    user?.currentAcademy ?? (academy as Parameters<typeof formatCurrencyWithAcademy>[1]) ?? null;
  const money = (value: number) => formatCurrencyWithAcademy(value, store, undefined, language);

  const loginHref = buildAcademyPath(
    storeContext.isSubdomain ? null : storeContext.slug,
    `/auth/login?redirect=/roadmap/${slug}`,
  );

  const studentBundle = bundleFromOffer(bundle);
  // The offer's own compare_at_price is the only honest "list price": it is
  // what the manager typed, not a sum we would have to guess at from courses
  // that may not even publish an individual price.
  const listPrice = bundle.compare_at_price ?? bundle.price;

  return (
    <div className="space-y-10">
      <section className="space-y-3 py-6">
        <p className="text-sm font-semibold text-(--theme-primary)">
          {translate('roadmap.pathBadge')}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-(--theme-foreground) sm:text-4xl">
          {bundle.title}
        </h1>
        {bundle.description && (
          <p className="text-muted max-w-2xl text-base leading-7">{bundle.description}</p>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Ordered steps */}
        <ol className="space-y-0">
          {bundle.Courses.map((entry, idx) => (
            <li key={entry.Course.id} className="relative flex gap-5 pb-8 last:pb-0">
              {idx < bundle.Courses.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-8 right-[15px] bottom-0 w-px bg-(--theme-border-color) ltr:left-[15px] rtl:right-[15px]"
                />
              )}
              <span className="z-[1] flex size-8 shrink-0 items-center justify-center rounded-full bg-(--theme-primary) text-xs font-bold text-(--theme-on-primary)">
                {toPersianDigits(idx + 1, language)}
              </span>
              <div className="border-theme bg-card flex-1 rounded-xl border p-5">
                <h2 className="text-base font-bold text-(--theme-foreground)">
                  {entry.Course.title}
                </h2>
                {entry.Course.short_description && (
                  <p className="text-muted mt-1.5 text-sm">{entry.Course.short_description}</p>
                )}
                {(entry.Course.lessons_count > 0 || entry.Course.duration) && (
                  <div className="text-muted mt-3 flex flex-wrap gap-4 text-xs">
                    {entry.Course.lessons_count > 0 && (
                      <span>
                        {toPersianDigits(entry.Course.lessons_count, language)}{' '}
                        {translate('courses.lessons') || 'درس'}
                      </span>
                    )}
                    {entry.Course.duration ? (
                      <span>{formatMinutes(entry.Course.duration, language, translate)}</span>
                    ) : null}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Buy box */}
        <div className="lg:sticky lg:top-24">
          <BundleCard
            bundle={studentBundle}
            listPrice={listPrice}
            priceLabel={money(bundle.price)}
            listPriceLabel={money(listPrice)}
            isFeatured
            loginHref={loginHref}
          />
        </div>
      </div>
    </div>
  );
}
