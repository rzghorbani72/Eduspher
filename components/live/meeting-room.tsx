'use client';

import { ExternalLink, Radio, RefreshCw, Video, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';

import { MentomaMeetEmbed } from '@/components/live/mentoma-meet-embed';
import { useAcademyContext } from '@/components/providers/store-provider';
import { Button } from '@/components/ui/button';
import type { MyTutoringGroupSession } from '@/lib/api/account-types';
import { useNow } from '@/lib/hooks/use-now';
import { useTranslation } from '@/lib/i18n/hooks';
import { isEmbeddable, withMeetAppName } from '@/lib/live/embeddable';
import { formatSessionWhen, sessionState } from '@/lib/live/session-state';

/** The link is time-gated on the server, so re-poll to catch it opening. */
const REFRESH_MS = 60_000;

interface MeetingRoomProps {
  session: MyTutoringGroupSession | null;
  title: string;
  onGoAfterClass: () => void;
  /** Teacher/observer: the server opens their link earlier than the student window. */
  staffJoin?: boolean;
  displayName?: string | null;
}

/**
 * Where the class actually happens, for the meeting the student picked. It
 * takes the place the recorded course page gives its video player. The join
 * link is decided on the server, so "check again" is a server round trip.
 */
export function MeetingRoom({
  session,
  title,
  onGoAfterClass,
  staffJoin = false,
  displayName = null,
}: MeetingRoomProps) {
  const { t, language } = useTranslation();
  const { name: academyName } = useAcademyContext();
  const router = useRouter();
  const now = useNow();
  const [isRefreshing, startRefresh] = useTransition();
  const refresh = () => startRefresh(() => router.refresh());

  const state = session ? sessionState(session, now) : 'upcoming';
  const meetingUrl = session?.meeting_url
    ? withMeetAppName(session.meeting_url, academyName, language)
    : null;
  const windowClosed = Boolean(
    session?.link_closes_at && now >= new Date(session.link_closes_at).getTime(),
  );
  // Unmounting the embed hangs up, so a class never outlives its window.
  const canJoinVideo = Boolean(meetingUrl && !windowClosed && (state === 'live' || staffJoin));
  const waiting = !canJoinVideo && (state === 'upcoming' || state === 'live');
  const subject =
    language === 'fa' && academyName.trim() ? `${academyName.trim()} جلسه` : 'جلسه منتوما';

  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waiting]);

  if (canJoinVideo && meetingUrl && isEmbeddable(meetingUrl)) {
    return (
      <MentomaMeetEmbed
        key={session?.id ?? 'meet'}
        meetingUrl={meetingUrl}
        sessionKey={session?.id ?? meetingUrl}
        title={title}
        subject={subject}
        displayName={displayName}
        onBeforeRejoin={async () => {
          // The JWT lasts the whole class window; a soft refresh avoids remount races.
          startRefresh(() => router.refresh());
        }}
      />
    );
  }

  const Icon = state === 'live' ? Radio : state === 'cancelled' ? XCircle : Video;

  return (
    <div
      className="border-theme bg-card rounded-2xl border p-6 text-center sm:p-10"
      data-live-state={state}
      data-can-join={canJoinVideo ? 'true' : 'false'}
    >
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-(--theme-primary)/10 text-(--theme-primary)">
        <Icon className={state === 'live' ? 'size-6 animate-pulse' : 'size-6'} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      {session ? (
        <p className="text-muted mt-1 text-sm">{formatSessionWhen(session, language)}</p>
      ) : null}

      {canJoinVideo && meetingUrl ? (
        <Button asChild className="mt-5">
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="live-join-external"
          >
            {t('live.joinClass')}
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </Button>
      ) : state === 'live' ? (
        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isRefreshing}
            data-testid="live-check-link"
          >
            <RefreshCw
              className={isRefreshing ? 'size-4 animate-spin' : 'size-4'}
              aria-hidden="true"
            />
            {t('live.checkLinkAgain')}
          </Button>
        </div>
      ) : state === 'held' ? (
        <div className="mt-5 space-y-3">
          <p className="text-muted text-sm">
            {t('live.sessionOver')} {t('live.sessionOverHint')}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onGoAfterClass}>
            {t('live.goAfterClass')}
          </Button>
        </div>
      ) : state === 'cancelled' ? (
        <p className="text-muted mt-5 text-sm">{t('live.sessionCancelledHint')}</p>
      ) : (
        <div className="mt-5 space-y-3">
          <p className="text-muted text-sm">{t('live.videoOnlyInSession')}</p>
          <p className="text-muted text-sm">
            {session
              ? t('live.nextSessionWhen').replace('{when}', formatSessionWhen(session, language))
              : t('live.noSessionsYet')}
          </p>
          {session ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={isRefreshing ? 'size-4 animate-spin' : 'size-4'}
                aria-hidden="true"
              />
              {t('live.checkLinkAgain')}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
