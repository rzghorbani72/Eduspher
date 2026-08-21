import Link from "@/components/ui/link";
import { ArrowRight } from "lucide-react";

import { SafeHtml } from "@/components/safe-html";
import { Button } from "@/components/ui/button";
import type { LessonSummary } from "@/lib/api/types";
import { resolveAssetUrl } from "@/lib/utils";

interface FreeLessonViewLabels {
  badge: string;
  notice: string;
  back: string;
  cta: string;
  videoUnsupported: string;
  unavailable: string;
}

interface FreeLessonViewProps {
  lesson: LessonSummary;
  courseTitle: string;
  coursePath: string;
  labels: FreeLessonViewLabels;
}

/**
 * Read-only view of a free lesson for visitors who have not bought the course.
 * Server-rendered on purpose: this page is a sales asset and must be crawlable.
 */
export function FreeLessonView({
  lesson,
  courseTitle,
  coursePath,
  labels,
}: FreeLessonViewProps) {
  const videoUrl = resolveAssetUrl(lesson.Video?.publicUrl);
  const audioUrl = resolveAssetUrl(lesson.Audio?.publicUrl);
  const documentUrl = lesson.allow_download_free
    ? resolveAssetUrl(lesson.Document?.publicUrl)
    : null;
  const body = lesson.content ?? lesson.description ?? "";
  const hasMedia = Boolean(videoUrl || audioUrl || body || documentUrl);

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div>
        <Link
          href={coursePath}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {courseTitle}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {lesson.title}
          </h1>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
            {labels.badge}
          </span>
        </div>
      </div>

      {videoUrl ? (
        <video
          src={videoUrl}
          controls
          controlsList={lesson.allow_download_free ? undefined : "nodownload"}
          playsInline
          preload="metadata"
          poster={resolveAssetUrl(lesson.Image?.publicUrl) ?? undefined}
          aria-label={lesson.title}
          className="aspect-video w-full rounded-2xl bg-black shadow-sm"
        >
          {labels.videoUnsupported}
        </video>
      ) : null}

      {audioUrl ? (
        <audio src={audioUrl} controls className="w-full" aria-label={lesson.title} />
      ) : null}

      {body ? (
        <SafeHtml
          html={body}
          className="prose max-w-none rounded-2xl border border-border bg-card p-5 text-foreground shadow-sm dark:prose-invert sm:p-8"
        />
      ) : null}

      {documentUrl ? (
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {lesson.Document?.title ?? lesson.title}
        </a>
      ) : null}

      {!hasMedia ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          {labels.unavailable}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">{labels.notice}</p>
        <Button asChild>
          <Link href={coursePath}>
            {labels.cta}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
