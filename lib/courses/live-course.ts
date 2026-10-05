import type { CourseSummary } from '@/lib/api/types';

type PricedCourse = Pick<CourseSummary, 'course_type' | 'TutoringOffer'>;

/** A live course is taught on a timetable; a recorded one is watched anytime. */
export const isLiveCourse = (course: PricedCourse): boolean => course.course_type === 'LIVE';

/**
 * What a live course actually costs to join: the cheapest seat in a group
 * class. Its own `price` column is unused, so reading that would show "free".
 */
export const seatPriceOf = (course: PricedCourse): number | null => {
  const prices = (course.TutoringOffer ?? [])
    .filter((offer) => offer.kind === 'GROUP')
    .map((offer) => offer.price)
    .filter((price) => price > 0);
  return prices.length ? Math.min(...prices) : null;
};

/** What one seat in this class costs: its own price, else the course's per-seat offer. */
export const seatPriceOfGroup = (group: {
  seat_price: number | null;
  Offer: { price: number } | null;
}): number => group.seat_price ?? group.Offer?.price ?? 0;

export const CLASS_REQUEST_ANCHOR_ID = 'request-class';
export const GROUP_CLASSES_ANCHOR_ID = 'group-classes';

export const groupAnchorId = (groupId: string): string => `class-${groupId}`;

/** Same-page link that starts enrolling in one class (see TutoringGroupsSection). */
export const enrollHref = (groupId: string): string =>
  `?class=${groupId}#${groupAnchorId(groupId)}`;

/** Classroom link for one class, so staff with several classes open the right one. */
export const liveRoomHref = (liveClassHref: string, groupId: string): string =>
  `${liveClassHref}?class=${encodeURIComponent(groupId)}`;

type PublicJoinGroup = {
  seats_left: number;
  joined?: boolean;
  status: string;
  join_deadline?: string | null;
};

const JOINABLE_STATUSES = new Set(['WAITING', 'CONFIRMED', 'RUNNING']);

/** Seats remain and the class is still taking buyers — including extra seats. */
export const canBuyMoreSeats = (group: PublicJoinGroup): boolean => {
  if (group.seats_left <= 0) return false;
  if (!JOINABLE_STATUSES.has(group.status)) return false;
  if (group.join_deadline && Date.parse(group.join_deadline) <= Date.now()) return false;
  return true;
};

export type ClosedReason = 'full' | 'deadline' | 'ended';

/** Why a class takes no new seats — null while it is still open. */
export const closedReasonOf = (group: PublicJoinGroup): ClosedReason | null => {
  if (canBuyMoreSeats(group)) return null;
  if (group.seats_left <= 0) return 'full';
  if (group.join_deadline && Date.parse(group.join_deadline) <= Date.now()) return 'deadline';
  return 'ended';
};

export const CLOSED_REASON_KEY: Record<ClosedReason, string> = {
  full: 'courses.groupFull',
  deadline: 'courses.groupClosedDeadline',
  ended: 'courses.groupClosedEnded',
};

/** A class still open to pick, or one the student already holds a seat in. */
export const isJoinablePublicGroup = (group: PublicJoinGroup): boolean =>
  Boolean(group.joined) || canBuyMoreSeats(group);

/** Class picked when the page opens: the one I hold, else the first open one, else the first. */
export const pickDefaultClass = <T extends PublicJoinGroup>(groups: readonly T[]): T | null =>
  groups.find((group) => group.joined) ?? groups.find(canBuyMoreSeats) ?? groups[0] ?? null;

/** Classroom page vs live video: the label follows whether a session is on now. */
export const liveEnterLabelKey = (
  sessionLive: boolean | undefined,
): 'courses.groupEnterSession' | 'courses.groupEnter' =>
  sessionLive ? 'courses.groupEnterSession' : 'courses.groupEnter';

/** Meetings a seat buys: the planned count, else one per weekly slot per week. */
export const sessionsOfGroup = (group: {
  session_count: number | null;
  term_weeks: number;
  Slots: unknown[];
}): number => group.session_count ?? group.term_weeks * Math.max(group.Slots.length, 1);

/** The course page opened on its teacher tab, where a class member chats with the tutor. */
export const TEACHER_TAB = 'instructor';
export const teacherChatHref = (courseHref: string): string => `${courseHref}?tab=${TEACHER_TAB}`;
