/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import {
  getArticles,
  getCategories,
  getCourses,
  getStoresPublic,
  getCurrentUser,
  getCurrentStore,
  getStoreBySlug,
} from "@/lib/api/server";
import { CourseCard } from "@/components/courses/course-card";
import { buildOgImageUrl, resolveAssetUrl, truncate, buildStorePath } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getStoreContext } from "@/lib/store-context";
import { getStoreThemeAndTemplate } from "@/lib/theme-config";
import { BlocksRenderer } from "@/components/ui-blocks/blocks-renderer";
import { getStoreLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

export default async function Home() {
  const storeContext = await getStoreContext();
  const buildPath = (path: string) => buildStorePath(storeContext.slug, path);
  const [stores, categories, articles, coursePayload, themeAndTemplate, user, currentStore] = await Promise.all([
    getStoresPublic().catch(() => []),
    getCategories().catch(() => []),
    getArticles().catch(() => []),
    getCourses({ limit: 3, published: true, is_featured: true} as any).catch(() => null),
    getStoreThemeAndTemplate().catch(() => ({ theme: null, template: null })),
    getCurrentUser().catch(() => null),
    getCurrentStore().catch(() => null),
  ]);

  const hasCatalogAccess = coursePayload !== null;
  const featuredCourses = coursePayload?.courses ?? [];
  const storeMatchById = storeContext.id
    ? stores.find((store) => store.id === storeContext.id)
    : null;
  const storeMatchBySlug = storeContext.slug
    ? stores.find((store) => (store as any).slug === storeContext.slug)
    : null;
  const primaryStore = storeMatchById ?? storeMatchBySlug ?? stores[0] ?? null;
  const storeDisplayName = primaryStore?.name ?? storeContext.name;
  const storeCurrency = user?.currentStore || (currentStore as any) || null;
  const storeHeroLabel = primaryStore?.domain?.public_address ?? primaryStore?.domain?.private_address ?? "Premier digital campus";
  const stats = {
    students: (primaryStore as any)?.student_count ?? null,
    mentors: (primaryStore as any)?.mentor_count ?? null,
    courses:
      (primaryStore as any)?.course_count ?? coursePayload?.pagination?.total ?? null,
    rating: (primaryStore as any)?.average_rating ?? null,
  };

  // Get store language for translations
  let storeForLang = currentStore;
  if (!storeForLang && storeContext.slug) {
    storeForLang = await getStoreBySlug(storeContext.slug).catch(() => null);
  }
  if (!storeForLang && primaryStore) {
    storeForLang = primaryStore as any;
  }
  const language = getStoreLanguage(storeForLang?.language || null, storeForLang?.country_code || null);
  const translate = (key: string) => t(key, language);

  // If we have a UI template, render blocks dynamically
  // Otherwise, use the default static layout
  const hasUITemplate = themeAndTemplate.template?.blocks && themeAndTemplate.template.blocks.length > 0;
    
  // If we have a UI template, render blocks directly without wrapper
  // Blocks handle their own full-width layouts (header, hero, footer)
  if (hasUITemplate && themeAndTemplate.template) {
    return (
      <BlocksRenderer
        blocks={themeAndTemplate.template.blocks}
        storeContext={storeContext}
        includeHeaderFooter={false}
      />
    );
  }

  // Default static layout
  return (
    <div className="space-y-6">
      <>
      <section 
        data-scroll-animate="fadeIn"
        data-scroll-delay="0"
        className="relative grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-center py-6 sm:py-8 overflow-hidden"
      >
        {/* Creative background elements for homepage */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Animated gradient blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-secondary)]/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "1s" }} />
        </div>
        <div className="space-y-4">
          <Badge variant="soft" className="w-fit">{translate("home.newBadge")}</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {translate("home.heroTitle").replace("{store}", storeDisplayName)}
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            {translate("home.heroDescription")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={buildPath("/courses")}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--theme-primary)] px-6 text-sm font-semibold text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40"
            >
              {translate("home.browseCourses")}
            </Link>
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition-all hover:scale-105 hover:bg-slate-100 hover:border-[var(--theme-primary)]/30 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              {translate("home.startForFree")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: translate("home.learners"), value: stats.students ? stats.students.toLocaleString() : "—" },
              { label: translate("home.mentors"), value: stats.mentors ? stats.mentors.toLocaleString() : "—" },
              { label: translate("home.courses"), value: stats.courses ? stats.courses.toLocaleString() : "—" },
              { label: translate("home.avgRating"), value: stats.rating ? `${stats.rating.toFixed(1)}/5` : "—" },
            ].map((stat, index) => (
              <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-lg transition-all hover:shadow-xl dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--theme-primary)]">
              {storeHeroLabel}
            </p>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {translate("home.personalisedLearningPaths")}
            </p>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {translate("home.adaptiveRecommendations")}
            </p>
          </div>
          <div className="mt-6 grid gap-3">
            <div className="rounded-xl bg-white/90 p-4 shadow-md shadow-sky-100 transition-all hover:shadow-lg dark:bg-slate-900/80 dark:shadow-slate-900/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{translate("home.guidedProjects")}</p>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                {translate("home.guidedProjectsDescription")}
              </p>
            </div>
            <div className="rounded-xl bg-white/90 p-4 shadow-md shadow-emerald-100 transition-all hover:shadow-lg dark:bg-slate-900/80 dark:shadow-slate-900/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{translate("home.mentorCheckIns")}</p>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                {translate("home.mentorCheckInsDescription")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 py-6 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("courses.featuredCourses")}</h2>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              {hasCatalogAccess
                ? translate("home.featuredCoursesDescription")
                : translate("home.loginToUnlock")}
            </p>
          </div>
          {hasCatalogAccess ? (
            <Link
              className="text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
              href={buildPath("/courses")}
            >
              {translate("home.exploreFullCatalogue")} →
            </Link>
          ) : null}
        </div>
        {featuredCourses.length ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {featuredCourses.map((course, index) => (
              <div
                key={course.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CourseCard course={course} storeSlug={storeContext.slug} store={storeCurrency} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={hasCatalogAccess ? translate("home.noFeaturedCourses") : translate("home.signInToExplore")}
            description={
              hasCatalogAccess
                ? translate("home.checkBackSoon")
                : translate("home.createAccountToView")
            }
            action={
              hasCatalogAccess ? null : (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={buildPath("/auth/login")}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--theme-primary)] px-6 text-sm font-semibold text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:bg-[var(--theme-primary)]/90 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40"
                  >
                    {translate("auth.login")}
                  </Link>
                  <Link
                    href={buildPath("/auth/register")}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition-all hover:scale-105 hover:bg-slate-100 hover:border-[var(--theme-primary)]/30 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    {translate("auth.register")}
                  </Link>
                </div>
              )
            }
          />
        )}
      </section>

      {categories.length ? (
        <section className="space-y-4 py-6 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("home.topCategories")}</h2>
            <Link
              href={buildPath("/courses?view=categories")}
              className="text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
            >
              {translate("home.browseByInterest")} →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((category, index) => (
              <div
                key={category.id}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--theme-primary)]/30 hover:shadow-md dark:border-slate-800 dark:from-slate-950 dark:to-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {translate("home.categoryLabel")}
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {category.name}
                  </p>
                  {category.description ? (
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {truncate(category.description, 80)}
                    </p>
                  ) : null}
                </div>
                <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {articles.length ? (
        <section className="space-y-4 py-6 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("home.fromTheJournal")}</h2>
            <Link
              href={buildPath("/articles")}
              className="text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
            >
              {translate("home.readAllInsights")} →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {articles.slice(0, 3).map((article, index) => {
              const imageUrl = resolveAssetUrl(article.featured_image?.publicUrl) ?? "/globe.svg";
              const description = article.excerpt ?? article.description ?? "";
              const publishedDate = article.published_at
                ? new Date(article.published_at).toLocaleDateString()
                : "";

              return (
                <article
                  key={article.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--theme-primary)]/30 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {publishedDate}
                    </p>
                    <h3 className="text-lg font-semibold leading-7 text-slate-900 transition-colors group-hover:text-[var(--theme-primary)] dark:text-white dark:group-hover:text-[var(--theme-primary)]">
                      {article.title}
                    </h3>
                    <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {truncate(description, 140)}
                    </p>
                    <Link
                      href={buildPath(`/articles/${article.id}`)}
                      className="mt-auto inline-flex items-center text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
                    >
                      {translate("home.readArticle")} →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--theme-primary)] via-[var(--theme-secondary)] to-[var(--theme-accent)] p-8 text-white shadow-2xl transition-all hover:shadow-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge variant="soft" className="bg-white/20 text-white">{translate("home.readyToBegin")}</Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {translate("home.createLearningAccount")}
          </h2>
          <p className="text-sm leading-6 text-white/90">
            {translate("home.createLearningAccountDescription")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[var(--theme-primary)] shadow-lg shadow-white/20 transition-all hover:scale-105 hover:bg-slate-100"
            >
              {translate("home.joinStore").replace("{store}", storeDisplayName)}
            </Link>
            <Link href={buildPath("/pricing")} className="text-sm font-semibold text-white transition-all hover:translate-x-1 hover:underline">
              {translate("home.viewPricing")} →
            </Link>
          </div>
        </div>
        <img
          src={buildOgImageUrl(storeDisplayName, "Flexible online learning for ambitious students")}
          alt=""
          className="pointer-events-none absolute -right-32 -top-32 hidden h-80 w-80 opacity-10 lg:block"
        />
      </section>
      </>
    </div>
  );
}
