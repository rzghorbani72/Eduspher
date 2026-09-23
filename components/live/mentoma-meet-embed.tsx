'use client';

import { Loader2, Radio } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { buildJitsiOptions, loadExternalApi, type JitsiApi } from '@/lib/live/jitsi-external';
import { leaveJitsiConference, leaveJitsiSync } from '@/lib/live/leave-jitsi';
import {
  clearMeetLeft,
  markMeetLeft,
  REJOIN_SETTLE_MS,
  settleDelayMs,
  sleep,
} from '@/lib/live/meet-lifecycle';
import { parseMeetUrl } from '@/lib/live/parse-meet-url';

type MeetPhase = 'loading' | 'inCall' | 'left' | 'error';

interface MentomaMeetEmbedProps {
  /** Full Mentoma Meet URL (may include jwt + branding hash). */
  meetingUrl: string;
  /** Stable id so switching sessions disposes the previous room. */
  sessionKey: string;
  title: string;
  displayName?: string | null;
  subject?: string | null;
  /** Refresh a signed join link (fresh JWT) before rebooting the embed. */
  onBeforeRejoin?: () => void | Promise<void | string>;
}

/**
 * Mentoma Meet via Jitsi External API.
 * Hangup+dispose + settle lock reduce Prosody ghost duplicates after refresh.
 * JWT-only URL changes do not remount; hangup returns to Mentoma lobby.
 */
export function MentomaMeetEmbed({
  meetingUrl,
  sessionKey,
  title,
  displayName,
  subject,
  onBeforeRejoin,
}: MentomaMeetEmbedProps) {
  const { t } = useTranslation();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const meetingUrlRef = useRef(meetingUrl);
  meetingUrlRef.current = meetingUrl;
  const [phase, setPhase] = useState<MeetPhase>('loading');
  const [bootKey, setBootKey] = useState(0);
  const [rejoining, setRejoining] = useState(false);

  const roomName = parseMeetUrl(meetingUrl)?.roomName ?? '';

  useEffect(() => {
    let cancelled = false;
    const url = meetingUrlRef.current;
    const parsed = parseMeetUrl(url);
    if (!parsed || !hostRef.current) {
      setPhase('error');
      return;
    }

    const host = hostRef.current;
    host.replaceChildren();
    setPhase('loading');

    const tearDown = async () => {
      const api = apiRef.current;
      apiRef.current = null;
      markMeetLeft(sessionKey);
      if (api) await leaveJitsiConference(api);
      host.replaceChildren();
    };

    const start = async () => {
      try {
        const waitMs = settleDelayMs(sessionKey);
        if (waitMs > 0) await sleep(waitMs);
        if (cancelled) return;

        const Api = await loadExternalApi(parsed.domain);
        if (cancelled || !hostRef.current) return;

        clearMeetLeft(sessionKey);
        const roomSubject = subject?.trim() || title;
        const api = new Api(
          parsed.domain,
          buildJitsiOptions({
            roomName: parsed.roomName,
            parentNode: host,
            jwt: parseMeetUrl(meetingUrlRef.current)?.jwt ?? parsed.jwt,
            displayName,
            roomSubject,
          }),
        );

        if (cancelled) {
          leaveJitsiSync(api);
          return;
        }

        apiRef.current = api;
        setPhase('inCall');

        // Only readyToClose = intentional hangup. videoConferenceLeft also fires
        // while disposing/rebooting and was bouncing rejoin straight back to "left".
        let closed = false;
        const onHangup = () => {
          if (closed || cancelled) return;
          closed = true;
          markMeetLeft(sessionKey);
          leaveJitsiSync(api);
          if (apiRef.current === api) apiRef.current = null;
          setPhase('left');
        };
        api.addListener('readyToClose', onHangup);
      } catch {
        if (!cancelled) setPhase('error');
      }
    };

    void start();

    const leaveNow = () => {
      markMeetLeft(sessionKey);
      leaveJitsiSync(apiRef.current);
      apiRef.current = null;
    };
    window.addEventListener('pagehide', leaveNow);
    window.addEventListener('beforeunload', leaveNow);

    return () => {
      cancelled = true;
      window.removeEventListener('pagehide', leaveNow);
      window.removeEventListener('beforeunload', leaveNow);
      void tearDown();
    };
    // JWT-only meetingUrl changes must not remount — same room, same sessionKey.
  }, [sessionKey, roomName, bootKey, title, displayName, subject]);

  const joinAgain = async () => {
    if (rejoining) return;
    setRejoining(true);
    setPhase('loading');
    toast.info(t('live.rejoining'), { toastId: 'meet-rejoining', autoClose: 2000 });
    try {
      const nextUrl = await onBeforeRejoin?.();
      if (typeof nextUrl === 'string' && nextUrl.trim()) {
        meetingUrlRef.current = nextUrl.trim();
      }
      markMeetLeft(sessionKey);
      await sleep(REJOIN_SETTLE_MS);
      setBootKey((key) => key + 1);
    } catch {
      setPhase('error');
      toast.error(t('live.rejoinFailed'), { toastId: 'meet-rejoin-failed' });
    } finally {
      setRejoining(false);
    }
  };

  const showLobby = phase === 'left' || phase === 'error';

  return (
    <div className="border-theme relative overflow-hidden rounded-2xl border bg-black">
      {phase === 'loading' ? (
        <div className="bg-card/95 absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <Loader2 className="size-8 animate-spin text-(--theme-primary)" aria-hidden="true" />
          <p className="text-sm font-medium">{t('live.rejoining')}</p>
        </div>
      ) : null}

      {showLobby ? (
        <div className="bg-card absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-(--theme-primary)/10 text-(--theme-primary)">
            <Radio className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold">
              {phase === 'error' ? t('live.rejoinFailed') : t('live.leftMeeting')}
            </h2>
            <p className="text-muted mt-1 text-sm">
              {phase === 'error' ? t('live.rejoinFailedHint') : t('live.leftMeetingHint')}
            </p>
          </div>
          <Button type="button" loading={rejoining} onClick={() => void joinAgain()}>
            {t('live.joinAgain')}
          </Button>
        </div>
      ) : null}

      <div
        ref={hostRef}
        className="aspect-video w-full"
        title={title}
        data-meet-phase={phase}
        data-meet-session={sessionKey}
        aria-hidden={showLobby || phase === 'loading'}
      />
    </div>
  );
}
