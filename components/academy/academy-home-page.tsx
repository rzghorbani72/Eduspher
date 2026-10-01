import {
  getBlogArticles,
  getCategories,
  getCourses,
  getCurrentAcademy,
  getAcademyBySlug,
} from '@/lib/api/server';
import { buildAcademyPath } from '@/lib/utils';
import { getAcademyContext } from '@/lib/store-context';
import { getStoreThemeAndTemplate } from '@/lib/theme-config';
import { BlocksRenderer } from '@/components/ui-blocks/blocks-renderer';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { AcademyHomeAnimations } from './academy-home-animations';
import { CallToActionSection } from './academy-home-page/call-to-action-section';
import { ShowcaseSection } from './academy-home-page/showcase-section';
import { CoursesSection } from './academy-home-page/courses-section';
import { HighlightsSection } from './academy-home-page/highlights-section';
import { ContentSection } from './academy-home-page/content-section';
import { StatsBand } from './academy-home-page/stats-band';
import { HeroSection } from './academy-home-page/hero-section';

export async function AcademyHomePage() {
  const storeContext = await getAcademyContext();
  const buildPath = (path: string) =>
    buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  const [categories, articles, coursePayload, themeAndTemplate, currentAcademy, publicAcademy] =
    await Promise.all([
      getCategories().catch(() => []),
      getBlogArticles(storeContext.slug).catch(() => []),
      getCourses({ limit: 6, published: true, is_featured: true } as Parameters<
        typeof getCourses
      >[0]).catch(() => null),
      getStoreThemeAndTemplate().catch(() => ({ theme: null, template: null })),
      getCurrentAcademy().catch(() => null),
      storeContext.slug
        ? getAcademyBySlug(storeContext.slug).catch(() => null)
        : Promise.resolve(null),
    ]);

  const hasCatalogAccess = coursePayload !== null;
  const featuredCourses = coursePayload?.courses ?? [];
  const primaryAcademy = publicAcademy;
  const storeDisplayName = primaryAcademy?.name ?? storeContext.name;
  const paStats = primaryAcademy as {
    student_count?: number;
    mentor_count?: number;
    course_count?: number;
    average_rating?: number;
  } | null;
  const stats = {
    students: paStats?.student_count ?? null,
    mentors: paStats?.mentor_count ?? null,
    courses: paStats?.course_count ?? coursePayload?.pagination?.total ?? null,
    rating: paStats?.average_rating ?? null,
  };

  let storeForLang = currentAcademy;
  if (!storeForLang && primaryAcademy) storeForLang = primaryAcademy as typeof currentAcademy;
  const language = getAcademyLanguage(
    storeForLang?.language || null,
    storeForLang?.country_code || null,
  );
  const translate = (key: string) => t(key, language);

  const hasUITemplate =
    themeAndTemplate.template?.blocks && themeAndTemplate.template.blocks.length > 0;

  if (hasUITemplate && themeAndTemplate.template) {
    // Prefer live academy stats over template-configured placeholder stats
    const liveStats =
      stats.students !== null || stats.courses !== null
        ? {
            studentCount: stats.students ?? 0,
            courseCount: stats.courses ?? 0,
          }
        : null;
    return (
      <BlocksRenderer
        blocks={themeAndTemplate.template.blocks}
        storeContext={{
          ...storeContext,
          stats: liveStats ?? themeAndTemplate.template.academy_stats ?? null,
        }}
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
      <HeroSection
        buildPath={buildPath}
        storeDisplayName={storeDisplayName}
        translate={translate}
      />

      {/* ══════════════════════════════════════════════════════════════
          STATS BAND  –  full-width social-proof strip
      ══════════════════════════════════════════════════════════════ */}
      <StatsBand language={language} stats={stats} translate={translate} />

      {/* ══════════════════════════════════════════════════════════════
          FEATURED COURSES
      ══════════════════════════════════════════════════════════════ */}
      <ContentSection
        buildPath={buildPath}
        featuredCourses={featuredCourses}
        hasCatalogAccess={hasCatalogAccess}
        storeContext={storeContext}
        translate={translate}
      />

      {/* ══════════════════════════════════════════════════════════════
          VALUE PROPS  –  3-column icon feature strip
      ══════════════════════════════════════════════════════════════ */}
      <HighlightsSection translate={translate} />

      {/* ══════════════════════════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════════════════════════ */}
      {categories.length ? (
        <CoursesSection buildPath={buildPath} categories={categories} translate={translate} />
      ) : null}

      {/* ══════════════════════════════════════════════════════════════
          ARTICLES  –  magazine layout
      ══════════════════════════════════════════════════════════════ */}
      {articles.length ? (
        <ShowcaseSection articles={articles} buildPath={buildPath} translate={translate} />
      ) : null}

      {/* ══════════════════════════════════════════════════════════════
          CTA  –  full-width dramatic gradient close
      ══════════════════════════════════════════════════════════════ */}
      <CallToActionSection
        buildPath={buildPath}
        storeContext={storeContext}
        storeDisplayName={storeDisplayName}
        translate={translate}
      />
    </div>
  );
}
