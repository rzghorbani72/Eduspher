import 'server-only';

import { headers as nextHeaders } from 'next/headers';
import { resolvePublicOriginFromHeaders } from '@/lib/public-request-origin';
import type { UserProfilesResponse, EnrollmentSummary, Pagination } from '@/lib/api/types';
import { serverFetchRaw } from './core';

export async function getPublicPricingConfig() {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        title: string;
        subtitle: string;
        cta_label: string;
      };
    }>('/academies/public/pricing-config', {
      includeAuth: false,
    });

    return result.data;
  } catch {
    return null;
  }
}

export type PublicPlan = {
  slug: string;
  name: string;
  price_monthly_toman: number;
  price_yearly_toman: number | null;
  storage_gb: number;
  limits: {
    managers: number;
    teachers: number;
    courses: number;
    tutoring_students: number;
    storage_gb: number;
    /** Delivered media traffic allowed per calendar month, in GB. */
    monthly_traffic_gb: number;
  };
  features: string[];
  is_most_popular: boolean;
  annual_months_included: number;
  free_trial_days: number;
  /** Announced-but-not-yet-applied price, so the site can warn before it lands. */
  upcoming_price?: {
    price_monthly_toman: number;
    price_yearly_toman: number | null;
    effective_at: string;
    is_increase: boolean;
  } | null;
};

export async function getPublicPlans(): Promise<PublicPlan[]> {
  try {
    return await serverFetchRaw<PublicPlan[]>('/platform-settings/plans/active', {
      includeAuth: false,
    });
  } catch {
    return [];
  }
}

export async function getUserProfiles() {
  try {
    const result = await serverFetchRaw<UserProfilesResponse>('/auth/profiles', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    return result.profiles ?? [];
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

export async function getEnrollments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  course_id?: string | number;
}) {
  try {
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        enrollments: Array<EnrollmentSummary & { Course?: EnrollmentSummary['course'] }>;
        pagination: Pagination;
      };
    }>('/enrollments', {
      query: { ...params, mine: true },
    });
    return {
      ...result.data,
      enrollments: result.data.enrollments.map((enrollment) => ({
        ...enrollment,
        course: enrollment.course ?? enrollment.Course ?? null,
      })),
    };
  } catch (error) {
    if (error instanceof Error && /401/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

export async function createPayment(data: {
  course_id: string;
  user_id: string;
  profile_id: string;
  amount: number;
  payment_method: string;
  status?: string;
  gateway_id?: string;
  coupon_code?: string;
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
        amount: number;
        currency: string;
        status: string;
        payment_method: string;
        gateway_id?: string | null;
        coupon_code?: string | null;
        created_at: string;
      };
    }>('/payments', {
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

export async function initiateCheckoutPayment(data: {
  course_id: string;
  amount: number;
  coupon_code?: string;
  mobile?: string;
  provider?: 'BITPAY' | 'PAYPING' | 'SAMAN_SEP';
}) {
  const headerStore = await nextHeaders();
  const fallbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const baseUrl = resolvePublicOriginFromHeaders(headerStore, fallbackBaseUrl);

  const payload = {
    ...data,
    callback_url: `${baseUrl}/payment/callback`,
  };

  const result = await serverFetchRaw<{
    status: string;
    data: {
      payment_id: string;
      amount: number;
      redirect_url: string;
    };
  }>('/payments/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return result.data;
}
