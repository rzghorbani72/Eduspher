"use client";

import { ArrowLeft, Menu } from "lucide-react";

import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/hooks";
import { buildAcademyPath, toPersianDigits } from "@/lib/utils";

interface LessonHeaderProps {
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  storeSlug: string | null;
  /** 1-based position of this lesson, and how many there are. */
  position: number;
  total: number;
  curriculumOpen: boolean;
  onToggleCurriculum: () => void;
}

export function LessonHeader({
  courseId,
  courseTitle,
  lessonTitle,
  storeSlug,
  position,
  total,
  curriculumOpen,
  onToggleCurriculum,
}: LessonHeaderProps) {
  const { t, language } = useTranslation();

  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <Link
          href={buildAcademyPath(storeSlug, `/courses/${courseId}`)}
          className="inline-flex max-w-full items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
          <span className="truncate">{courseTitle}</span>
        </Link>
        <h1 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
          {lessonTitle}
        </h1>
        {total > 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {t("learning.lessonPosition")
              .replace("{index}", toPersianDigits(position, language))
              .replace("{total}", toPersianDigits(total, language))}
          </p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="lg:hidden"
        aria-expanded={curriculumOpen}
        onClick={onToggleCurriculum}
      >
        <Menu className="size-4" aria-hidden="true" />
        {t("learning.curriculum")}
      </Button>
    </header>
  );
}
