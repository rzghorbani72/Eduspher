'use client';

import { ExternalLink, Radio, RefreshCw, Video, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';

import { MentomaMeetEmbed } from '@/components/live/mentoma-meet-embed';
import { Button } from '@/components/ui/button';
import type { MyTutoringGroupSession } from '@/lib/api/account-types';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNow } from '@/lib/hooks/use-now';
import { isEmbeddable, withMeetAppName } from '@/lib/live/embeddable';
import { formatSessionWhen, sessionState } from '@/lib/live/session-state';
import { useAcademyContext } from '@/components/providers/store-provider';

/** The link is time-gated on the server, so re-poll to catch it opening. */
const REFRESH_MS = 60_000;

interface MeetingRoomProps {
  session: MyTutoringGroupSession | null;
  title: string;
  onGoAfterClass: () => void;
}

/**
 * Where the class actually happens, for the meeting the student picked. It
 * takes the place the recorded course page gives its video player. The join
 * link is decided on the server, so "check again" is a server round trip.
 */
export function MeetingRoom({ session, title, onGoAfterClass }: MeetingRoomProps) {
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
  const waiting = !meetingUrl && (state === 'upcoming' || state === 'live');
  const subject =
    language === 'fa' && academyName.trim()
      ? `${academyName.trim()} جلسه`
      : 'جلسه منتوما';

  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waiting]);

  if (meetingUrl && state === 'live' && isEmbeddable(meetingUrl)) {
    return (
      <MentomaMeetEmbed
        key={session?.id ?? meetingUrl}
        meetingUrl={meetingUrl}
        sessionKey={session?.id ?? meetingUrl}
        title={title}
        subject={subject}
      />
    );
  }

  const Icon = state === 'live' ? Radio : state === 'cancelled' ? XCircle : Video;

  return (
    <div className="border-theme bg-card rounded-2xl border p-6 text-center sm:p-10">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-(--theme-primary)/10 text-(--theme-primary)">
        <Icon className={state === 'live' ? 'size-6 animate-pulse' : 'size-6'} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      {session ? (
        <p className="text-muted mt-1 text-sm">{formatSessionWhen(session, language)}</p>
      ) : null}

      {state === 'live' && meetingUrl ? (
        <Button asChild className="mt-5">
          <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
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
