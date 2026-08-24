"use client";

import { Video } from "lucide-react";

import { VideoLesson } from "@/components/learning/video-lesson";
import { EmptyState } from "@/components/ui/empty-state";
import type { MyTutoringGroupSession } from "@/lib/api/account-types";
import { useTranslation } from "@/lib/i18n/hooks";
import { formatDate } from "@/lib/utils";

interface SessionRecordingsProps {
  sessions: MyTutoringGroupSession[];
  fallbackTitle: string;
}

/**
 * The meetings a student can watch again. Whether a recording may be saved is
 * decided by the server, so the player is handed the answer rather than
 * guessing it.
 */
export function SessionRecordings({
  sessions,
  fallbackTitle,
}: SessionRecordingsProps) {
  const { t, language } = useTranslation();
  const recorded = sessions.filter((session) => session.recording?.url);

  if (!recorded.length) {
    return <EmptyState compact title={t("live.noRecordings")} />;
  }

  return (
    <div className="space-y-6">
      {recorded.map((session) => {
        const recording = session.recording;
        if (!recording) return null;
        const title = session.title ?? session.Topic?.title ?? fallbackTitle;
        return (
          <section key={session.id} className="space-y-2">
            <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <Video className="size-4 text-muted" aria-hidden="true" />
              {title}
              <span className="text-xs font-normal text-muted">
                {formatDate(session.starts_at, language)}
              </span>
            </h3>
            <VideoLesson
              title={title}
              source={recording.url}
              downloadUrl={recording.can_download ? recording.url : null}
              canDownload={recording.can_download}
              initialPosition={0}
              onHeartbeat={() => undefined}
            />
          </section>
        );
      })}
    </div>
  );
}
