"use client";

import { ExternalLink, Radio, RefreshCw, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/hooks";
import { formatDate } from "@/lib/utils";
import { isEmbeddable } from "@/lib/live/embeddable";

/** The link is time-gated on the server, so re-poll to catch it opening. */
const REFRESH_MS = 60_000;

interface MeetingRoomProps {
  /** Null whenever the joining window is shut — never a stale link. */
  meetingUrl: string | null;
  startsAt: string | null;
  title: string;
  language: string;
}

/**
 * Where the class actually happens. It takes the place the recorded course page
 * gives its video player, so a live student lands somewhere familiar.
 */
export function MeetingRoom({
  meetingUrl,
  startsAt,
  title,
  language,
}: MeetingRoomProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [, setTick] = useState(0);

  // The link is decided on the server, so a refresh is a server round trip.
  const refresh = () => startRefresh(() => router.refresh());

  useEffect(() => {
    if (meetingUrl) return;
    const timer = setInterval(() => {
      setTick((n) => n + 1);
      refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingUrl]);

  if (meetingUrl && isEmbeddable(meetingUrl)) {
    return (
      <div className="overflow-hidden rounded-2xl border border-theme bg-black">
        <iframe
          src={meetingUrl}
          title={title}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="aspect-video w-full"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-theme bg-card p-6 text-center sm:p-10">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-(--theme-primary)/10 text-(--theme-primary)">
        {meetingUrl ? (
          <Radio className="size-6 animate-pulse" aria-hidden="true" />
        ) : (
          <Video className="size-6" aria-hidden="true" />
        )}
      </span>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      {startsAt ? (
        <p className="mt-1 text-sm text-muted">
          {formatDate(startsAt, language)}
        </p>
      ) : null}

      {meetingUrl ? (
        <Button asChild className="mt-5">
          <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
            {t("live.joinClass")}
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </Button>
      ) : (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-muted">{t("live.linkOpensSoon")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={isRefreshing ? "size-4 animate-spin" : "size-4"}
              aria-hidden="true"
            />
            {t("live.checkLinkAgain")}
          </Button>
        </div>
      )}
    </div>
  );
}
