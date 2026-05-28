/* eslint-disable @next/next/no-img-element */
import Link from "@/components/ui/link";

import {
  getArticles,
  getCategories,
  getCourses,
  getAcademiesPublic,
  getCurrentUser,
  getCurrentAcademy,
  getAcademyBySlug,
} from "@/lib/api/server";
import { CourseCard } from "@/components/courses/course-card";
import { buildOgImageUrl, resolveAssetUrl, truncate, buildAcademyPath } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getAcademyContext } from "@/lib/store-context";
import { getStoreThemeAndTemplate } from "@/lib/theme-config";
import { BlocksRenderer } from "@/components/ui-blocks/blocks-renderer";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { AcademyHomeAnimations } from "./academy-home-animations";

export async function AcademyHomePage() {
  const storeContext = await getAcademyContext();
  const buildPath = (path: string) => buildAcademyPath(storeContext.slug, path);

  const [academies, categories, articles, coursePayload, themeAndTemplate, user, currentAcademy] =
    await Promise.all([
      getAcademiesPublic().catch(() => []),
      getCategories().catch(() => []),
      getArticles().catch(() => []),
      getCourses({ limit: 6, published: true, is_featured: true } as any).catch(() => null),
      getStoreThemeAndTemplate().catch(() => ({ theme: null, template: null })),
      getCurrentUser().catch(() => null),
      getCurrentAcademy().catch(() => null),
    ]);

  const hasCatalogAccess = coursePayload !== null;
  const featuredCourses = coursePayload?.courses ?? [];
  const academyMatchById = storeContext.id ? academies.find((a) => a.id === storeContext.id) : null;
  const academyMatchBySlug = storeContext.slug
    ? academies.find((a) => (a as any).slug === storeContext.slug)
    : null;
  const primaryAcademy = academyMatchById ?? academyMatchBySlug ?? null;
  const storeDisplayName = primaryAcademy?.name ?? storeContext.name;
  const storeCurrency = user?.currentAcademy || (currentAcademy as any) || null;
  const stats = {
    students: (primaryAcademy as any)?.student_count ?? null,
    mentors: (primaryAcademy as any)?.mentor_count ?? null,
    courses: (primaryAcademy as any)?.course_count ?? coursePayload?.pagination?.total ?? null,
    rating: (primaryAcademy as any)?.average_rating ?? null,
  };

  let storeForLang = currentAcademy;
  if (!storeForLang && storeContext.slug)
    storeForLang = await getAcademyBySlug(storeContext.slug).catch(() => null);
  if (!storeForLang && primaryAcademy) storeForLang = primaryAcademy as any;
  const language = getAcademyLanguage(
    storeForLang?.language || null,
    storeForLang?.country_code || null
  );
  const translate = (key: string) => t(key, language);

  const hasUITemplate =
    themeAndTemplate.template?.blocks && themeAndTemplate.template.blocks.length > 0;

  if (hasUITemplate && themeAndTemplate.template) {
    return (
      <BlocksRenderer
        blocks={themeAndTemplate.template.blocks}
        storeContext={storeContext}
        includeHeaderFooter={false}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Static full-width marketing layout
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full" style={{ overflowX: 'hidden' }}>
      <AcademyHomeAnimations />

      {/* ══════════════════════════════════════════════════════════════
          HERO  –  full-viewport dramatic section
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden">
        {/* Layered radial-gradient backdrop */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: [
              'radial-gradient(ellipse 90% 65% at 50% -5%, color-mix(in srgb, var(--theme-primary) 28%, transparent), transparent)',
              'radial-gradient(ellipse 55% 45% at 95% 115%, color-mix(in srgb, var(--theme-secondary) 18%, transparent), transparent)',
              'radial-gradient(ellipse 50% 40% at 5% 105%, color-mix(in srgb, var(--theme-accent) 12%, transparent), transparent)',
              'var(--theme-background)',
            ].join(', '),
          }}
        />

        {/* Subtle dot-grid overlay */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.035]"
          style={{
            backgroundImage: [
              'radial-gradient(circle, var(--theme-foreground) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating blobs */}
        <div
          className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[600px] rounded-full opacity-[0.18] blur-3xl"
          style={{ background: 'var(--theme-primary)' }}
        />
        <div
          className="pointer-events-none absolute -left-40 bottom-0 h-[500px] w-[500px] rounded-full opacity-[0.13] blur-3xl"
          style={{ background: 'var(--theme-secondary)' }}
        />
        <div
          className="pointer-events-none absolute right-1/4 bottom-10 h-[300px] w-[300px] rounded-full opacity-[0.10] blur-2xl"
          style={{ background: 'var(--theme-accent)' }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <div id="hero-badge" style={{ opacity: 0 }}>
            <Badge
              variant="soft"
              className="mb-8 inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold"
            >
              <span
                className="flex h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              />
              {translate("home.newBadge")}
            </Badge>
          </div>

          <h1
            id="hero-title"
            className="mb-7 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
            style={{
              opacity: 0,
              color: 'var(--theme-foreground)',
              lineHeight: '1.05',
              letterSpacing: '-0.03em',
            }}
          >
            {translate("home.heroTitle").replace("{store}", storeDisplayName)}
          </h1>

          <p
            id="hero-description"
            className="mx-auto mb-11 max-w-2xl text-lg leading-relaxed sm:text-xl"
            style={{ opacity: 0, color: 'var(--theme-muted)' }}
          >
            {translate("home.heroDescription")}
          </p>

          <div
            id="hero-ctas"
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ opacity: 0 }}
          >
            <Link
              href={buildPath("/courses")}
              className="group inline-flex h-14 items-center justify-center rounded-full px-9 text-base font-bold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_48px_color-mix(in_srgb,var(--theme-primary)_50%,transparent)]"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-on-primary)',
                boxShadow: '0 8px 32px color-mix(in srgb, var(--theme-primary) 38%, transparent)',
              }}
            >
              {translate("home.browseCourses")}
              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </Link>
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-14 items-center justify-center rounded-full border-2 px-9 text-base font-bold backdrop-blur-md transition-all duration-300 hover:scale-105"
              style={{
                borderColor: 'var(--theme-border-strong)',
                color: 'var(--theme-foreground)',
                backgroundColor: 'color-mix(in srgb, var(--theme-background) 65%, transparent)',
              }}
            >
              {translate("home.startForFree")}
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          id="hero-scroll-hint"
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
          style={{ opacity: 0 }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--theme-foreground)' }}
          >
            scroll
          </span>
          <div
            className="relative h-10 w-px overflow-hidden rounded-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--theme-foreground) 15%, transparent)' }}
          >
            <div
              className="absolute inset-x-0 top-0 h-5 animate-bounce rounded-full"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS BAND  –  full-width social-proof strip
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="stats-band"
        className="w-full py-12"
        style={{
          opacity: 0,
          backgroundColor: 'color-mix(in srgb, var(--theme-primary) 7%, var(--theme-background))',
          borderTop: '1px solid color-mix(in srgb, var(--theme-primary) 18%, transparent)',
          borderBottom: '1px solid color-mix(in srgb, var(--theme-primary) 18%, transparent)',
        }}
      >
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-y-8 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            {
              label: translate("home.learners"),
              value: stats.students ? stats.students.toLocaleString() : "—",
            },
            {
              label: translate("home.mentors"),
              value: stats.mentors ? stats.mentors.toLocaleString() : "—",
            },
            {
              label: translate("home.courses"),
              value: stats.courses ? stats.courses.toLocaleString() : "—",
            },
            {
              label: translate("home.avgRating"),
              value: stats.rating ? `${stats.rating.toFixed(1)} / 5` : "—",
            },
          ].map((stat) => (
            <div key={stat.label} data-stat className="flex flex-col items-center gap-1 text-center">
              <p
                className="text-4xl font-black tabular-nums sm:text-5xl"
                style={{ color: 'var(--theme-primary)', letterSpacing: '-0.02em' }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs font-semibold uppercase tracking-widest opacity-55"
                style={{ color: 'var(--theme-foreground)' }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURED COURSES
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-28" style={{ backgroundColor: 'var(--theme-background)' }}>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div
            data-gsap="fade-up"
            className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p
                className="mb-2 text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: 'var(--theme-primary)' }}
              >
                {translate("courses.featuredCourses")}
              </p>
              <h2
                className="text-3xl font-black tracking-tight sm:text-4xl"
                style={{ color: 'var(--theme-foreground)', letterSpacing: '-0.025em' }}
              >
                {hasCatalogAccess
                  ? translate("home.featuredCoursesDescription")
                  : translate("home.loginToUnlock")}
              </h2>
            </div>
            {hasCatalogAccess ? (
              <Link
                href={buildPath("/courses")}
                className="group inline-flex shrink-0 items-center gap-1 text-sm font-bold transition-all duration-200"
                style={{ color: 'var(--theme-primary)' }}
              >
                {translate("home.exploreFullCatalogue")}
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            ) : null}
          </div>

          {/* Courses grid */}
          {featuredCourses.length ? (
            <div data-gsap="stagger" className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  storeSlug={storeContext.slug}
                  store={storeCurrency}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                hasCatalogAccess
                  ? translate("home.noFeaturedCourses")
                  : translate("home.signInToExplore")
              }
              description={
                hasCatalogAccess
                  ? translate("home.checkBackSoon")
                  : translate("home.createAccountToView")
              }
              action={
                !hasCatalogAccess ? (
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href={buildPath("/auth/login")}
                      className="inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-bold"
                      style={{
                        backgroundColor: 'var(--theme-primary)',
                        color: 'var(--theme-on-primary)',
                      }}
                    >
                      {translate("auth.login")}
                    </Link>
                    <Link
                      href={buildPath("/auth/register")}
                      className="inline-flex h-12 items-center justify-center rounded-full border-2 px-7 text-sm font-bold"
                      style={{
                        borderColor: 'var(--theme-border-strong)',
                        color: 'var(--theme-foreground)',
                      }}
                    >
                      {translate("auth.register")}
                    </Link>
                  </div>
                ) : null
              }
            />
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          VALUE PROPS  –  3-column icon feature strip
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="w-full py-24"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, var(--theme-background))',
          borderTop: '1px solid color-mix(in srgb, var(--theme-foreground) 6%, transparent)',
          borderBottom: '1px solid color-mix(in srgb, var(--theme-foreground) 6%, transparent)',
        }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-gsap="fade-up" className="mb-14 text-center">
            <p
              className="mb-2 text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: 'var(--theme-primary)' }}
            >
              {translate("home.personalisedLearningPaths")}
            </p>
            <h2
              className="text-3xl font-black tracking-tight sm:text-4xl"
              style={{ color: 'var(--theme-foreground)', letterSpacing: '-0.025em' }}
            >
              {translate("home.adaptiveRecommendations")}
            </h2>
          </div>
          <div
            data-gsap="stagger"
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                icon: '🎯',
                title: translate("home.guidedProjects"),
                body: translate("home.guidedProjectsDescription"),
              },
              {
                icon: '👥',
                title: translate("home.mentorCheckIns"),
                body: translate("home.mentorCheckInsDescription"),
              },
              {
                icon: '📈',
                title: translate("home.personalisedLearningPaths"),
                body: translate("home.adaptiveRecommendations"),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-border-color)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      'linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 6%, transparent), transparent)',
                  }}
                />
                <span className="mb-5 block text-4xl">{item.icon}</span>
                <h3
                  className="mb-3 text-xl font-bold"
                  style={{ color: 'var(--theme-foreground)' }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed opacity-60"
                  style={{ color: 'var(--theme-foreground)' }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════════════════════════ */}
      {categories.length ? (
        <section className="py-28" style={{ backgroundColor: 'var(--theme-background)' }}>
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              data-gsap="fade-up"
              className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <p
                  className="mb-2 text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  {translate("home.topCategories")}
                </p>
                <h2
                  className="text-3xl font-black tracking-tight sm:text-4xl"
                  style={{ color: 'var(--theme-foreground)', letterSpacing: '-0.025em' }}
                >
                  {translate("home.browseByInterest")}
                </h2>
              </div>
              <Link
                href={buildPath("/courses?view=categories")}
                className="group inline-flex shrink-0 items-center gap-1 text-sm font-bold transition-all duration-200"
                style={{ color: 'var(--theme-primary)' }}
              >
                {translate("home.browseByInterest")}
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </div>

            <div
              data-gsap="stagger"
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={buildPath(`/courses?category=${category.id}`)}
                  className="group relative overflow-hidden rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                  style={{
                    backgroundColor: 'var(--theme-card-bg)',
                    borderColor: 'var(--theme-border-color)',
                    color: 'var(--theme-foreground)',
                  }}
                >
                  {/* Hover shine */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        'linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 9%, transparent), transparent)',
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] opacity-45">
                        {translate("home.categoryLabel")}
                      </p>
                      <p className="truncate text-lg font-bold">{category.name}</p>
                      {category.description ? (
                        <p className="mt-1 text-sm leading-5 opacity-50">
                          {truncate(category.description, 72)}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base transition-all duration-300 group-hover:scale-110 group-hover:translate-x-1"
                      style={{
                        backgroundColor:
                          'color-mix(in srgb, var(--theme-primary) 14%, var(--theme-background))',
                        color: 'var(--theme-primary)',
                      }}
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ══════════════════════════════════════════════════════════════
          ARTICLES  –  magazine layout
      ══════════════════════════════════════════════════════════════ */}
      {articles.length ? (
        <section
          className="py-28"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--theme-foreground) 3%, var(--theme-background))',
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              data-gsap="fade-up"
              className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <p
                  className="mb-2 text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  {translate("home.fromTheJournal")}
                </p>
                <h2
                  className="text-3xl font-black tracking-tight sm:text-4xl"
                  style={{ color: 'var(--theme-foreground)', letterSpacing: '-0.025em' }}
                >
                  {translate("home.readAllInsights")}
                </h2>
              </div>
              <Link
                href={buildPath("/articles")}
                className="group inline-flex shrink-0 items-center gap-1 text-sm font-bold transition-all duration-200"
                style={{ color: 'var(--theme-primary)' }}
              >
                {translate("home.readAllInsights")}
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </div>

            <div data-gsap="stagger" className="grid gap-8 md:grid-cols-3">
              {articles.slice(0, 3).map((article) => {
                const imageUrl =
                  resolveAssetUrl(article.featured_image?.publicUrl) ?? "/globe.svg";
                const description = article.excerpt ?? article.description ?? "";
                const publishedDate = article.published_at
                  ? new Date(article.published_at).toLocaleDateString()
                  : "";

                return (
                  <article
                    key={article.id}
                    className="group flex flex-col overflow-hidden rounded-3xl border shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                    style={{
                      backgroundColor: 'var(--theme-card-bg)',
                      borderColor: 'var(--theme-border-color)',
                    }}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                      {publishedDate && (
                        <div className="absolute bottom-4 left-4">
                          <span
                            className="rounded-full px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
                            style={{
                              backgroundColor:
                                'color-mix(in srgb, var(--theme-primary) 85%, transparent)',
                            }}
                          >
                            {publishedDate}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-7">
                      <h3
                        className="text-lg font-bold leading-snug transition-colors duration-200 group-hover:text-[var(--theme-primary)]"
                        style={{ color: 'var(--theme-foreground)' }}
                      >
                        {article.title}
                      </h3>
                      <p
                        className="flex-1 text-sm leading-relaxed opacity-55"
                        style={{ color: 'var(--theme-foreground)' }}
                      >
                        {truncate(description, 120)}
                      </p>
                      <Link
                        href={buildPath(`/articles/${article.id}`)}
                        className="group/link inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-200"
                        style={{ color: 'var(--theme-primary)' }}
                      >
                        {translate("home.readArticle")}
                        <span className="transition-transform duration-200 group-hover/link:translate-x-1">→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ══════════════════════════════════════════════════════════════
          CTA  –  full-width dramatic gradient close
      ══════════════════════════════════════════════════════════════ */}
      <section
        data-gsap="scale-in"
        className="relative w-full overflow-hidden py-32 text-center"
        style={{
          background: `linear-gradient(135deg,
            var(--theme-primary) 0%,
            color-mix(in srgb, var(--theme-primary) 60%, var(--theme-secondary)) 40%,
            var(--theme-secondary) 70%,
            color-mix(in srgb, var(--theme-secondary) 70%, var(--theme-accent)) 100%)`,
          color: 'var(--theme-on-primary)',
        }}
      >
        {/* Decorative blobs inside CTA */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-25 blur-3xl"
          style={{ backgroundColor: 'var(--theme-accent)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: 'var(--theme-on-primary)' }}
        />

        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <Badge
            variant="soft"
            className="mb-8 inline-flex bg-white/15 text-[var(--theme-on-primary)]"
          >
            {translate("home.readyToBegin")}
          </Badge>

          <h2
            className="mb-5 text-4xl font-black tracking-tight sm:text-5xl"
            style={{ letterSpacing: '-0.03em' }}
          >
            {translate("home.createLearningAccount")}
          </h2>
          <p className="mb-12 text-lg leading-relaxed opacity-85">
            {translate("home.createLearningAccountDescription")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href={buildPath("/auth/login")}
              className="inline-flex h-14 items-center justify-center rounded-full px-10 text-base font-black shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
              style={{
                backgroundColor: 'var(--theme-on-primary)',
                color: 'var(--theme-primary)',
              }}
            >
              {translate("home.joinStore").replace("{store}", storeDisplayName)}
            </Link>
            {!storeContext.slug ? (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-sm font-bold opacity-90 transition-all duration-200 hover:translate-x-1 hover:opacity-100"
              >
                {translate("home.viewPricing")} →
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
