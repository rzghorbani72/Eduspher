"use client";

import { CalendarClock, ExternalLink, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getLessonLiveSession } from "@/lib/api/client";
import { useTranslation } from "@/lib/i18n/hooks";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryKeys } from "@/lib/query/keys";

/** The join link is time-gated server-side, so re-poll to catch it opening. */
const LIVE_SESSION_REFRESH_MS = 60_000;

interface LiveLessonProps {
  lessonId: string;
}

export function LiveLesson({ lessonId }: LiveLessonProps) {
  const { t, language } = useTranslation();
  const { data, error, isLoading } = useApiQuery({
    queryKey: queryKeys.liveLesson(lessonId),
    queryFn: (signal) => getLessonLiveSession(lessonId, { signal }),
    refetchInterval: LIVE_SESSION_REFRESH_MS,
  });

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
        <p className="font-medium">{t("learning.liveUnavailable")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("learning.liveUnavailableDescription")}
        </p>
      </div>
    );
  }

  const startsAt = new Date(data.starts_at);
  const date = Number.isNaN(startsAt.getTime())
    ? data.starts_at
    : new Intl.DateTimeFormat(language, {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: data.timezone || undefined,
      }).format(startsAt);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Video className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{t("learning.liveClass")}</h2>
          <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
            <CalendarClock
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{date}</span>
          </p>
          {data.notes ? (
            <p className="mt-3 whitespace-pre-wrap text-sm">{data.notes}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            {data.meeting_url ? (
              <Button asChild>
                <a
                  href={data.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("learning.joinClass")}
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("learning.joinLinkUnavailable")}
              </p>
            )}
            {data.playback_url ? (
              <Button asChild variant="outline">
                <a
                  href={data.playback_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("courses.livePlayback")}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
