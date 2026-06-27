"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play,
  Lock,
  HelpCircle,
  FileText,
  Video,
  Download,
  ChevronDown,
} from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { cn, toPersianDigits } from "@/lib/utils";
import {
  getDemoCurriculum,
  type CurriculumLesson,
  type LessonKind,
  type LessonBadge,
} from "@/components/courses/course-detail-demo";

interface CourseCurriculumProps {
  lessonCount: number;
  durationHours: number | null;
}

const KIND_ICON: Record<LessonKind, typeof Play> = {
  video: Play,
  quiz: HelpCircle,
  text: FileText,
  live: Video,
};

const BADGE: Record<LessonBadge, { key: string; cls: string; dot: string }> = {
  preview: {
    key: "courses.badgePreview",
    cls: "text-(--theme-primary) bg-[color-mix(in_srgb,var(--theme-primary)_12%,transparent)]",
    dot: "bg-(--theme-primary)",
  },
  locked: {
    key: "courses.badgeLocked",
    cls: "text-(--theme-muted) bg-(--theme-surface)",
    dot: "bg-(--theme-muted)",
  },
  live_now: {
    key: "courses.badgeLiveNow",
    cls: "text-[#ef4444] bg-[rgba(239,68,68,0.12)]",
    dot: "bg-[#ef4444]",
  },
  free: {
    key: "courses.badgeFree",
    cls: "text-[#16a34a] bg-[color-mix(in_srgb,#22c55e_15%,transparent)]",
    dot: "bg-[#16a34a]",
  },
  recorded: {
    key: "courses.badgeRecorded",
    cls: "text-(--theme-muted) bg-(--theme-surface)",
    dot: "bg-(--theme-muted)",
  },
};

const LessonRow = ({ lesson }: { lesson: CurriculumLesson }) => {
  const { t } = useTranslation();
  const KindIcon = KIND_ICON[lesson.kind];
  const liveNow = lesson.badge === "live_now";
  const badge = lesson.badge ? BADGE[lesson.badge] : null;
  const subtitle =
    lesson.meta ??
    (lesson.kind === "quiz"
      ? t("courses.kindQuiz")
      : lesson.kind === "text"
        ? t("courses.kindText")
        : t("courses.kindVideo"));

  return (
    <li className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-(--theme-surface)">
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
          liveNow
            ? "bg-[rgba(239,68,68,0.12)] text-[#ef4444]"
            : "bg-(--theme-surface) text-(--theme-muted)",
        )}
      >
        <KindIcon className="h-[18px] w-[18px]" />
      </span>

      <div className="min-w-0 flex-1 text-right">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {badge && (
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold",
                badge.cls,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", badge.dot)} />
              {t(badge.key)}
            </span>
          )}
          <span className="truncate text-sm font-bold text-(--theme-foreground)">
            {lesson.title}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-(--theme-muted)">{subtitle}</p>
      </div>

      <span className="cd-price shrink-0 text-xs text-(--theme-muted)">{lesson.duration}</span>

      <span className="flex w-[68px] shrink-0 justify-end">
        {lesson.action === "play" && (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[color-mix(in_srgb,var(--theme-primary)_12%,transparent)] text-(--theme-primary)">
            <Play className="h-4 w-4" />
          </span>
        )}
        {lesson.action === "lock" && <Lock className="h-4 w-4 text-(--theme-muted)" />}
        {lesson.action === "join" && (
          <span className="rounded-full bg-[#ef4444] px-3 py-1.5 text-xs font-bold text-white">
            {t("courses.actionJoin")}
          </span>
        )}
        {lesson.action === "remind" && (
          <span className="text-xs font-bold text-[#16a34a]">{t("courses.actionRemind")}</span>
        )}
        {lesson.action === "record" && (
          <span className="flex items-center gap-1 text-xs font-bold text-(--theme-primary)">
            <Download className="h-3.5 w-3.5" />
            {t("courses.actionRecording")}
          </span>
        )}
      </span>
    </li>
  );
};

export const CourseCurriculum = ({ lessonCount, durationHours }: CourseCurriculumProps) => {
  const { t, language } = useTranslation();
  const seasons = getDemoCurriculum(language);
  const [openSeasons, setOpenSeasons] = useState<number[]>(seasons.map((s) => s.id));

  const toggle = (id: number) =>
    setOpenSeasons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const summary = [
    `${toPersianDigits(seasons.length, language)} ${t("courses.sectionsLabel")}`,
    `${toPersianDigits(lessonCount, language)} ${t("courses.lesson")}`,
    durationHours
      ? `${toPersianDigits(durationHours, language)} ${t("courses.hours")}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-(--theme-foreground)">
            {t("courses.curriculumTitle")}
          </h2>
          <p className="mt-1 text-[13px] text-(--theme-muted)">{t("courses.curriculumSubtitle")}</p>
        </div>
        <span className="cd-price pt-1 text-sm font-semibold text-(--theme-muted)">{summary}</span>
      </div>

      <div className="space-y-4">
        {seasons.map((season, index) => {
          const isOpen = openSeasons.includes(season.id);
          return (
            <div key={season.id} className="cd-review-card overflow-hidden rounded-2xl border">
              <button
                type="button"
                onClick={() => toggle(season.id)}
                className="flex w-full items-center gap-3 p-4 text-right"
              >
                <span className="cd-price grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--theme-primary)_12%,transparent)] text-sm font-extrabold text-(--theme-primary)">
                  {toPersianDigits(index + 1, language)}
                </span>
                <span className="flex-1 text-base font-extrabold text-(--theme-foreground)">
                  {season.title}
                </span>
                <span className="cd-price text-xs text-(--theme-muted)">{season.summary}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-(--theme-muted) transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="divide-y divide-(--theme-border-color) border-t border-(--theme-border-color)"
                  >
                    {season.lessons.map((lesson) => (
                      <LessonRow key={lesson.id} lesson={lesson} />
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
