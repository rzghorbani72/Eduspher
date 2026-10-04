import 'server-only';

import { serverFetchRaw } from './core';
import type { PublicOfferingType } from './tutoring';

export async function getAcademyPlansPublic(kind?: 'SUBSCRIPTION' | 'PACKAGE') {
  const result = await serverFetchRaw<{
    status: string;
    data: Array<{
      id: string;
      kind: 'SUBSCRIPTION' | 'PACKAGE';
      name: string;
      description: string | null;
      price: number;
      currency: string;
      duration_days: number | null;
      AcademyPlanCourse: Array<{ Course: { id: string; title: string } }>;
    }>;
  }>(`/academy-plans/public${kind ? `?kind=${kind}` : ''}`, {
    method: 'GET',
  });
  return result.data ?? [];
}

/**
 * Bundles authored in the panel are `Offer` rows spanning several courses,
 * which is a different model from an AcademyPlan PACKAGE. The storefront shows
 * both, so it reads both.
 */
export interface PublicBundleOffer {
  id: string;
  type: PublicOfferingType;
  title: string | null;
  slug: string | null;
  description: string | null;
  price: number;
  /** Struck-through "before" figure; null when the bundle is not discounted. */
  compare_at_price: number | null;
  currency: string;
  access_duration_days: number | null;
  /** Ordered by `sort_order` server-side — a bundle is taught in this sequence. */
  Courses: Array<{
    sort_order: number;
    Course: {
      id: string;
      title: string;
      slug: string;
      short_description: string | null;
      duration: number | null;
      lessons_count: number;
    };
  }>;
}

export async function getAcademyBundlesPublic(): Promise<PublicBundleOffer[]> {
  const result = await serverFetchRaw<PublicBundleOffer[]>('/offers/public/bundles', {
    method: 'GET',
  }).catch(() => []);
  return Array.isArray(result) ? result : [];
}

/** One bundle by slug, for its own learning-path page. Null when not found. */
export async function getAcademyBundlePublic(slug: string): Promise<PublicBundleOffer | null> {
  const result = await serverFetchRaw<PublicBundleOffer>(
    `/offers/public/bundles/${encodeURIComponent(slug)}`,
    { method: 'GET' },
  ).catch(() => null);
  return result && typeof result === 'object' && 'id' in result ? result : null;
}

export interface PublicPaymentPlan {
  id: string;
  name: string;
  total_amount: number;
  installment_count: number;
  installment_amount: number;
  interval_days: number;
}

/**
 * Installments are behind a deployment flag; when it is off the endpoint is
 * unavailable and the storefront simply offers no installment option.
 */
export async function getCoursePaymentPlans(courseId: string): Promise<PublicPaymentPlan[]> {
  const result = await serverFetchRaw<PublicPaymentPlan[]>(
    `/payment-plans/courses/${encodeURIComponent(courseId)}`,
    { method: 'GET' },
  ).catch(() => []);
  return Array.isArray(result) ? result : [];
}

export interface PublicTutoringOffer {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number | null;
  sessions_included: number | null;
  Tutor: { id: string; display_name: string | null } | null;
  /** True when the signed-in student already tutors under this offer. */
  owned?: boolean;
}

export async function getTutoringOffersPublic(courseId: string): Promise<PublicTutoringOffer[]> {
  const result = await serverFetchRaw<{
    status: string;
    data: PublicTutoringOffer[];
  }>(`/tutoring/offers/public?course_id=${encodeURIComponent(courseId)}`, {
    method: 'GET',
  });
  return result.data ?? [];
}

export interface PublicTutoringGroupSlot {
  weekday: number;
  start_minute: number;
  duration_minutes: number;
  lesson_id: string | null;
  Lesson: { id: string; title: string } | null;
}
