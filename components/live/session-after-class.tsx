'use client';

import { FileText, Image as ImageIcon, StickyNote, Video } from 'lucide-react';

import { VideoLesson } from '@/components/learning/video-lesson';
import { LessonQuiz } from '@/components/quiz/lesson-quiz';
import { EmptyState } from '@/components/ui/empty-state';
import type { MyTutoringGroupSession, SessionMaterial } from '@/lib/api/account-types';
import { usePlatformFeatures } from '@/components/providers/platform-features-provider';
import { useTranslation } from '@/lib/i18n/hooks';
import { sessionName } from '@/lib/live/session-state';
import { formatDate } from '@/lib/utils';

interface SessionAfterClassProps {
  session: MyTutoringGroupSession | null;
  sessions: MyTutoringGroupSession[];
  fallbackTitle: string;
  onSelect: (sessionId: string) => void;
}

/** A meeting's quiz opens when the meeting starts, and only once it is published. */
const hasOpenQuiz = (session: MyTutoringGroupSession, quizzesEnabled: boolean) =>
  quizzesEnabled &&
  Boolean(session.Quiz?.is_published) &&
  new Date(session.starts_at).getTime() <= Date.now();

const hasContent = (session: MyTutoringGroupSession, quizzesEnabled: boolean) =>
  Boolean(
    session.notes ||
    session.recording?.url ||
    session.Materials?.length ||
    hasOpenQuiz(session, quizzesEnabled),
  );

const isImage = (material: SessionMaterial) =>
  material.kind === 'DOCUMENT' && /\.(png|jpe?g|webp|gif)$/i.test(material.url ?? '');

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
  const { quizzes_enabled } = usePlatformFeatures();
  const others = sessions.filter(
    (row) => row.id !== session?.id && hasContent(row, quizzes_enabled),
  );

  if (!session || !hasContent(session, quizzes_enabled)) {
    return (
      <div className="space-y-4">
        <EmptyState compact title={t('live.noAfterClassForSession')} />
        <OtherSessions sessions={others} fallbackTitle={fallbackTitle} onSelect={onSelect} />
      </div>
    );
  }

  const materials = session.Materials ?? [];
  const videos = materials.filter((m) => m.kind === 'VIDEO' && m.video_id);
  const images = materials.filter(isImage);
  const files = materials.filter((m) => m.kind === 'DOCUMENT' && !isImage(m));
  const title = sessionName(session, fallbackTitle);

  return (
    <div className="space-y-6">
      {hasOpenQuiz(session, quizzes_enabled) ? (
        <LessonQuiz parent={{ kind: 'session', id: session.id }} />
      ) : null}

      {session.notes ? (
        <section className="space-y-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <StickyNote className="text-muted size-4" aria-hidden="true" />
            {t('live.sessionNotes')}
          </h3>
          <p className="border-theme bg-surface rounded-xl border p-4 text-sm whitespace-pre-wrap">
            {session.notes}
          </p>
        </section>
      ) : null}

      {session.recording?.video_id ? (
        <section className="space-y-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Video className="text-muted size-4" aria-hidden="true" />
            {t('live.recording')}
          </h3>
          <VideoLesson
            title={title}
            videoId={session.recording.video_id}
            downloadUrl={session.recording.can_download ? session.recording.url : null}
            canDownload={session.recording.can_download}
            initialPosition={0}
            onHeartbeat={() => undefined}
          />
        </section>
      ) : null}

      {videos.map((video) => (
        <section key={video.id} className="space-y-1">
          <p className="text-muted text-xs">{t('live.helperVideo')}</p>
          <VideoLesson
            title={video.title}
            videoId={video.video_id ?? ''}
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
                href={image.url ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="border-line block overflow-hidden rounded-lg border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url ?? ''}
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
          <li className="text-muted text-xs">{t('live.materials')}</li>
          {files.map((material) =>
            material.url ? (
              <li key={material.id}>
                <a
                  href={material.url}
                  target="_blank"
                  rel="noreferrer"
                  className="border-line hover:bg-surface flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <FileText className="text-muted size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 truncate">{material.title}</span>
                </a>
              </li>
            ) : null,
          )}
        </ul>
      ) : null}

      <OtherSessions sessions={others} fallbackTitle={fallbackTitle} onSelect={onSelect} />
    </div>
  );
}

function OtherSessions({
  sessions,
  fallbackTitle,
  onSelect,
}: Omit<SessionAfterClassProps, 'session'>) {
  const { t, language } = useTranslation();
  if (!sessions.length) return null;
  return (
    <div className="space-y-1 border-t border-(--theme-hairline) pt-4">
      <p className="text-muted text-xs">{t('live.otherSessionsWithContent')}</p>
      <ul className="flex flex-wrap gap-2">
        {sessions.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect(row.id)}
              className="bg-surface flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium hover:text-(--theme-primary)"
            >
              {row.recording?.url ? (
                <Video className="size-3.5" aria-hidden="true" />
              ) : (
                <ImageIcon className="size-3.5" aria-hidden="true" />
              )}
              {sessionName(row, fallbackTitle)} · {formatDate(row.starts_at, language)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
