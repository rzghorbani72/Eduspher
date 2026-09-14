'use client';

import { CalendarPlus, ExternalLink, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { formatClock } from '@/components/media/video-controls';
import { useTranslation } from '@/lib/i18n/hooks';
import { initialsOf, type LivePhase } from '@/lib/learning/live-schedule';

interface LiveStageProps {
  phase: LivePhase;
  teacherName: string | null;
  /** Already formatted for the viewer's locale and the class timezone. */
  scheduleLabel: string;
  /** When the class starts, in epoch ms; the clock counts to or from it. */
  startsAtMs: number | null;
  meetingUrl: string | null;
  /** Whether the room behind meetingUrl can be shown in an iframe. */
  embeddable?: boolean;
  playbackUrl: string | null;
  calendarUrl: string | null;
}

const STAGE =
  'relative flex aspect-video w-full flex-col justify-center gap-4 overflow-hidden rounded-[10px] px-8 text-[#f3f2f2] sm:px-[52px]';
const PILL =
  'absolute end-[18px] top-[18px] flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold';

/** The live class's own stage: it stands where the video player stands. */
export function LiveStage({
  phase,
  teacherName,
  scheduleLabel,
  startsAtMs,
  meetingUrl,
  embeddable,
  playbackUrl,
  calendarUrl,
}: LiveStageProps) {
  const { t, language } = useTranslation();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (phase === 'ENDED') return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Read from wall time against a fixed start rather than counted up in state,
  // so the display stays right across a re-render, a refetch or a sleeping tab.
  const distance = startsAtMs === null ? 0 : Math.round((now - startsAtMs) / 1000);
  const tick = phase === 'BEFORE' ? -distance : distance;

  const teacher = teacherName ? (
    <div className="flex items-center gap-4">
      <span
        className={`grid shrink-0 place-items-center rounded-full bg-[#3a2320] font-extrabold text-[#ff9783] ${
          phase === 'LIVE' ? 'size-[66px] text-[17px]' : 'size-[50px] text-sm'
        }`}
        aria-hidden="true"
      >
        {initialsOf(teacherName)}
      </span>
      <div className="min-w-0">
        <p className={`font-black ${phase === 'LIVE' ? 'text-[23px]' : 'text-lg'}`}>
          {teacherName}
        </p>
        <p className="mt-1 text-[13px] text-white/60">{scheduleLabel}</p>
      </div>
    </div>
  ) : (
    <p className="text-[13px] text-white/60">{scheduleLabel}</p>
  );

  if (phase === 'ENDED') {
    return (
      <div className={`${STAGE} bg-[#0d0c0c]`}>
        <span className={`${PILL} bg-white/10 text-white/75`}>{t('learning.liveEnded')}</span>
        <h2 className="text-[26px] font-black">{t('learning.liveEndedTitle')}</h2>
        <p className="text-[13px] text-white/60">{scheduleLabel}</p>
        {playbackUrl ? (
          <a
            href={playbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2.5 rounded-[10px] bg-(--theme-primary) px-[22px] py-3.5 text-[15px] font-black text-white"
          >
            <PlayCircle className="size-5" aria-hidden="true" />
            {t('learning.watchRecording')}
          </a>
        ) : (
          <p className="max-w-[42ch] text-[13px] leading-[1.95] text-white/60">
            {t('learning.recordingPending')}
          </p>
        )}
      </div>
    );
  }

  const isLive = phase === 'LIVE';

  if (isLive && meetingUrl && embeddable) {
    return (
      <div className="border-theme overflow-hidden rounded-[10px] border bg-black">
        <iframe
          src={meetingUrl}
          title={scheduleLabel}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="aspect-video w-full"
        />
      </div>
    );
  }

  return (
    <div className={`${STAGE} bg-[radial-gradient(120%_100%_at_80%_0%,#2a1512_0%,#0d0c0c_60%)]`}>
      {isLive ? (
        <span className={`${PILL} bg-(--theme-primary) text-white`}>
          <span className="size-2 rounded-full bg-white" aria-hidden="true" />
          <span className="tracking-[0.06em]">{t('learning.liveNow')}</span>
          <span className="opacity-85">{formatClock(tick, language)}</span>
        </span>
      ) : (
        <span className={`${PILL} bg-white/10 text-white`}>
          <span className="size-2 rounded-full bg-white/60" aria-hidden="true" />
          {t('learning.liveNotStarted')}
        </span>
      )}

      {teacher}

      {isLive ? null : (
        <div>
          <p className="text-[11px] text-white/50">{t('learning.timeUntilStart')}</p>
          <p className="mt-1 text-[38px] leading-none font-black">
            {formatClock(Math.max(tick, 0), language)}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {meetingUrl ? (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-[10px] bg-(--theme-primary) px-7 py-4 text-[17px] font-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
          >
            {t('learning.joinClass')}
            <ExternalLink className="size-5" aria-hidden="true" />
          </a>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center gap-2.5 rounded-[10px] bg-white/10 px-[22px] py-3.5 text-[15px] font-black text-white/45">
            {t('learning.joinClass')}
          </span>
        )}

        {!isLive && calendarUrl ? (
          <a
            href={calendarUrl}
            download="class.ics"
            className="inline-flex items-center gap-2 rounded-[10px] border border-[#ff9783]/50 px-4 py-3 text-[13px] font-extrabold text-[#ff9783]"
          >
            {t('learning.addToCalendar')}
            <CalendarPlus className="size-4" aria-hidden="true" />
          </a>
        ) : null}

        {isLive ? (
          <p className="max-w-[42ch] text-[13px] leading-[1.95] text-white/70">
            {t('learning.joinOpensNewTab')}
          </p>
        ) : null}
      </div>

      {isLive ? null : (
        <p className="text-xs text-white/50">
          {meetingUrl ? t('learning.joinLinkReady') : t('learning.joinOpensBeforeStart')}
        </p>
      )}
    </div>
  );
}
