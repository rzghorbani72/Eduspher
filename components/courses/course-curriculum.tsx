"use client";

import { useMemo, useState } from "react";

import type { LessonSummary, SeasonSummary } from "@/lib/api/types";
import { cn, resolveAssetUrl } from "@/lib/utils";

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
    (season.lessons ?? []).map((lesson) => ({
      ...lesson,
      seasonId: season.id,
      seasonTitle: season.title,
    }))
  );

export const CourseCurriculum = ({ courseTitle, seasons }: CourseCurriculumProps) => {
  const lessons = useMemo(() => buildLessons(seasons), [seasons]);

  const initialLesson = useMemo(() => {
    return lessons.find((lesson) => lesson.is_free && lesson.video?.url)
      ?? lessons.find((lesson) => lesson.video?.url)
      ?? lessons[0]
      ?? null;
  }, [lessons]);

  const [currentLesson, setCurrentLesson] = useState<LessonWithSeason | null>(initialLesson);

  const currentVideoUrl = currentLesson?.video?.url ? resolveAssetUrl(currentLesson.video.url) : null;
  const currentSeasonTitle = currentLesson?.seasonTitle ?? (seasons[0]?.title ?? "Course preview");
  const currentTitle = currentLesson?.title ?? courseTitle;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-lg dark:border-slate-800">
        {currentVideoUrl ? (
          <video key={currentVideoUrl} src={currentVideoUrl} controls className="aspect-video w-full bg-black">
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-slate-900 text-slate-200">
            <span className="text-sm font-medium">No preview available</span>
            <span className="text-xs text-slate-400">Select a lesson to view its content</span>
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
              const seasonLessons = (season.lessons ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

              return (
                <div
                  key={season.id}
                  className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-start gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-sm font-semibold text-white">
                      {seasonIndex + 1}
                    </span>
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{season.title}</p>
                      {season.description ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{season.description}</p>
                      ) : null}
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {seasonLessons.length
                          ? `${seasonLessons.length} lesson${seasonLessons.length > 1 ? "s" : ""}`
                          : "Lessons coming soon."}
                      </p>
                    </div>
                  </div>

                  {seasonLessons.length ? (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                      {seasonLessons.map((lesson, lessonIndex) => {
                        const isActive = currentLesson?.id === lesson.id;
                        const hasVideo = Boolean(lesson.video?.url);
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
                                "flex w-full items-start gap-3 px-4 py-3 text-left transition",
                                isActive
                                  ? "bg-sky-50 text-slate-900 dark:bg-sky-500/10 dark:text-slate-100"
                                  : "bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                              )}
                            >
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold dark:border-slate-700">
                                {lessonIndex + 1}
                              </div>
                              <div className="flex flex-1 flex-col gap-1">
                                <span className="text-sm font-semibold">{lesson.title}</span>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                  {lesson.is_free ? (
                                    <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                                      Preview
                                    </span>
                                  ) : null}
                                  {lesson.duration ? <span>{`${lesson.duration} min`}</span> : null}
                                  {!hasVideo ? <span>No video</span> : null}
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
          <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            Lessons coming soon. Check back for new modules.
          </p>
        )}
      </div>
    </div>
  );
};

