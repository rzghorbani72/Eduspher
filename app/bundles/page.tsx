import Link from "@/components/ui/link";
import { notFound } from "next/navigation";
import { Package, Check } from "lucide-react";

import { getAcademyPlansPublic, getCurrentAcademy, getAcademyBySlug, getCurrentUser, getCourses } from "@/lib/api/server";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath, formatCurrencyWithAcademy } from "@/lib/utils";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { Badge } from "@/components/ui/badge";
import { BundlesFaq } from "@/components/courses/bundles-faq";

export default async function BundlesPage() {
  const storeContext = await getAcademyContext();
  if (!storeContext.slug) notFound();

  const buildPath = (path: string) => buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  const [packages, user, currentAcademy] = await Promise.all([
    getAcademyPlansPublic("PACKAGE").catch(() => []),
    getCurrentUser().catch(() => null),
    getCurrentAcademy().catch(() => null),
  ]);

  let academy = currentAcademy;
  if (!academy && storeContext.slug) {
    academy = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);
  const store = user?.currentAcademy ?? (academy as Parameters<typeof formatCurrencyWithAcademy>[1]) ?? null;

  // Fetch all course ids referenced in packages to enrich with course data
  const allCourseIds = packages.flatMap((p) => p.AcademyPlanCourse.map((c) => c.Course.id));
  const uniqueIds = [...new Set(allCourseIds)];

  const enrichedCourses: Record<string, { title: string; price: number; lessons_count?: number; duration?: number }> = {};
  if (uniqueIds.length > 0) {
    const coursePayload = await getCourses({ limit: 50, published: true }).catch(() => null);
    if (coursePayload) {
      coursePayload.courses.forEach((c) => {
        enrichedCourses[String(c.id)] = {
          title: c.title,
          price: c.price,
          lessons_count: c.lessons_count,
          duration: c.duration ?? undefined,
        };
      });
    }
  }

  const midIndex = Math.ceil(packages.length / 2);
  const featuredIndex = packages.length > 1 ? midIndex - 1 : 0;

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center gap-2 rounded-full border border-theme bg-card px-4 py-1.5 text-sm font-medium text-[var(--theme-primary)]">
          <Package size={14} />
          <span>{translate("bundles.badge") || "دسترسی کامل با بسته‌های آموزشی"}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--theme-foreground)] sm:text-5xl">
          {translate("bundles.title") || "بسته‌های آموزشی"}
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-7 text-muted">
          {translate("bundles.subtitle") || "مسیرهای یادگیری دست‌چین شده ویژه، با تخفیف. یک نقشه راه متمرکز و تأثیر واقعی روی مسیر شغلی شما."}
        </p>
      </section>

      {/* Bundle cards */}
      {packages.length === 0 ? (
        <div className="rounded-theme border border-theme bg-card p-12 text-center text-muted">
          <Package size={40} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-semibold">{translate("bundles.noBundles") || "در حال حاضر بسته‌ای موجود نیست"}</p>
        </div>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {packages.map((pkg, idx) => {
            const isFeatured = idx === featuredIndex;
            const courses = pkg.AcademyPlanCourse.map((pc) => ({
              ...(enrichedCourses[pc.Course.id] ?? {}),
              id: pc.Course.id,
              title: pc.Course.title,
            }));

            const totalOriginal = courses.reduce((sum, c) => sum + (c.price ?? 0), 0);
            const discountPercent = totalOriginal > 0 ? Math.round(((totalOriginal - pkg.price) / totalOriginal) * 100) : 0;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                  isFeatured
                    ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/5 shadow-lg shadow-[var(--theme-primary)]/10 ring-2 ring-[var(--theme-primary)]/20"
                    : "border-theme bg-card"
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[var(--theme-primary)] px-4 py-1 text-xs font-bold text-[var(--theme-on-primary)]">
                      {translate("bundles.mostPopular") || "محبوب‌ترین انتخاب"}
                    </span>
                  </div>
                )}

                <div className="mb-4 flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--theme-foreground)]">{pkg.name}</h2>
                    {pkg.description && (
                      <p className="mt-1 text-sm text-muted">{pkg.description}</p>
                    )}
                  </div>
                  <span className="text-3xl">{idx === 0 ? "☁️" : idx === 1 ? "🤖" : "🏆"}</span>
                </div>

                <div className="mb-4 space-y-1 text-sm text-muted">
                  <p>{translate("bundles.includes") || "شامل"} {courses.length} {translate("bundles.course") || "دوره"}</p>
                </div>

                <ul className="mb-6 space-y-2.5 text-sm">
                  {courses.map((c) => (
                    <li key={c.id} className="flex items-center gap-2 text-[var(--theme-foreground)]">
                      <Check size={14} className="shrink-0 text-[var(--theme-primary)]" />
                      <span>{c.title}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto space-y-3">
                  {discountPercent > 0 && totalOriginal > 0 && (
                    <p className="text-sm text-muted line-through">
                      {formatCurrencyWithAcademy(totalOriginal, store, undefined, language)}
                    </p>
                  )}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-[var(--theme-foreground)]">
                        {formatCurrencyWithAcademy(pkg.price, store, undefined, language)}
                      </p>
                      {discountPercent > 0 && (
                        <Badge variant="success" className="mt-1">
                          {translate("bundles.save") || "صرفه‌جویی"} {discountPercent}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Link
                    href={buildPath(`/checkout?plan=${pkg.id}`)}
                    className={`inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition-all hover:scale-105 ${
                      isFeatured
                        ? "bg-[var(--theme-primary)] text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30 hover:opacity-90"
                        : "border border-theme bg-card text-[var(--theme-foreground)] hover:bg-surface"
                    }`}
                  >
                    {translate("bundles.buyBundle") || "خرید بسته"} →
                  </Link>

                  <p className="text-center text-xs text-muted opacity-60">
                    {translate("bundles.moneyBack") || "ضمانت بازگشت پول ۳۰ روزه"}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Comparison table */}
      {packages.length > 0 && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[var(--theme-foreground)]">
              {translate("bundles.compareTitle") || "بسته در مقابل خرید جداگانه"}
            </h2>
            <p className="text-muted text-sm">
              {translate("bundles.compareSubtitle") || "ببینید با خرید بسته دقیقاً چند درصد صرفه‌جویی می‌کنید."}
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-theme">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme bg-surface">
                  <th className="px-5 py-4 text-start font-semibold text-[var(--theme-foreground)]">
                    {translate("bundles.course") || "دوره"}
                  </th>
                  <th className="px-5 py-4 text-center font-semibold text-[var(--theme-foreground)]">
                    {translate("bundles.normalPrice") || "قیمت عادی"}
                  </th>
                  <th className="px-5 py-4 text-center font-semibold text-[var(--theme-primary)]">
                    {translate("bundles.inBundle") || "قیمت در بسته"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <>
                    <tr key={`pkg-header-${pkg.id}`} className="border-b border-theme bg-[var(--theme-primary)]/5">
                      <td colSpan={3} className="px-5 py-3 font-bold text-[var(--theme-primary)]">
                        🎯 {pkg.name}
                      </td>
                    </tr>
                    {pkg.AcademyPlanCourse.map((pc) => {
                      const course = enrichedCourses[pc.Course.id];
                      return (
                        <tr key={pc.Course.id} className="border-b border-theme/50 hover:bg-surface/50 transition-colors">
                          <td className="px-5 py-3 text-[var(--theme-foreground)]">{pc.Course.title}</td>
                          <td className="px-5 py-3 text-center text-muted">
                            {course?.price
                              ? formatCurrencyWithAcademy(course.price, store, undefined, language)
                              : "—"}
                          </td>
                          <td className="px-5 py-3 text-center font-semibold text-[var(--theme-primary)]">
                            {translate("bundles.included") || "شامل بسته"}
                          </td>
                        </tr>
                      );
                    })}
                    <tr key={`pkg-total-${pkg.id}`} className="border-b border-theme bg-surface">
                      <td className="px-5 py-3 font-bold text-[var(--theme-foreground)]">
                        {translate("bundles.total") || "جمع بسته"}
                      </td>
                      <td className="px-5 py-3 text-center text-muted">
                        {(() => {
                          const total = pkg.AcademyPlanCourse.reduce(
                            (sum, pc) => sum + (enrichedCourses[pc.Course.id]?.price ?? 0),
                            0
                          );
                          return total > 0 ? formatCurrencyWithAcademy(total, store, undefined, language) : "—";
                        })()}
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-[var(--theme-foreground)]">
                        {formatCurrencyWithAcademy(pkg.price, store, undefined, language)}
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* FAQ */}
      <BundlesFaq />
    </div>
  );
}
