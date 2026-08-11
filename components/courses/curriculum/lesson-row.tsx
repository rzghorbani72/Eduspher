"use client";

import {
  ClipboardList,
  Download,
  FileText,
  Headphones,
  HelpCircle,
  Lock,
  Play,
  Radio,
  Timer,
} from "lucide-react";
import Link from "@/components/ui/link";

import { useTranslation } from "@/lib/i18n/hooks";
import { cn, toPersianDigits } from "@/lib/utils";
import type { LessonType } from "@/lib/api/types";
import type { CurriculumLessonView, LiveState } from "@/lib/courses/curriculum";
import { liveStateAt } from "@/lib/courses/curriculum";
import {
  formatLiveWindow,
  formatMinutes,
  formatUnlockRule,
} from "@/components/courses/curriculum/format";

const TYPE_ICON: Record<LessonType, typeof Play> = {
  VIDEO: Play,
  AUDIO: Headphones,
  TEXT: FileText,
  QUIZ: HelpCircle,
  ASSIGNMENT: ClipboardList,
  LIVE: Radio,
};

const TYPE_LABEL: Record<LessonType, string> = {
  VIDEO: "courses.kindVideo",
  AUDIO: "courses.kindAudio",
  TEXT: "courses.kindText",
  QUIZ: "courses.kindQuiz",
  ASSIGNMENT: "courses.kindAssignment",
  LIVE: "courses.kindLive",
};

const LIVE_BADGE: Record<LiveState, { key: string; cls: string; dot: string }> = {
  running: {
    key: "courses.badgeLiveNow",
    cls: "text-[#ef4444] bg-[rgba(239,68,68,0.12)]",
    dot: "bg-[#ef4444] animate-pulse",
  },
  upcoming: {
    key: "courses.badgeLiveUpcoming",
    cls: "text-[#16a34a] bg-[color-mix(in_srgb,#22c55e_15%,transparent)]",
    dot: "bg-[#16a34a]",
  },
  ended: {
    key: "courses.badgeRecorded",
    cls: "text-(--theme-muted) bg-(--theme-surface)",
    dot: "bg-(--theme-muted)",
  },
};

const Badge = ({
  cls,
  dot,
  children,
}: {
  cls: string;
  dot: string;
  children: React.ReactNode;
}) => (
  <span
    className={cn(
      "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold",
      cls,
    )}
  >
    <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
    {children}
  </span>
);

interface LessonRowProps {
  lesson: CurriculumLessonView;
  /** Injected so every row in a render agrees on "now". */
  now: number;
  /** Set only for free lessons — a real link, so it is crawlable and shareable. */
  previewHref?: string | null;
}

export function LessonRow({ lesson, now, previewHref }: LessonRowProps) {
  const { t, language } = useTranslation();
  const Icon = TYPE_ICON[lesson.type];
  const live = lesson.live ? liveStateAt(lesson.live, now) : null;
  const isRunning = live === "running";

  const meta: string[] = [t(TYPE_LABEL[lesson.type])];
  if (lesson.live) meta.push(formatLiveWindow(lesson.live, language, t));
  if (lesson.quiz) {
    meta.push(
      t("courses.quizMeta")
        .replace("{count}", toPersianDigits(lesson.quiz.questionCount, language))
        .replace("{score}", toPersianDigits(lesson.quiz.passingScore, language)),
    );
  }
  if (lesson.assignment) {
    meta.push(
      t("courses.assignmentMeta").replace(
        "{score}",
        toPersianDigits(lesson.assignment.maxScore, language),
      ),
    );
  }
  if (lesson.unlock) meta.push(formatUnlockRule(lesson.unlock, language, t));

  const duration = formatMinutes(lesson.durationMinutes, language, t);
  const canPreview = lesson.isPreview && Boolean(previewHref);

  return (
    <li
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-(--theme-surface)",
        isRunning && "bg-[rgba(239,68,68,0.04)]",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
          isRunning
            ? "bg-[rgba(239,68,68,0.12)] text-[#ef4444]"
            : "bg-(--theme-surface) text-(--theme-muted)",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-bold text-(--theme-foreground)">
            {lesson.title}
          </span>
          {lesson.isPreview && (
            <Badge
              cls="text-(--theme-primary) bg-[color-mix(in_srgb,var(--theme-primary)_12%,transparent)]"
              dot="bg-(--theme-primary)"
            >
              {t("courses.badgePreview")}
            </Badge>
          )}
          {live && (
            <Badge cls={LIVE_BADGE[live].cls} dot={LIVE_BADGE[live].dot}>
              {t(LIVE_BADGE[live].key)}
            </Badge>
          )}
          {lesson.unlock && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-(--theme-muted)">
              <Timer className="h-3 w-3" />
              {t("courses.badgeScheduled")}
            </span>
          )}
          {lesson.downloadable && (
            <Download className="h-3.5 w-3.5 shrink-0 text-(--theme-muted)" />
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-(--theme-muted)">
          {meta.join(" · ")}
        </p>
      </div>

      {duration && (
        <span className="cd-price shrink-0 text-xs text-(--theme-muted)">
          {duration}
        </span>
      )}

      <span className="flex w-9 shrink-0 justify-end">
        {canPreview && previewHref ? (
          <Link
            href={previewHref}
            aria-label={`${t("courses.badgePreview")}: ${lesson.title}`}
            className="grid h-8 w-8 place-items-center rounded-full bg-[color-mix(in_srgb,var(--theme-primary)_12%,transparent)] text-(--theme-primary) transition-transform hover:scale-110"
          >
            <Play className="h-4 w-4" />
          </Link>
        ) : (
          <Lock
            className="h-4 w-4 text-(--theme-muted)"
            aria-label={t("courses.badgeLocked")}
          />
        )}
      </span>
    </li>
  );
}
