"use client";

import { Download, Menu } from "lucide-react";

import { MetaDot } from "@/components/learning/meta-dot";
import { useTranslation } from "@/lib/i18n/hooks";
import { toPersianDigits } from "@/lib/utils";

interface LessonHeaderProps {
  lessonTitle: string;
  /** The season this lesson sits in; omitted when the course has no sections. */
  seasonTitle: string | null;
  /** 1-based position of this lesson, and how many there are. */
  position: number;
  total: number;
  curriculumOpen: boolean;
  onToggleCurriculum: () => void;
  /** Set only when the server allows this student to save the video. */
  downloadUrl?: string | null;
}

export function LessonHeader({
  lessonTitle,
  seasonTitle,
  position,
  total,
  curriculumOpen,
  onToggleCurriculum,
  downloadUrl,
}: LessonHeaderProps) {
  const { t, language } = useTranslation();

  return (
    <header className="flex items-start justify-between gap-8 border-b border-theme pb-[18px] pt-[22px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center text-xs text-muted">
          {total > 0 ? (
            <span className="font-bold text-(--theme-primary-ink)">
              {t("learning.lessonPosition")
                .replace("{index}", toPersianDigits(position, language))
                .replace("{total}", toPersianDigits(total, language))}
            </span>
          ) : null}
          {seasonTitle ? (
            <>
              <MetaDot />
              <span>
                {t("learning.inSection").replace("{section}", seasonTitle)}
              </span>
            </>
          ) : null}
        </div>
        <h1 className="mt-1.5 text-2xl font-extrabold leading-[1.4] tracking-tight sm:text-[30px]">
          {lessonTitle}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        {downloadUrl ? (
          <a
            href={downloadUrl}
            className="hidden items-center gap-2 rounded-lg border border-theme bg-card px-3.5 py-2.5 text-[13px] font-bold transition-colors hover:bg-surface sm:inline-flex"
          >
            <Download className="size-4" aria-hidden="true" />
            {t("learning.downloadVideo")}
          </a>
        ) : null}

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-theme bg-card px-3.5 py-2.5 text-[13px] font-bold transition-colors hover:bg-surface lg:hidden"
          aria-expanded={curriculumOpen}
          onClick={onToggleCurriculum}
        >
          <Menu className="size-4" aria-hidden="true" />
          {t("learning.curriculum")}
        </button>
      </div>
    </header>
  );
}
