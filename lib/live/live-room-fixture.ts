import type { TutoringGroupRoom } from '@/lib/api/account-types';

/** Deterministic classroom payload for Playwright live reliability specs. */
export const buildLiveRoomFixture = (opts?: {
  linkOpen?: boolean;
  meetingUrl?: string | null;
  pastSessionId?: string;
}): TutoringGroupRoom => {
  const now = Date.now();
  const linkOpen = opts?.linkOpen ?? true;
  const meetingUrl =
    opts?.meetingUrl === undefined
      ? 'https://meet.mentoma.ir/e2e-live-room?jwt=e2e.fixture.token'
      : opts.meetingUrl;

  const liveSession = {
    id: 'session-live',
    starts_at: new Date(now - 10 * 60_000).toISOString(),
    ends_at: new Date(now + 50 * 60_000).toISOString(),
    status: 'SCHEDULED',
    title: 'E2E live session',
    notes: null,
    link_open: linkOpen,
    meeting_url: linkOpen ? meetingUrl : null,
    Topic: null,
    Lesson: null,
    recording: null,
    Materials: [],
  };

  const pastSession = {
    id: opts?.pastSessionId ?? 'session-past',
    starts_at: new Date(now - 8 * 24 * 60 * 60_000).toISOString(),
    ends_at: new Date(now - 8 * 24 * 60 * 60_000 + 60 * 60_000).toISOString(),
    status: 'COMPLETED',
    title: 'E2E past session',
    notes: null,
    link_open: false,
    meeting_url: null,
    Topic: null,
    Lesson: null,
    recording: null,
    Materials: [],
  };

  return {
    id: 'group-e2e',
    title: 'E2E Live Course',
    description: null,
    timezone: 'Asia/Tehran',
    capacity: 12,
    seats_taken: 3,
    seats_left: 9,
    min_students: 1,
    status: 'RUNNING',
    starts_on: null,
    ends_on: null,
    course_id: 'course-e2e',
    Slots: [],
    Tutor: { id: 'tutor-e2e', display_name: 'E2E Tutor' },
    meeting_url: linkOpen ? meetingUrl : null,
    invite_code: null,
    is_tutor: false,
    membership: { id: 'membership-e2e', status: 'ACTIVE', seats_claimed: 1 },
    next_session: liveSession,
    sessions: [pastSession, liveSession],
    planned_sessions: [],
    topics: [],
    assignments: [],
    link_open: linkOpen,
    group_thread_parent: 'group-e2e',
    private_thread_parent: 'membership-e2e',
  };
};
