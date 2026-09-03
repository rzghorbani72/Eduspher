"use client";

import { FileText, Video } from "lucide-react";

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
 * What each meeting left behind: the recording to watch again, and the handouts
 * the teacher shared afterwards. Whether a recording may be saved is decided by
 * the server, so the player is handed the answer rather than guessing it.
 */
export function SessionRecordings({
  sessions,
  fallbackTitle,
}: SessionRecordingsProps) {
  const { t, language } = useTranslation();
  const recorded = sessions.filter(
    (session) => session.recording?.url || session.Materials?.length,
  );

  if (!recorded.length) {
    return <EmptyState compact title={t("live.noRecordings")} />;
  }

  return (
    <div className="space-y-6">
      {recorded.map((session) => {
        const recording = session.recording;
        const materials = session.Materials ?? [];
        const helperVideos = materials.filter(
          (material) => material.kind === "VIDEO",
        );
        const files = materials.filter(
          (material) => material.kind === "DOCUMENT",
        );
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
            {recording?.video_id ? (
              <VideoLesson
                title={title}
                videoId={recording.video_id}
                downloadUrl={recording.can_download ? recording.url : null}
                canDownload={recording.can_download}
                initialPosition={0}
                onHeartbeat={() => undefined}
              />
            ) : null}
            {helperVideos.map((video) =>
              video.video_id ? (
                <div key={video.id} className="space-y-1">
                  <p className="text-xs text-muted">{t("live.helperVideo")}</p>
                  <VideoLesson
                    title={video.title}
                    videoId={video.video_id}
                    downloadUrl={video.can_download ? video.url : null}
                    canDownload={video.can_download}
                    initialPosition={0}
                    onHeartbeat={() => undefined}
                  />
                </div>
              ) : null,
            )}
            {files.length ? (
              <ul className="space-y-1">
                <li className="text-xs text-muted">{t("live.materials")}</li>
                {files.map((material) =>
                  material.url ? (
                    <li key={material.id}>
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm hover:bg-surface"
                      >
                        <FileText
                          className="size-4 shrink-0 text-muted"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 truncate">
                          {material.title}
                        </span>
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
