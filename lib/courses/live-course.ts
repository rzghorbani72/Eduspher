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

export const groupAnchorId = (groupId: string): string => `class-${groupId}`;

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

/** A class still open to pick, or one the student already holds a seat in. */
export const isJoinablePublicGroup = (group: PublicJoinGroup): boolean =>
  Boolean(group.joined) || canBuyMoreSeats(group);

/** Meetings a seat buys: the planned count, else one per weekly slot per week. */
export const sessionsOfGroup = (group: {
  session_count: number | null;
  term_weeks: number;
  Slots: unknown[];
}): number => group.session_count ?? group.term_weeks * Math.max(group.Slots.length, 1);
