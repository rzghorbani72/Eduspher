'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { parseMeetUrl } from '@/lib/live/parse-meet-url';
import { Radio } from 'lucide-react';

type MeetPhase = 'loading' | 'inCall' | 'left';

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
}: MentomaMeetEmbedProps) {
  const { t } = useTranslation();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const [phase, setPhase] = useState<MeetPhase>('loading');
  const [bootKey, setBootKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const parsed = parseMeetUrl(meetingUrl);
    if (!parsed || !hostRef.current) {
      setPhase('left');
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

        let closed = false;
        const onLeft = () => {
          if (closed) return;
          closed = true;
          try {
            api.dispose();
          } catch {
            // already disposed
          }
          apiRef.current = null;
          if (!cancelled) setPhase('left');
        };

        api.addListener('readyToClose', onLeft);
        api.addListener('videoConferenceLeft', onLeft);
      } catch {
        if (!cancelled) setPhase('left');
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

  return (
    <div className="border-theme relative overflow-hidden rounded-2xl border bg-black">
      {phase === 'left' ? (
        <div className="bg-card absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-(--theme-primary)/10 text-(--theme-primary)">
            <Radio className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold">{t('live.leftMeeting')}</h2>
            <p className="text-muted mt-1 text-sm">{t('live.leftMeetingHint')}</p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setPhase('loading');
              setBootKey((key) => key + 1);
            }}
          >
            {t('live.joinAgain')}
          </Button>
        </div>
      ) : null}
      <div
        ref={hostRef}
        className="aspect-video w-full"
        title={title}
        aria-hidden={phase === 'left'}
      />
    </div>
  );
}
