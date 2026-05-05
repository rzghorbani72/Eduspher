"use client";

import { useMemo, useState } from "react";

import type { LessonSummary, SeasonSummary } from "@/lib/api/types";
import { cn, resolveAssetUrl } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/hooks";
import { LessonLivePanel } from "@/components/courses/lesson-live-panel";

interface CourseCurriculumProps {
  courseTitle: string;
  seasons: SeasonSummary[];
  isLoggedIn: boolean;
  loginHref: string;
  enrollHref: string;
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

export const CourseCurriculum = ({
  courseTitle,
  seasons,
  isLoggedIn,
  loginHref,
  enrollHref,
}: CourseCurriculumProps) => {
  const { t } = useTranslation();
  const lessons = useMemo(() => buildLessons(seasons), [seasons]);

  const initialLesson = useMemo(() => {
    const withVideo = (l: LessonWithSeason) => Boolean((l as any).Video?.publicUrl);
    const isLive = (l: LessonWithSeason) =>
      l.lesson_type === "LIVE" || Boolean(l.LiveSession);
    return (
      lessons.find((lesson) => lesson.is_free && withVideo(lesson)) ??
      lessons.find((lesson) => withVideo(lesson)) ??
      lessons.find((lesson) => isLive(lesson)) ??
      lessons[0] ??
      null
    );
  }, [lessons]);

  const [currentLesson, setCurrentLesson] = useState<LessonWithSeason | null>(initialLesson);

  const currentVideoUrl = (currentLesson as any)?.Video?.publicUrl
    ? resolveAssetUrl((currentLesson as any).Video.publicUrl)
    : null;
  const isLiveLesson =
    currentLesson?.lesson_type === "LIVE" || Boolean(currentLesson?.LiveSession);
  const currentSeasonTitle =
    currentLesson?.seasonTitle ?? (seasons[0]?.title ?? t("courses.coursePreview"));
  const currentTitle = currentLesson?.title ?? courseTitle;

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-theme border border-theme bg-card shadow-lg transition-all hover:shadow-xl">
        {currentLesson && isLiveLesson ? (
          <LessonLivePanel
            lesson={currentLesson}
            isLoggedIn={isLoggedIn}
            loginHref={loginHref}
            enrollHref={enrollHref}
          />
        ) : currentVideoUrl ? (
          <video key={currentVideoUrl} src={currentVideoUrl} controls className="aspect-video w-full bg-black">
            {t("courses.videoNotSupported")}
          </video>
        ) : (
          /* No-preview placeholder — branded dark panel */
          <div
            className="flex aspect-video w-full flex-col items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 20%, #000), color-mix(in srgb, var(--theme-secondary) 10%, #000))',
              color: 'var(--theme-on-primary)',
            }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full opacity-60"
              style={{ backgroundColor: 'color-mix(in srgb, var(--theme-on-primary) 15%, transparent)' }}
            >
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium opacity-80">{t("courses.noPreviewAvailable")}</span>
            <span className="text-xs opacity-50">{t("courses.selectLessonToView")}</span>
          </div>
        )}
        <div className="space-y-1 border-t border-theme bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted opacity-60">{currentSeasonTitle}</p>
          <h3 className="text-lg font-semibold text-foreground">{currentTitle}</h3>
          {currentLesson?.description ? (
            <p className="text-sm leading-relaxed text-muted">{currentLesson.description}</p>
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
                  className="rounded-xl border transition-all hover:shadow-md"
                  style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-border-color)', color: 'var(--theme-foreground)' }}
                >
                  <div className="flex items-start gap-3 border-b p-4" style={{ borderColor: 'var(--theme-border-color)' }}>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--theme-primary)] text-sm font-semibold text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30">
                      {seasonIndex + 1}
                    </span>
                    <div>
                      <p className="text-base font-semibold text-foreground">{season.title}</p>
                      {season.description ? (
                        <p className="text-xs text-muted opacity-70">{season.description}</p>
                      ) : null}
                      <p className="text-xs text-muted opacity-70">
                        {seasonLessons.length
                          ? `${seasonLessons.length} ${seasonLessons.length > 1 ? t("courses.lessons") : t("courses.lesson")}`
                          : t("courses.lessonsComingSoon")}
                      </p>
                    </div>
                  </div>

                  {seasonLessons.length ? (
                    <ul className="divide-y divide-theme">
                      {seasonLessons.map((lesson: LessonSummary, lessonIndex: number) => {
                        const isActive = currentLesson?.id === lesson.id;
                        const hasVideo = Boolean((lesson as any).Video?.publicUrl);
                        const lessonIsLive =
                          lesson.lesson_type === "LIVE" || Boolean(lesson.LiveSession);
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
                                  ? "bg-primary/10 text-foreground"
                                  : "hover:bg-[var(--theme-surface)]"
                              )}
                            >
                              <div className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-all",
                                isActive
                                  ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-on-primary)]"
                                  : "border-[var(--theme-border-color)]"
                              )}>
                                {lessonIndex + 1}
                              </div>
                              <div className="flex flex-1 flex-col gap-1">
                                <span className="text-sm font-semibold">{lesson.title}</span>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted opacity-70">
                                  {lesson.is_free ? (
                                    <span className="rounded-full bg-primary-subtle px-2 py-1 font-medium text-primary">
                                      {t("courses.preview")}
                                    </span>
                                  ) : null}
                                  {lessonIsLive ? (
                                    <span className="rounded-full bg-secondary-subtle px-2 py-1 font-medium text-secondary">
                                      {t("courses.liveSession")}
                                    </span>
                                  ) : null}
                                  {lesson.duration ? <span>{`${lesson.duration} ${t("courses.min")}`}</span> : null}
                                  {!lessonIsLive && !hasVideo ? (
                                    <span>{t("courses.noVideo")}</span>
                                  ) : null}
                                </div>
                                {lesson.description ? (
                                  <p className="text-xs leading-relaxed text-muted opacity-70">
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
          <p className="rounded-xl border border-theme bg-card p-4 text-muted">
            {t("courses.lessonsComingSoonCheckBack")}
          </p>
        )}
      </div>
    </div>
  );
};

