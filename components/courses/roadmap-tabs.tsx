"use client";

import { useState } from "react";
import Link from "@/components/ui/link";
import { BookOpen, Clock } from "lucide-react";
import { useTranslation } from "@/lib/i18n/hooks";
import { formatCurrencyWithAcademy } from "@/lib/utils";

interface RoadmapCourse {
  id: number;
  step: number;
  title: string;
  short_description: string;
  price: number;
  is_free: boolean;
  lessons_count?: number;
  duration?: number | null;
  level: string;
}

interface Roadmap {
  id: number;
  name: string;
  icon: string;
  description: string;
  courses: RoadmapCourse[];
}

interface Article {
  id: number;
  title: string;
  excerpt: string;
  read_time: number | null;
  published_at: string | null;
  href: string;
  image: string | null;
  category: string | null;
}

interface RoadmapTabsProps {
  roadmaps: Roadmap[];
  articles: Article[];
  store: Parameters<typeof formatCurrencyWithAcademy>[1];
  language: string;
  buildPath: (path: string) => string;
}

export function RoadmapTabs({ roadmaps, articles, store, language, buildPath }: RoadmapTabsProps) {
  const [activeTab, setActiveTab] = useState<"roadmaps" | "articles">("roadmaps");
  const [activeRoadmap, setActiveRoadmap] = useState<number>(roadmaps[0]?.id ?? 0);
  const { t } = useTranslation();

  const selectedRoadmap = roadmaps.find((r) => r.id === activeRoadmap);

  return (
    <div className="space-y-8">
      {/* Top tabs */}
      <div className="flex gap-1 rounded-xl border border-theme bg-card p-1 w-fit">
        <button
          onClick={() => setActiveTab("roadmaps")}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
            activeTab === "roadmaps"
              ? "bg-[var(--theme-primary)] text-[var(--theme-on-primary)] shadow"
              : "text-muted hover:text-foreground"
          }`}
        >
          🗺️ {t("roadmap.paths") || "نقشه راه‌ها"}
        </button>
        <button
          onClick={() => setActiveTab("articles")}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
            activeTab === "articles"
              ? "bg-[var(--theme-primary)] text-[var(--theme-on-primary)] shadow"
              : "text-muted hover:text-foreground"
          }`}
        >
          📰 {t("roadmap.articles") || "مقالات"}
        </button>
      </div>

      {activeTab === "roadmaps" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Roadmap selector pills */}
          {roadmaps.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {roadmaps.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveRoadmap(r.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105 ${
                    activeRoadmap === r.id
                      ? "bg-[var(--theme-primary)] text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30"
                      : "border border-theme bg-card text-[var(--theme-foreground)] hover:border-primary/40"
                  }`}
                >
                  <span>{r.icon}</span>
                  {r.name}
                </button>
              ))}
            </div>
          )}

          {/* Selected roadmap content */}
          {selectedRoadmap && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[var(--theme-primary)]">
                  {selectedRoadmap.icon} {selectedRoadmap.name}
                </h2>
                {selectedRoadmap.description && (
                  <p className="text-sm text-muted">{selectedRoadmap.description}</p>
                )}
              </div>

              {/* Timeline */}
              <div className="relative space-y-0">
                {selectedRoadmap.courses.map((course, idx) => (
                  <div key={course.id} className="relative flex gap-6">
                    {/* Step indicator + connector */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--theme-primary)] text-sm font-bold text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30">
                        {course.step}
                      </div>
                      {idx < selectedRoadmap.courses.length - 1 && (
                        <div className="mt-1 w-0.5 flex-1 bg-[var(--theme-primary)]/20 min-h-[2rem]" />
                      )}
                    </div>

                    {/* Card */}
                    <div className="mb-4 flex-1 rounded-xl border border-theme bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold text-[var(--theme-foreground)]">{course.title}</span>
                            <span className="rounded-full border border-theme px-2.5 py-0.5 text-xs text-muted">
                              {course.level}
                            </span>
                          </div>
                          {course.short_description && (
                            <p className="text-sm text-muted">{course.short_description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                            {course.lessons_count && course.lessons_count > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen size={12} />
                                {course.lessons_count} {t("courses.lessons") || "درس"}
                              </span>
                            )}
                            {course.duration && course.duration > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {course.duration >= 60
                                  ? `${Math.floor(course.duration / 60)} ${t("courses.hours") || "ساعت"}`
                                  : `${course.duration} ${t("courses.minutes") || "دقیقه"}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-lg font-bold text-[var(--theme-foreground)]">
                            {course.is_free
                              ? t("courses.free") || "رایگان"
                              : formatCurrencyWithAcademy(course.price, store, undefined, language)}
                          </p>
                          <Link
                            href={buildPath(`/courses/${course.id}`)}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--theme-primary)] transition-all hover:gap-2"
                          >
                            {t("roadmap.viewCourse") || "مشاهده دوره"} →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {roadmaps.length === 0 && (
            <div className="rounded-xl border border-theme bg-card p-12 text-center text-muted">
              <p>{t("roadmap.noRoadmaps") || "در حال حاضر نقشه راهی موجود نیست."}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "articles" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {articles.length === 0 ? (
            <div className="rounded-xl border border-theme bg-card p-12 text-center text-muted">
              <p>{t("roadmap.noArticles") || "در حال حاضر مقاله‌ای موجود نیست."}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={article.href}
                  className="group flex gap-4 rounded-xl border border-theme bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
                >
                  {article.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    {article.category && (
                      <span className="text-xs font-medium text-[var(--theme-primary)]">{article.category}</span>
                    )}
                    <h3 className="font-semibold text-[var(--theme-foreground)] transition-colors group-hover:text-[var(--theme-primary)]">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="line-clamp-2 text-sm text-muted">{article.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted opacity-60">
                      {article.read_time && <span>{article.read_time} {t("articles.minRead") || "دقیقه مطالعه"}</span>}
                      {article.published_at && (
                        <span>{new Date(article.published_at).toLocaleDateString("fa-IR")}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
