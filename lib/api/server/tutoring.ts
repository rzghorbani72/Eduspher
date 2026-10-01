import 'server-only';

import { headers as nextHeaders } from 'next/headers';
import { resolvePublicOriginFromHeaders } from '@/lib/public-request-origin';
import type { CourseTopic } from '@/lib/api/account-types';
import { serverFetchRaw } from './core';
import type { PublicTutoringGroupSlot } from './pricing';

export interface PublicTutoringGroup {
  id: string;
  title: string;
  description: string | null;
  timezone: string;
  capacity: number;
  seats_taken: number;
  seats_left: number;
  min_students: number;
  age_min: number | null;
  age_max: number | null;
  status: 'WAITING' | 'CONFIRMED' | 'RUNNING';
  starts_on: string | null;
  ends_on: string | null;
  term_weeks: number;
  session_count: number | null;
  join_deadline: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  course_id: string;
  /** Per-seat price of this class; null = the course's per-seat offer price. */
  seat_price: number | null;
  /** May one buyer take every seat (a private booking of the class)? */
  whole_class_booking: boolean;
  Slots: PublicTutoringGroupSlot[];
  Tutor: { id: string; display_name: string | null } | null;
  Offer: { id: string; price: number; currency: string } | null;
  /** True when the signed-in student already holds a seat in this class. */
  joined?: boolean;
  /** True when a teacher-scheduled meeting is in the join window right now. */
  session_live?: boolean;
  /** Upcoming meetings, dates only — no join link. */
  sessions?: readonly { starts_at: string; ends_at: string }[];
  /** Meetings already over — how far along a running class is. */
  sessions_held?: number;
}

/** Syllabus of a live course — what the meetings will cover. */
export async function getCourseTopicsPublic(courseId: string): Promise<CourseTopic[]> {
  const result = await serverFetchRaw<{ status: string; data: CourseTopic[] }>(
    `/courses/${encodeURIComponent(courseId)}/topics`,
    { method: 'GET' },
  );
  return result.data ?? [];
}

/** Scheduled group classes of a course that anyone may join. */
export async function getTutoringGroupsPublic(courseId: string): Promise<PublicTutoringGroup[]> {
  const load = (includeAuth: boolean) =>
    serverFetchRaw<{
      status: string;
      data: PublicTutoringGroup[];
    }>(`/tutoring/groups/public?course_id=${encodeURIComponent(courseId)}`, {
      method: 'GET',
      includeAuth,
    });

  try {
    const authed = await load(true);
    return authed.data ?? [];
  } catch {
    try {
      const anonymous = await load(false);
      return anonymous.data ?? [];
    } catch {
      return [];
    }
  }
}

/** A private class opened by its share code, so friends can book it together. */
export type TutoringGroupByCodeResult =
  | { status: 'ok'; group: PublicTutoringGroup }
  | { status: 'not_found' }
  | { status: 'course_unpublished' }
  | { status: 'class_unpublished' };

const joinInviteBlockReason = (error: unknown): 'course' | 'class' | null => {
  if (!error || typeof error !== 'object') return null;
  const enriched = error as { status?: number; code?: string };
  if (enriched.code === 'CLASS_NOT_PUBLISHED') return 'class';
  if (enriched.code === 'COURSE_NOT_PUBLISHED') return 'course';
  if (enriched.status !== 400) return null;
  const message = error instanceof Error ? error.message : '';
  if (/CLASS_NOT_PUBLISHED|کلاس هنوز برای ثبت‌نام باز نشده/i.test(message)) return 'class';
  if (/COURSE_NOT_PUBLISHED|not published|منتشر نشده/i.test(message)) return 'course';
  return 'course';
};

export async function getTutoringGroupByCode(code: string): Promise<TutoringGroupByCodeResult> {
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: PublicTutoringGroup;
    }>(`/tutoring/groups/by-code/${encodeURIComponent(code)}`, {
      method: 'GET',
      revalidate: 0,
    });
    return result.data ? { status: 'ok', group: result.data } : { status: 'not_found' };
  } catch (error) {
    const blockReason = joinInviteBlockReason(error);
    if (blockReason === 'class') {
      return { status: 'class_unpublished' };
    }
    return { status: 'course_unpublished' };
  }
}

export type PublicOfferingType = 'FREE' | 'ONE_TIME' | 'SUBSCRIPTION' | 'PRIVATE' | 'PAYMENT_PLAN';

export interface PublicCourseOffering {
  id: string;
  course_id: string;
  type: PublicOfferingType;
  title: string | null;
  description: string | null;
  price: number;
  /** Price before discount, shown struck through. Null = no discount shown. */
  compare_at_price: number | null;
  currency: string;
  access_duration_days: number | null;
  /** False sells the recorded course only — no live class link. */
  includes_live: boolean;
  is_active: boolean;
  payment_plan_id: string | null;
  /** Set when this offer mirrors the course's own price (the default offer). */
  source_course_id: string | null;
  /** True when the signed-in student already paid for this selling way. */
  owned?: boolean;
  /** End of the term this way granted; null means it does not expire. */
  access_expires_at?: string | null;
}

type OfferRow = Omit<PublicCourseOffering, 'course_id'> & {
  Courses?: Array<{ Course: { id: string } }>;
};

/**
 * Storefront: what a student can actually buy for this course. `Offer` is the
 * single source of price and access term — the course's own price is published
 * as its DEFAULT offer. The endpoint returns the array directly (no envelope).
 */
export interface PaymentSummary {
  id: string;
  amount: number;
  status: string;
  provider: string | null;
  /** Bank reference written at verify time — the number support can trace. */
  gateway_id: string | null;
  paid_at: string | null;
  created_at: string;
  Course: { id: string; title: string } | null;
}

/**
 * The paid receipt line the return-from-bank pages show. Ownership is enforced
 * by the backend, so a payment id in the URL can only ever load the buyer's own.
 */
export async function getPaymentSummary(paymentId: string): Promise<PaymentSummary | null> {
  try {
    const result = await serverFetchRaw<{
      status?: string;
      data?: PaymentSummary;
    }>(`/payments/${encodeURIComponent(paymentId)}`, { method: 'GET' });
    return result.data ?? null;
  } catch {
    return null;
  }
}

export async function getCourseOfferingsPublic(courseId: string): Promise<PublicCourseOffering[]> {
  const result = await serverFetchRaw<OfferRow[]>(
    `/offers/course/${encodeURIComponent(courseId)}`,
    { method: 'GET' },
  ).catch(() => []);
  if (!Array.isArray(result)) return [];
  // An offer can span several courses (a bundle); flatten it onto the one asked for.
  return result.map((offer) => ({
    ...offer,
    course_id: offer.Courses?.[0]?.Course?.id ?? courseId,
  }));
}

export async function initiateAcademyPlanPayment(data: {
  academy_plan_id: string;
  amount: number;
  coupon_code?: string;
  mobile?: string;
}) {
  const headerStore = await nextHeaders();
  const fallbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const baseUrl = resolvePublicOriginFromHeaders(headerStore, fallbackBaseUrl);

  const result = await serverFetchRaw<{
    status: string;
    data: { payment_id: string; amount: number; redirect_url: string };
  }>('/payments/checkout', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      callback_url: `${baseUrl}/payment/callback`,
    }),
  });

  return result.data;
}

export async function createEnrollment(data: {
  course_id: string;
  user_id: string;
  profile_id: string;
  payment_id?: string;
  status?: string;
  progress_percent?: number;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: string;
        course_id: string;
        user_id: string;
        profile_id: string;
        status: string;
        enrolled_at: string;
        progress_percent: number;
        payment_id?: string | null;
      };
    }>('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      throw new Error('Unauthorized. Please log in to continue.');
    }
    throw error;
  }
}
