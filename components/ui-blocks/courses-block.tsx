import { getCourses, getCurrentUser, getCurrentAcademy, getAcademyBySlug } from "@/lib/api/server";
import { CourseCard } from "@/components/courses/course-card";
import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { buildAcademyPath } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { SlotGrid, PlaceholderCard, SectionEmptyState } from "./slot-grid";
import { resolveSlots, type SlotConfig } from "@/lib/slot-config";

interface CoursesBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    showFilters?: boolean;
    gridColumns?: number;
    limit?: number;
    layout?: "grid" | "list" | "minimal" | "featured" | "compact";
    showViewAll?: boolean;
    featured?: boolean;
    slots?: SlotConfig[];
    text?: Record<string, string>;
  };
  storeContext?: {
    id: number | null;
    slug: string | null;
    isSubdomain?: boolean;
    name: string | null;
    academyId?: string | null;
  };
}

const sectionStyle = { backgroundColor: 'var(--theme-background)', color: 'var(--theme-foreground)' };
const featuredSectionStyle = {
  background: 'linear-gradient(180deg, var(--theme-surface-alt), var(--theme-background))',
  color: 'var(--theme-foreground)',
};

const basisFor = (cols: number): string =>
  cols >= 4 ? "260px" : cols === 2 ? "440px" : "320px";

export async function CoursesBlock({ id, config, storeContext }: CoursesBlockProps) {
  const title = config?.title;
  const subtitle = config?.subtitle;
  const limit = config?.limit || 6;
  const gridColumns = config?.gridColumns || 3;
  const layout = config?.layout || "grid";
  const showViewAll = config?.showViewAll !== false;

  const [coursePayload, user, currentAcademy] = await Promise.all([
    getCourses({
      limit,
      published: true,
      ...(storeContext?.academyId ? { academy_id: storeContext.academyId } : {}),
    }).catch(() => null),
    getCurrentUser().catch(() => null),
    getCurrentAcademy().catch(() => null),
  ]);

  const courses = coursePayload?.courses || [];
  const storeCurrency =
    user?.currentAcademy ||
    (currentAcademy as { currency?: string; currency_symbol?: string; currency_position?: "before" | "after" }) ||
    null;

  let storeForLang = currentAcademy;
  if (!storeForLang && storeContext?.slug) {
    storeForLang = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }
  const language = getAcademyLanguage(storeForLang?.language || null, storeForLang?.country_code || null);
  const translate = (key: string) => t(key, language);
  const tx = (key: string, fallback: string) => config?.text?.[key] ?? fallback;

  // Slot model — fixed container of `limit` slots. Live courses fill in order;
  // empty/hidden slots are handled by resolveSlots so the grid never collapses.
  const resolved = resolveSlots(courses, config?.slots, limit);
  const courseNodes = resolved.map((slot, i) =>
    slot.kind === "live" ? (
      <CourseCard key={i} course={slot.data} storeSlug={storeContext?.isSubdomain ? null : (storeContext?.slug ?? null)} store={storeCurrency} />
    ) : (
      <PlaceholderCard key={i} text={slot.text} />
    ),
  );

  // Section header — always shown, with eyebrow label + bold heading
  const renderHeader = (centered = false) => (
    <div
      className={cn(
        "mb-14",
        centered
          ? "mx-auto max-w-2xl text-center"
          : "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
      )}
    >
      <div className={centered ? "" : "max-w-2xl"}>
        <p
          className="mb-2 text-xs font-bold uppercase tracking-[0.18em]"
          style={{ color: 'var(--theme-primary)' }}
        >
          {tx("eyebrow", translate("courses.featuredCourses"))}
        </p>
        <h2
          data-editable="title"
          className="text-3xl font-black tracking-tight sm:text-4xl"
          style={{ color: 'var(--theme-foreground)', letterSpacing: '-0.025em' }}
        >
          {title || translate("home.featuredCoursesDescription")}
        </h2>
        {subtitle && (
          <p
            data-editable="subtitle"
            data-editable-kind="rich"
            className="mt-3 text-base leading-relaxed"
            style={{ color: 'var(--theme-muted)' }}
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
        )}
      </div>
      {!centered && showViewAll && (
        <Link
          href={buildAcademyPath(storeContext?.isSubdomain ? null : (storeContext?.slug ?? null), "/courses")}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-bold transition-all duration-200"
          style={{ color: 'var(--theme-primary)' }}
        >
          {tx("viewAll", translate("home.exploreFullCatalogue"))}
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );

  const renderViewAll = () =>
    showViewAll ? (
      <div className="mt-10 text-center">
        <Button
          size="lg"
          asChild
          className="shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          style={{
            backgroundColor: 'var(--theme-primary)',
            color: 'var(--theme-on-primary)',
            boxShadow: 'var(--theme-shadow)',
          }}
        >
          <Link href={buildAcademyPath(storeContext?.isSubdomain ? null : (storeContext?.slug ?? null), "/courses")}>
            {tx("viewAllButton", translate("home.viewAllCourses"))}
          </Link>
        </Button>
      </div>
    ) : null;

  // No published courses yet — show one designed empty state instead of a grid
  // of identical placeholder cards, so a new academy still looks intentional.
  if (courses.length === 0) {
    return (
      <section id={id || "courses"} className="py-16 sm:py-24" style={sectionStyle}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {renderHeader(true)}
          <SectionEmptyState
            title={translate("home.noFeaturedCourses")}
            subtitle={translate("home.checkBackSoon")}
          />
        </div>
      </section>
    );
  }

  if (layout === "list") {
    return (
      <section id={id || "courses"} className="py-16 sm:py-24" style={sectionStyle}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {renderHeader(false)}
          <div data-dynamic="true" className="space-y-5">
            {resolved.map((slot, i) =>
              slot.kind === "live" ? (
                <CourseCard key={i} course={slot.data} storeSlug={storeContext?.isSubdomain ? null : (storeContext?.slug ?? null)} />
              ) : (
                <PlaceholderCard key={i} text={slot.text} />
              ),
            )}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "minimal" || layout === "compact") {
    return (
      <section id={id || "courses"} className="py-12 sm:py-16" style={sectionStyle}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {renderHeader(false)}
          <div data-dynamic="true">
            <SlotGrid config={config} minBasisFallback={basisFor(gridColumns)}>
              {courseNodes}
            </SlotGrid>
          </div>
        </div>
      </section>
    );
  }

  if (layout === "featured") {
    return (
      <section id={id || "courses"} className="py-16 sm:py-24" style={featuredSectionStyle}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {renderHeader(true)}
          <div data-dynamic="true">
            <SlotGrid config={config} minBasisFallback={basisFor(gridColumns)}>
              {courseNodes}
            </SlotGrid>
          </div>
          {renderViewAll()}
        </div>
      </section>
    );
  }

  // Default: grid layout
  return (
    <section id={id || "courses"} className="py-16 sm:py-24" style={sectionStyle}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {renderHeader(true)}
        <div data-dynamic="true">
          <SlotGrid config={config} minBasisFallback={basisFor(gridColumns)}>
            {courseNodes}
          </SlotGrid>
        </div>
        {renderViewAll()}
      </div>
    </section>
  );
}
