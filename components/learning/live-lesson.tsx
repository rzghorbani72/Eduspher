'use client';

import { Info } from 'lucide-react';
import { useMemo } from 'react';

import { LiveStage } from '@/components/learning/live-stage';
import { getLessonLiveSession } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/hooks';
import { resolveAssetUrl } from '@/lib/utils';
import { useApiQuery } from '@/hooks/use-api-query';
import { queryKeys } from '@/lib/query/keys';
import {
  buildCalendarUrl,
  formatLiveSchedule,
  resolveLiveSchedule,
} from '@/lib/learning/live-schedule';

/** The join link is time-gated server-side, so re-poll to catch it opening. */
const LIVE_SESSION_REFRESH_MS = 60_000;

interface LiveLessonProps {
  lessonId: string;
  lessonTitle: string;
  teacherName: string | null;
}

export function LiveLesson({ lessonId, lessonTitle, teacherName }: LiveLessonProps) {
  const { t, language } = useTranslation();
  const { data, error, isLoading } = useApiQuery({
    queryKey: queryKeys.liveLesson(lessonId),
    queryFn: (signal) => getLessonLiveSession(lessonId, { signal }),
    refetchInterval: LIVE_SESSION_REFRESH_MS,
  });

  const schedule = useMemo(() => (data ? resolveLiveSchedule(data) : null), [data]);

  if (isLoading) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-[10px] bg-[#0d0c0c] text-sm text-white/70">
        {t('common.loading')}
      </div>
    );
  }

  if (error || !data || !schedule) {
    return (
      <div className="border-theme bg-surface rounded-[10px] border border-dashed p-6 text-center">
        <p className="font-medium">{t('learning.liveUnavailable')}</p>
        <p className="text-muted mt-1 text-sm">{t('learning.liveUnavailableDescription')}</p>
      </div>
    );
  }

  // Students get our join route (staff still get the room URL directly).
  const joinUrl = resolveAssetUrl(data.join_url) ?? data.meeting_url ?? null;

  const scheduleLabel = formatLiveSchedule(
    schedule.startsAt,
    schedule.endsAt,
    data.timezone,
    language,
    t('learning.timeRangeTo'),
  );

  return (
    <div className="space-y-3">
      <LiveStage
        phase={schedule.phase}
        teacherName={teacherName}
        scheduleLabel={scheduleLabel}
        startsAtMs={schedule.startsAt?.getTime() ?? null}
        meetingUrl={joinUrl}
        embeddable={Boolean(data.embeddable)}
        playbackUrl={data.playback_url ?? null}
        calendarUrl={buildCalendarUrl(lessonTitle, schedule.startsAt, schedule.endsAt, joinUrl)}
      />

      {data.notes ? (
        <div className="border-theme bg-card rounded-[10px] border p-4">
          <p className="text-[11px] font-extrabold text-(--theme-primary-ink)">
            {t('learning.teacherNote')}
          </p>
          <p className="mt-1.5 text-[13px] leading-[1.95] whitespace-pre-wrap">{data.notes}</p>
        </div>
      ) : null}

      {schedule.phase === 'LIVE' ? (
        <div className="border-theme bg-card text-muted flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-[13px]">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{t('learning.liveJoinHint')}</span>
        </div>
      ) : null}
    </div>
  );
}
