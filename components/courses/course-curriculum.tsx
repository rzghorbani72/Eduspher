"use client";

import { useMemo, useState } from "react";

import type { LessonSummary, SeasonSummary } from "@/lib/api/types";
import { cn, resolveAssetUrl } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/hooks";

interface CourseCurriculumProps {
  courseTitle: string;
  seasons: SeasonSummary[];
}

type LessonWithSeason = LessonSummary & {
  seasonId: number;
  seasonTitle: string;
};

const buildLessons = (seasons: SeasonSummary[]): LessonWithSeason[] =>
  seasons.flatMap((season) =>
    (season.Lesson ?? []).map((lesson) => ({
      ...lesson,
      seasonId: season.id,
      seasonTitle: season.title,
    }))
  );

export const CourseCurriculum = ({ courseTitle, seasons }: CourseCurriculumProps) => {
  const { t } = useTranslation();
  const lessons = useMemo(() => buildLessons(seasons), [seasons]);

  const initialLesson = useMemo(() => {
    return lessons.find((lesson) => lesson.is_free && (lesson as any).Video?.publicUrl)
      ?? lessons.find((lesson) => (lesson as any).Video?.publicUrl)
      ?? lessons[0]
      ?? null;
  }, [lessons]);

  const [currentLesson, setCurrentLesson] = useState<LessonWithSeason | null>(initialLesson);

  const currentVideoUrl = (currentLesson as any)?.Video?.publicUrl ? resolveAssetUrl((currentLesson as any).Video.publicUrl) : null;
  const currentSeasonTitle = currentLesson?.seasonTitle ?? (seasons[0]?.title ?? t("courses.coursePreview"));
  const currentTitle = currentLesson?.title ?? courseTitle;

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg transition-all hover:shadow-xl dark:border-slate-800">
        {currentVideoUrl ? (
          <video key={currentVideoUrl} src={currentVideoUrl} controls className="aspect-video w-full bg-black">
            {t("courses.videoNotSupported")}
          </video>
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-slate-900 text-slate-200">
            <span className="text-sm font-medium">{t("courses.noPreviewAvailable")}</span>
            <span className="text-xs text-slate-400">{t("courses.selectLessonToView")}</span>
          </div>
        )}
        <div className="space-y-1 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{currentSeasonTitle}</p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{currentTitle}</h3>
          {currentLesson?.description ? (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {currentLesson.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {seasons.length ? (
          seasons
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((season, seasonIndex) => {
              const seasonLessons = (season.Lesson ?? []).slice().sort((a: LessonSummary, b: LessonSummary) => (a.order ?? 0) - (b.order ?? 0));

              return (
                <div
                  key={season.id}
                  className="rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-start gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--theme-primary)] text-sm font-semibold text-white shadow-lg shadow-[var(--theme-primary)]/30">
                      {seasonIndex + 1}
                    </span>
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{season.title}</p>
                      {season.description ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{season.description}</p>
                      ) : null}
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {seasonLessons.length
                          ? `${seasonLessons.length} ${seasonLessons.length > 1 ? t("courses.lessons") : t("courses.lesson")}`
                          : t("courses.lessonsComingSoon")}
                      </p>
                    </div>
                  </div>

                  {seasonLessons.length ? (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                      {seasonLessons.map((lesson: LessonSummary, lessonIndex: number) => {
                        const isActive = currentLesson?.id === lesson.id;
                        const hasVideo = Boolean((lesson as any).Video?.publicUrl);
                        return (
                          <li key={lesson.id}>
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentLesson({
                                  ...lesson,
                                  seasonId: season.id,
                                  seasonTitle: season.title,
                                })
                              }
                              className={cn(
                                "flex w-full items-start gap-3 px-4 py-3 text-left transition-all duration-200",
                                isActive
                                  ? "bg-[var(--theme-primary)]/10 text-slate-900 dark:bg-[var(--theme-primary)]/10 dark:text-slate-100"
                                  : "bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                              )}
                            >
                              <div className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-all",
                                isActive
                                  ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white"
                                  : "border-slate-200 dark:border-slate-700"
                              )}>
                                {lessonIndex + 1}
                              </div>
                              <div className="flex flex-1 flex-col gap-1">
                                <span className="text-sm font-semibold">{lesson.title}</span>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                  {lesson.is_free ? (
                                    <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                                      {t("courses.preview")}
                                    </span>
                                  ) : null}
                                  {lesson.duration ? <span>{`${lesson.duration} ${t("courses.min")}`}</span> : null}
                                  {!hasVideo ? <span>{t("courses.noVideo")}</span> : null}
                                </div>
                                {lesson.description ? (
                                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                    {lesson.description}
                                  </p>
                                ) : null}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            {t("courses.lessonsComingSoonCheckBack")}
          </p>
        )}
      </div>
    </div>
  );
};

