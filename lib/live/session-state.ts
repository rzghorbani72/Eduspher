import type { MyTutoringGroupSession } from '@/lib/api/account-types';
import { formatDate } from '@/lib/utils';

export type SessionState = 'cancelled' | 'held' | 'live' | 'upcoming';

type TimedSession = Pick<MyTutoringGroupSession, 'status' | 'starts_at' | 'ends_at' | 'link_open'>;

/**
 * One reading of a meeting's state for the whole classroom, so the sidebar,
 * the stage and the tabs never disagree about what "now" means.
 *
 * The classroom page is always open to a member. Jitsi join is "live" only
 * while the server says the teacher's session window is open (`link_open`).
 * Clock-only guesses must not offer a join button outside that window.
 */
export function sessionState(session: TimedSession, now: number): SessionState {
  if (session.status === 'CANCELLED' || session.status === 'RESCHEDULED') {
    return 'cancelled';
  }
  if (session.status === 'COMPLETED') return 'held';
  if (session.link_open) return 'live';

  const start = new Date(session.starts_at).getTime();
  const end = session.ends_at ? new Date(session.ends_at).getTime() : null;
  if (end !== null && now > end) return 'held';
  if (Number.isNaN(start) || now < start) return 'upcoming';
  if (end !== null && now <= end) return 'upcoming';
  return 'held';
}

/** The session that belongs in the play box: on now, else the nearest next one. */
export function pickPlaySession<T extends TimedSession>(sessions: T[], now: number): T | null {
  const live = sessions.find((session) => sessionState(session, now) === 'live');
  if (live) return live;
  const upcoming = sessions
    .filter((session) => sessionState(session, now) === 'upcoming')
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  return upcoming[0] ?? null;
}

export function formatSessionWhen(
  session: Pick<MyTutoringGroupSession, 'starts_at' | 'ends_at'>,
  language: string,
): string {
  const locale = language === 'fa' ? 'fa-IR' : language;
  const day = formatDate(session.starts_at, language);
  const clock = new Intl.DateTimeFormat(locale, {
    timeStyle: 'short',
    hourCycle: 'h23',
  });
  const start = clock.format(new Date(session.starts_at));
  if (!session.ends_at) return `${day} · ${start}`;
  return `${day} · ${start} – ${clock.format(new Date(session.ends_at))}`;
}

export const sessionName = (
  session: Pick<MyTutoringGroupSession, 'title' | 'Topic'>,
  fallback: string,
): string => session.title ?? session.Topic?.title ?? fallback;
