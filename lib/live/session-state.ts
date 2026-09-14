import type { MyTutoringGroupSession } from '@/lib/api/account-types';

export type SessionState = 'cancelled' | 'held' | 'live' | 'upcoming';

/**
 * One reading of a meeting's state for the whole classroom, so the sidebar,
 * the stage and the tabs never disagree about what "now" means.
 */
export function sessionState(
  session: Pick<MyTutoringGroupSession, 'status' | 'starts_at' | 'ends_at' | 'link_open'>,
  now: number,
): SessionState {
  if (session.status === 'CANCELLED' || session.status === 'RESCHEDULED') {
    return 'cancelled';
  }
  const start = new Date(session.starts_at).getTime();
  const end = new Date(session.ends_at ?? session.starts_at).getTime();
  if (session.status === 'COMPLETED' || (end < now && !session.link_open)) {
    return 'held';
  }
  if (session.link_open || (start <= now && now <= end)) return 'live';
  return 'upcoming';
}

export const sessionName = (
  session: Pick<MyTutoringGroupSession, 'title' | 'Topic'>,
  fallback: string,
): string => session.title ?? session.Topic?.title ?? fallback;
