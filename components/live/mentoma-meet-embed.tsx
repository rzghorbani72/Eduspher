'use client';

import { Loader2, Radio } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { parseMeetUrl } from '@/lib/live/parse-meet-url';

type MeetPhase = 'loading' | 'inCall' | 'left' | 'error';

type JitsiApi = {
  dispose: () => void;
  addListener: (event: string, listener: () => void) => void;
};

type JitsiApiCtor = new (domain: string, options: Record<string, unknown>) => JitsiApi;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiApiCtor;
  }
}

const scriptPromises = new Map<string, Promise<JitsiApiCtor>>();

/** Let Prosody drop the previous participant before the same JWT rejoins. */
const REJOIN_SETTLE_MS = 400;

const loadExternalApi = (domain: string): Promise<JitsiApiCtor> => {
  const existing = scriptPromises.get(domain);
  if (existing) return existing;

  const promise = new Promise<JitsiApiCtor>((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve(window.JitsiMeetExternalAPI);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => {
      if (window.JitsiMeetExternalAPI) resolve(window.JitsiMeetExternalAPI);
      else reject(new Error('JitsiMeetExternalAPI missing after load'));
    };
    script.onerror = () => reject(new Error(`Failed to load https://${domain}/external_api.js`));
    document.body.appendChild(script);
  });

  scriptPromises.set(domain, promise);
  return promise;
};

interface MentomaMeetEmbedProps {
  /** Full Mentoma Meet URL (may include jwt + branding hash). */
  meetingUrl: string;
  /** Stable id so switching sessions disposes the previous room. */
  sessionKey: string;
  title: string;
  displayName?: string | null;
  subject?: string | null;
  /** Refresh a signed join link (fresh JWT) before rebooting the embed. */
  onBeforeRejoin?: () => void | Promise<void>;
}

/**
 * Mentoma Meet via Jitsi External API (not a bare iframe).
 * - dispose() on unmount / session change / page hide → no ghost duplicate users
 * - hangup → Mentoma "join again" lobby, never meet.mentoma.ir welcome search
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
  const [phase, setPhase] = useState<MeetPhase>('loading');
  const [bootKey, setBootKey] = useState(0);
  const [rejoining, setRejoining] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const parsed = parseMeetUrl(meetingUrl);
    if (!parsed || !hostRef.current) {
      setPhase('error');
      return;
    }

    const host = hostRef.current;
    host.replaceChildren();
    setPhase('loading');

    const start = async () => {
      try {
        const Api = await loadExternalApi(parsed.domain);
        if (cancelled || !hostRef.current) return;

        const roomSubject = subject?.trim() || title;
        const api = new Api(parsed.domain, {
          roomName: parsed.roomName,
          parentNode: host,
          width: '100%',
          height: '100%',
          jwt: parsed.jwt ?? undefined,
          userInfo: displayName?.trim()
            ? { displayName: displayName.trim() }
            : undefined,
          configOverwrite: {
            defaultLanguage: 'fa',
            subject: roomSubject,
            localSubject: roomSubject,
            prejoinConfig: { enabled: true },
            enableWelcomePage: false,
            enableClosePage: false,
            disableDeepLinking: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            APP_NAME: 'منتوما',
            NATIVE_APP_NAME: roomSubject,
            PROVIDER_NAME: 'منتوما',
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_POWERED_BY: false,
            DEFAULT_LOGO_URL: 'https://mentoma.ir/meet-branding/logo-mark.svg',
            DEFAULT_WELCOME_PAGE_LOGO_URL: 'https://mentoma.ir/meet-branding/logo-type.svg',
          },
        });

        apiRef.current = api;
        setPhase('inCall');

        // Only readyToClose = intentional hangup. videoConferenceLeft also fires
        // while disposing/rebooting and was bouncing rejoin straight back to "left".
        let closed = false;
        const onHangup = () => {
          if (closed || cancelled) return;
          closed = true;
          try {
            api.dispose();
          } catch {
            // already disposed
          }
          apiRef.current = null;
          setPhase('left');
        };
        api.addListener('readyToClose', onHangup);
      } catch {
        if (!cancelled) setPhase('error');
      }
    };

    void start();

    const leaveNow = () => {
      try {
        apiRef.current?.dispose();
      } catch {
        // ignore
      }
      apiRef.current = null;
    };
    window.addEventListener('pagehide', leaveNow);
    window.addEventListener('beforeunload', leaveNow);

    return () => {
      cancelled = true;
      window.removeEventListener('pagehide', leaveNow);
      window.removeEventListener('beforeunload', leaveNow);
      leaveNow();
      host.replaceChildren();
    };
  }, [meetingUrl, sessionKey, bootKey, title, displayName, subject]);

  const joinAgain = async () => {
    if (rejoining) return;
    setRejoining(true);
    setPhase('loading');
    toast.info(t('live.rejoining'), { toastId: 'meet-rejoining', autoClose: 2000 });
    try {
      await onBeforeRejoin?.();
      await new Promise((resolve) => setTimeout(resolve, REJOIN_SETTLE_MS));
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
        aria-hidden={showLobby || phase === 'loading'}
      />
    </div>
  );
}
