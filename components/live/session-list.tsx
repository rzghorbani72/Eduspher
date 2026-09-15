'use client';

import { CheckCircle2, Circle, Radio, Video, XCircle } from 'lucide-react';

import type { MyTutoringGroupSession } from '@/lib/api/account-types';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNow } from '@/lib/hooks/use-now';
import { sessionName, sessionState } from '@/lib/live/session-state';
import { cn, formatDate, formatNumber } from '@/lib/utils';

interface SessionListProps {
  sessions: MyTutoringGroupSession[];
  selectedId: string | null;
  onSelect: (sessionId: string) => void;
  /** Show the state as text too (the full-width "sessions" tab). */
  detailed?: boolean;
}

/**
 * The timetable, read the way a curriculum sidebar reads: what each meeting
 * covers, which one is on now, and which have already happened.
 */
export function SessionList({
  sessions,
  selectedId,
  onSelect,
  detailed = false,
}: SessionListProps) {
  const { t, language } = useTranslation();
  const now = useNow();

  const stateLabel = {
    cancelled: t('live.sessionCancelled'),
    held: t('live.statusHeld'),
    live: t('live.liveNow'),
    upcoming: t('live.statusUpcoming'),
  };

  if (!sessions.length) {
    return <p className="text-muted px-3 py-4 text-sm">{t('live.noSessionsYet')}</p>;
  }

  return (
    <ol className="space-y-1">
      {sessions.map((session, index) => {
        const state = sessionState(session, now);
        const selected = session.id === selectedId;
        return (
          <li key={session.id}>
            <button
              type="button"
              onClick={() => onSelect(session.id)}
              aria-current={selected ? 'true' : undefined}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-start transition-colors',
                selected ? 'bg-(--theme-primary)/10' : 'hover:bg-surface',
                state === 'cancelled' && 'opacity-60',
              )}
            >
              <span className="text-muted mt-0.5 shrink-0">
                {state === 'cancelled' ? (
                  <XCircle className="size-4" aria-hidden="true" />
                ) : state === 'held' ? (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                ) : state === 'live' ? (
                  <Radio
                    className="size-4 animate-pulse text-(--theme-primary)"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle className="size-4" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="min-w-0 truncate text-sm font-medium">
                    {sessionName(
                      session,
                      `${t('live.session')} ${formatNumber(index + 1, language)}`,
                    )}
                  </span>
                  {state === 'live' ? (
                    <span className="rounded-full bg-(--theme-primary) px-1.5 py-0.5 text-[10px] font-bold text-(--theme-on-primary)">
                      {t('live.liveNow')}
                    </span>
                  ) : null}
                  {session.recording?.url ? (
                    <Video
                      className="text-muted size-3.5 shrink-0"
                      aria-label={t('live.hasRecording')}
                    />
                  ) : null}
                </span>
                <span className="text-muted mt-0.5 block text-xs">
                  {formatDate(session.starts_at, language)}
                  {detailed || state === 'cancelled' ? ` · ${stateLabel[state]}` : ''}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
