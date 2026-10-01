import 'server-only';

import { cache } from 'react';
import type { CourseSummary } from '@/lib/api/types';
import { isUnauthorizedError, serverFetch, serverFetchRaw } from './core';
import { qnaItemsFromPayload } from './site-theme';
import type { CourseQnA } from './site-theme';

export async function getCourseQnAs(courseId: number) {
  try {
    const result = await serverFetch<unknown>(`/courses/${courseId}/qna`, {
      includeAuth: true,
    });
    return qnaItemsFromPayload(result.data);
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return [];
    }
    throw error;
  }
}

export async function createCourseQnA(courseId: number, question: string) {
  const result = await serverFetchRaw<{
    message: string;
    status: string;
    data: CourseQnA;
  }>(`/courses/${courseId}/qna`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
  return result.data;
}

export async function validateDiscount(data: {
  code: string;
  amount: number;
  profile_id?: string;
  academy_id?: string;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        discount_amount: number;
        final_amount: number;
        discount_code_id: string;
      };
    }>('/discounts/validate', {
      method: 'POST',
      body: JSON.stringify(data),
      includeAuth: false,
    });
    return result.data;
  } catch (error) {
    throw error;
  }
}

// Cart API functions for hybrid approach
export async function getCart() {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: string;
        profile_id: string;
        items: Array<{
          id: string;
          cart_id: string;
          course_id: string;
          course: CourseSummary;
          created_at: string;
        }>;
        created_at: string;
        updated_at: string;
      };
    }>('/cart', {
      method: 'GET',
    });
    return result.data;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return null;
    }
    throw error;
  }
}

export async function syncCart(
  items: Array<{
    item_type: 'COURSE' | 'PRODUCT';
    course_id?: string;
    product_id?: string;
    course_title?: string;
    product_title?: string;
    course_price?: number;
    product_price?: number;
    course_cover?: string;
    product_cover?: string;
    added_at: string;
  }>,
) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: string;
        profile_id: string;
        items: Array<{
          id: string;
          cart_id: string;
          course_id: string;
          created_at: string;
        }>;
      };
      removedItems?: Array<{
        type: string;
        id: string;
        reason: string;
      }>;
    }>('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function addToCart(course_id: string) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: string;
        cart_id: string;
        course_id: string;
        created_at: string;
      };
    }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ course_id }),
    });
    return result.data;
  } catch (error) {
    throw error;
  }
}

export async function removeFromCart(cart_item_id: number) {
  try {
    await serverFetchRaw<{
      message: string;
      status: string;
    }>(`/cart/items/${cart_item_id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    throw error;
  }
}

export async function clearCart() {
  try {
    await serverFetchRaw<{
      message: string;
      status: string;
    }>('/cart', {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    throw error;
  }
}

export async function createBasket(data: {
  profile_id: string;
  course_ids: string[];
  voucher_code?: string;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id: string;
        profile_id: string;
        total_amount: number;
        discount_amount: number;
        final_amount: number;
        voucher_code?: string;
        items: Array<{
          course_id: string;
          course_price: number;
        }>;
        created_at: string;
      };
    }>('/baskets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data;
  } catch (error) {
    throw error;
  }
}

export type AcademyContactChannel =
  | 'phone'
  | 'email'
  | 'address'
  | 'website'
  | 'instagram'
  | 'telegram'
  | 'whatsapp'
  | 'linkedin'
  | 'youtube'
  | 'twitter'
  | 'aparat'
  | 'eitaa';

export type AcademyContactLink = {
  type: AcademyContactChannel;
  value: string;
  label: string | null;
};

export type AcademyStaticPage = {
  slug: 'about' | 'contact';
  title: string;
  body: string;
  is_published: boolean;
  updated_at: string | null;
};

export type AcademySiteContent = {
  academy_name: string;
  pages: AcademyStaticPage[];
  links: AcademyContactLink[];
};

/**
 * The manager-authored About/Contact content plus the academy's public contact
 * channels. Read by both static pages and the footer on the same render, so it
 * is cached per request.
 *
 * Returns `null` when the academy has no such content or the backend is
 * unreachable — the footer degrades to no social row, the pages to a 404.
 */
export const getAcademySiteContent = cache(
  async (slug: string): Promise<AcademySiteContent | null> => {
    if (!slug) return null;
    try {
      const result = await serverFetchRaw<{
        status: string;
        data: AcademySiteContent;
      }>(`/academy-site/public?slug=${encodeURIComponent(slug)}`, {
        includeAuth: false,
      });
      return result.data ?? null;
    } catch {
      return null;
    }
  },
);
