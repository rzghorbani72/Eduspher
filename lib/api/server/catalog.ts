import 'server-only';

import { cache } from 'react';
import { decodePathSegment } from '@/lib/content-paths';
import type { CertificateVerification } from '@/lib/api/account-types';
import type { PublicActiveDiscount } from '@/lib/discounts/format-active-discount';
import type {
  ArticleSummary,
  CategorySummary,
  CourseListPayload,
  CourseSummary,
  StoreDetail,
  StoreSummary,
  LessonSummary,
} from '@/lib/api/types';
import { PUBLIC_REVALIDATE_SECONDS, serverFetch, serverFetchRaw } from './core';

export async function getAcademiesPublic(params?: {
  search?: string;
  limit?: number;
  /** Only academies with a desktop showcase banner (landing samples). */
  hasBanner?: boolean;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.hasBanner) query.set('hasBanner', 'true');
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  const result = await serverFetch<StoreSummary[]>(`/academies/public${suffix}`, {
    includeAuth: false,
  });
  return result.data;
}

export async function getCategories(): Promise<CategorySummary[]> {
  try {
    const result = await serverFetch<CategorySummary[]>('/categories', {
      includeAuth: false,
    });
    if (!result || result.status !== 'ok' || !Array.isArray(result.data)) {
      return [];
    }
    return result.data;
  } catch {
    return [];
  }
}

/**
 * The blog of one academy, or of the platform when `academySlug` is omitted.
 * The scope must be explicit: the backend reads only this parameter, so a
 * missing tenant can never widen the query to every academy's posts.
 */
export async function getBlogArticles(academySlug?: string | null) {
  const result = await serverFetch<ArticleSummary[]>('/blog', {
    includeAuth: false,
    query: academySlug ? { academy_slug: academySlug } : undefined,
  });
  return result.data;
}

export async function getCourses(params?: {
  search?: string;
  title?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
  order_by?: string;
  published?: boolean;
  is_featured?: boolean;
  is_free?: boolean;
  category_id?: string;
  academy_id?: string;
}) {
  try {
    const result = await serverFetch<CourseListPayload>('/courses', {
      query: {
        ...params,
      },
    });
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      const fallback = await serverFetch<CourseListPayload>('/courses/public', {
        includeAuth: false,
        query: {
          ...params,
          published: true,
        },
      }).catch(() => null);
      return fallback?.data ?? null;
    }
    throw error;
  }
}

export async function getCourseById(id: string | number) {
  const key = encodeURIComponent(decodePathSegment(String(id)));
  try {
    const result = await serverFetch<CourseSummary>(`/courses/${key}`);
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      const fallback = await serverFetch<CourseSummary>(`/courses/public/${key}`, {
        includeAuth: false,
      }).catch(() => null);
      return fallback?.data ?? null;
    }
    throw error;
  }
}

/**
 * Storefront course page. Always reads the public endpoint so the payload shape
 * is the same for a guest and a signed-in student — the authed `/courses/:id`
 * is the panel's editor view and returns a different, narrower shape.
 */
export async function getPublicCourseDetail(
  id: string,
  options?: {
    /** Skip Next fetch cache — use before granting storefront access. */ fresh?: boolean;
  },
) {
  const result = await serverFetch<CourseSummary>(
    `/courses/public/${encodeURIComponent(decodePathSegment(id))}`,
    {
      includeAuth: false,
      revalidate: options?.fresh ? 0 : undefined,
    },
  ).catch(() => null);
  return result?.data ?? null;
}

/**
 * Public certificate check. Anyone holding the number — an employer, a parent —
 * can confirm it without an account, which is the only thing that makes a
 * certificate worth printing.
 */
export async function verifyCertificate(certificateNumber: string) {
  const result = await serverFetch<CertificateVerification>(
    `/certificates/verify/${encodeURIComponent(certificateNumber)}`,
    { includeAuth: false },
  ).catch(() => null);
  return result?.data ?? null;
}

/**
 * Free-preview lesson for the storefront. Readable without a session — the
 * backend serves it only when the lesson is a free, published lesson of a
 * published course, so nothing paid can leak through this call.
 */
export async function getPublicLesson(id: string) {
  const result = await serverFetch<LessonSummary>(`/lessons/public/${id}`, {
    includeAuth: false,
  }).catch(() => null);
  return result?.data ?? null;
}

export async function getBlogArticleBySlug(slug: string, academySlug?: string | null) {
  const result = await serverFetch<ArticleSummary>(`/blog/${encodeURIComponent(slug)}`, {
    includeAuth: false,
    query: academySlug ? { academy_slug: academySlug } : undefined,
  });
  return result.data;
}

export async function getCurrentAcademy() {
  try {
    const result = await serverFetch<StoreDetail>('/academies/current');
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

/**
 * The public academy list is read several times per render (layout, footer,
 * page). `cache` collapses those into one backend call per request, which also
 * keeps the render under the endpoint's rate limit.
 *
 * Returns `null` when the list could not be fetched, so callers can tell
 * "no such academy" apart from "backend unavailable".
 */
export const getPublicAcademies = cache(async (): Promise<StoreSummary[] | null> => {
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: StoreSummary[];
    }>('/academies/public', { includeAuth: false });
    return result.data ?? null;
  } catch {
    return null;
  }
});

/**
 * Public branding/identity for one academy. Asks the directory for this slug
 * only — the unfiltered list is capped, so scanning it would silently miss any
 * academy past the cap.
 */
export const getAcademyBySlug = cache(async (slug: string): Promise<StoreSummary | null> => {
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: StoreSummary[];
    }>(`/academies/public?slug=${encodeURIComponent(slug)}`, {
      includeAuth: false,
    });
    return result.data?.[0] ?? null;
  } catch {
    return null;
  }
});

export type AcademyEnrollmentStatus = {
  /** True while the academy is closed to NEW enrollments. */
  disabled: boolean;
  disabled_until: string | null;
  message: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  academy_name: string;
};

/**
 * Whether this academy still takes new students. Closed means the buy/enroll
 * buttons are refused — students who already paid keep their access.
 */
export async function getAcademyEnrollmentStatus(
  slug: string,
): Promise<AcademyEnrollmentStatus | null> {
  if (!slug) return null;
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: AcademyEnrollmentStatus;
    }>('/academies/public/site-status', {
      includeAuth: false,
      query: { slug },
    });
    return result.data ?? null;
  } catch {
    return null;
  }
}

export type { PublicActiveDiscount };

/** Live student coupon codes for the storefront promo strip. */
export async function getActiveStudentDiscounts(slug: string): Promise<PublicActiveDiscount[]> {
  if (!slug) return [];
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: PublicActiveDiscount[];
    }>('/discounts/public/active', {
      includeAuth: false,
      query: { slug },
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: ['active-discounts'],
    });
    return result.data ?? [];
  } catch {
    return [];
  }
}

export async function getCurrentUser() {
  try {
    const result = await serverFetchRaw<{
      status: string;
      data: {
        id: string;
        email: string | null;
        phone_number: string | null;
        display_name: string;
        avatar: { id: string; url: string } | null;
        has_password: boolean;
        last_login: Date | null;
        login_count: number;
        academyId: string;
        role: string;
        email_confirmed: boolean;
        phone_confirmed: boolean;
        isActive: boolean;
        isVerified: boolean;
        currentAcademy: {
          id: string;
          name: string;
          slug: string;
          domain: string | null;
          currency: string;
          currency_symbol: string;
        } | null;
        permissions: string[];
      };
    }>('/auth/me');
    return result.data;
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return null;
    }
    throw error;
  }
}
