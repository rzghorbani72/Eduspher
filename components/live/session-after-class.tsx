"use client";

import { FileText, Image as ImageIcon, StickyNote, Video } from "lucide-react";

import { VideoLesson } from "@/components/learning/video-lesson";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  MyTutoringGroupSession,
  SessionMaterial,
} from "@/lib/api/account-types";
import { useTranslation } from "@/lib/i18n/hooks";
import { sessionName } from "@/lib/live/session-state";
import { formatDate } from "@/lib/utils";

interface SessionAfterClassProps {
  session: MyTutoringGroupSession | null;
  sessions: MyTutoringGroupSession[];
  fallbackTitle: string;
  onSelect: (sessionId: string) => void;
}

const hasContent = (session: MyTutoringGroupSession) =>
  Boolean(session.notes || session.recording?.url || session.Materials?.length);

const isImage = (material: SessionMaterial) =>
  material.kind === "DOCUMENT" &&
  /\.(png|jpe?g|webp|gif)$/i.test(material.url ?? "");

/**
 * What one meeting left behind: the teacher's notes, the recording to watch
 * again, and the handouts shared afterwards. Whether a recording may be saved
 * is decided by the server, so the player is handed the answer.
 */
export function SessionAfterClass({
  session,
  sessions,
  fallbackTitle,
  onSelect,
}: SessionAfterClassProps) {
  const { t } = useTranslation();
  const others = sessions.filter(
    (row) => row.id !== session?.id && hasContent(row),
  );

  if (!session || !hasContent(session)) {
    return (
      <div className="space-y-4">
        <EmptyState compact title={t("live.noAfterClassForSession")} />
        <OtherSessions
          sessions={others}
          fallbackTitle={fallbackTitle}
          onSelect={onSelect}
        />
      </div>
    );
  }

  const materials = session.Materials ?? [];
  const videos = materials.filter((m) => m.kind === "VIDEO" && m.video_id);
  const images = materials.filter(isImage);
  const files = materials.filter((m) => m.kind === "DOCUMENT" && !isImage(m));
  const title = sessionName(session, fallbackTitle);

  return (
    <div className="space-y-6">
      {session.notes ? (
        <section className="space-y-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <StickyNote className="size-4 text-muted" aria-hidden="true" />
            {t("live.sessionNotes")}
          </h3>
          <p className="whitespace-pre-wrap rounded-xl border border-theme bg-surface p-4 text-sm">
            {session.notes}
          </p>
        </section>
      ) : null}

      {session.recording?.video_id ? (
        <section className="space-y-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Video className="size-4 text-muted" aria-hidden="true" />
            {t("live.recording")}
          </h3>
          <VideoLesson
            title={title}
            videoId={session.recording.video_id}
            downloadUrl={
              session.recording.can_download ? session.recording.url : null
            }
            canDownload={session.recording.can_download}
            initialPosition={0}
            onHeartbeat={() => undefined}
          />
        </section>
      ) : null}

      {videos.map((video) => (
        <section key={video.id} className="space-y-1">
          <p className="text-xs text-muted">{t("live.helperVideo")}</p>
          <VideoLesson
            title={video.title}
            videoId={video.video_id ?? ""}
            downloadUrl={video.can_download ? video.url : null}
            canDownload={video.can_download}
            initialPosition={0}
            onHeartbeat={() => undefined}
          />
        </section>
      ))}

      {images.length ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((image) => (
            <li key={image.id}>
              <a
                href={image.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-lg border border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url ?? ""}
                  alt={image.title}
                  className="aspect-video w-full object-cover"
                />
              </a>
            </li>
          ))}
        </ul>
      ) : null}

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
                  <span className="min-w-0 truncate">{material.title}</span>
                </a>
              </li>
            ) : null,
          )}
        </ul>
      ) : null}

      <OtherSessions
        sessions={others}
        fallbackTitle={fallbackTitle}
        onSelect={onSelect}
      />
    </div>
  );
}

function OtherSessions({
  sessions,
  fallbackTitle,
  onSelect,
}: Omit<SessionAfterClassProps, "session">) {
  const { t, language } = useTranslation();
  if (!sessions.length) return null;
  return (
    <div className="space-y-1 border-t border-(--theme-hairline) pt-4">
      <p className="text-xs text-muted">{t("live.otherSessionsWithContent")}</p>
      <ul className="flex flex-wrap gap-2">
        {sessions.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect(row.id)}
              className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium hover:text-(--theme-primary)"
            >
              {row.recording?.url ? (
                <Video className="size-3.5" aria-hidden="true" />
              ) : (
                <ImageIcon className="size-3.5" aria-hidden="true" />
              )}
              {sessionName(row, fallbackTitle)} ·{" "}
              {formatDate(row.starts_at, language)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
