'use client';

import type { AuthResponse } from '@/lib/api/types';
import { apiFetch, buildHeaders, handleResponse, postJson, resolveAcademyId } from './core';
import type { RequestOptions } from './core';
import { getJson, patchJson, postPublicJson } from './http-helpers';
import type { LegalChangeLine, LegalPendingDocument } from './http-helpers';

export type LegalDocumentDiff = {
  type: string;
  title: string;
  version: string;
  previousVersion: string | null;
  /** null when there is nothing to compare against (first acceptance). */
  diff: LegalChangeLine[] | null;
};

// The /legal endpoints answer with bare objects — no {status,data} envelope.

export const getLegalAcceptanceStatus = (options?: RequestOptions) =>
  getJson<{ up_to_date: boolean; pending: LegalPendingDocument[] }>(
    '/legal/acceptances/status',
    options,
  );

export const getLegalAcceptanceDiff = (options?: RequestOptions) =>
  getJson<LegalDocumentDiff[]>('/legal/acceptances/diff', options);

export const acceptPlatformLegalDocuments = (locale?: string, options?: RequestOptions) =>
  postJson<{ accepted: string[] }>(
    '/legal/acceptances/platform',
    locale ? { locale } : {},
    options,
  );

// ----- Notifications -----

export type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export const listNotifications = (
  params?: { page?: number; limit?: number },
  options?: RequestOptions,
) => {
  const query = new URLSearchParams();
  query.set('page', String(params?.page ?? 1));
  query.set('limit', String(params?.limit ?? 30));
  return getJson<{
    status: string;
    data: { notifications: NotificationRow[]; pagination: { total: number } };
  }>(`/notifications?${query}`, options);
};

export const getUnreadNotificationCount = (options?: RequestOptions) =>
  getJson<{ status: string; data: { count: number } }>('/notifications/unread-count', options);

export const markNotificationRead = (id: string, options?: RequestOptions) =>
  patchJson<{ status: string; data: { id: string } }>(`/notifications/${id}/read`, {}, options);

export const markAllNotificationsRead = (options?: RequestOptions) =>
  postJson<{ status: string; data: { updated_count: number } }>(
    '/notifications/read-all',
    {},
    options,
  );

/**
 * The academy's refund window is enforced server-side, so a rejection comes back
 * as a stable error `code` rather than being pre-judged in the UI.
 */
export const requestRefund = (
  payload: { payment_id: string; amount?: number; reason?: string },
  options?: RequestOptions,
) => {
  return postJson<{ status: string; message: string; data: { id: string } }>(
    '/refunds/requests',
    payload,
    options,
  );
};

export const getMyLegalAcceptances = (options?: RequestOptions) =>
  getJson<
    Array<{
      type: string;
      version: string;
      accepted_at: string;
      locale: string;
    }>
  >('/legal/acceptances/me', options);

export type SendOtpPayload = {
  email?: string;
  phone_number?: string;
};

export type VerifyOtpPayload = {
  email?: string;
  phone_number?: string;
  otp: string;
};

export type ForgetPasswordPayload = {
  identifier: string;
  password: string;
  confirmed_password: string;
  otp: string;
  academy_id?: string;
};

export const validatePhoneAndEmail = (
  phone_number?: string,
  email?: string,
  options?: RequestOptions,
) => {
  return postJson<{
    success: boolean;
    message: string;
    phone_number: string;
    email: string;
  }>(
    '/auth/otp/validate-phone-email',
    {
      ...(phone_number ? { phone_number } : {}),
      ...(email ? { email } : {}),
    },
    options,
  );
};

export const sendEmailOtp = (
  email: string,
  type: string,
  captchaToken: string,
  options?: RequestOptions,
) => {
  return postJson<{ message: string; status: string }>(
    '/auth/otp/send-email',
    {
      email,
      type,
      captcha_token: captchaToken,
    },
    options,
  );
};

export const sendPhoneOtp = (
  phone_number: string,
  type: string,
  captchaToken: string,
  options?: RequestOptions,
) => {
  return postPublicJson<{ message: string; status: string }>(
    '/auth/otp/send-phone',
    {
      phone_number,
      type,
      academy_id: resolveAcademyId() ?? undefined,
      captcha_token: captchaToken,
    },
    options,
  );
};

export const loginByPhoneOtp = (phone_number: string, otp: string, options?: RequestOptions) => {
  return postJson<AuthResponse>(
    '/auth/login-by-phone-otp',
    {
      phone_number,
      otp,
      academy_id: resolveAcademyId() ?? undefined,
    },
    options,
  );
};

export const loginByEmailOtp = (email: string, otp: string, options?: RequestOptions) => {
  return postJson<AuthResponse>(
    '/auth/login-by-email-otp',
    {
      email,
      otp,
      academy_id: resolveAcademyId() ?? undefined,
    },
    options,
  );
};

export const verifyEmailOtp = (
  email: string,
  otp: string,
  type: string,
  options?: RequestOptions,
) => {
  return postJson<{ message: string; status: string; success?: boolean }>(
    '/auth/otp/verify-email',
    {
      email,
      otp,
      type,
    },
    options,
  );
};

export const verifyPhoneOtp = (
  phone_number: string,
  otp: string,
  type: string,
  options?: RequestOptions,
) => {
  return postPublicJson<{ message: string; status: string; success?: boolean }>(
    '/auth/otp/verify-phone',
    {
      phone_number,
      otp,
      type,
    },
    options,
  );
};

export const forgetPassword = (payload: ForgetPasswordPayload, options?: RequestOptions) => {
  return postJson<{ message: string; status: string }>(
    '/auth/forget-password',
    {
      ...payload,
      academy_id: payload.academy_id ?? resolveAcademyId() ?? undefined,
    },
    options,
  );
};

export const changePassword = (
  payload: {
    profile_id: string;
    current_password: string;
    new_password: string;
    confirm_new_password: string;
  },
  options?: RequestOptions,
) => {
  return postJson<{ message: string; status: string; success?: boolean }>(
    '/auth/change-password',
    payload,
    options,
  );
};

export const updateProfile = async (
  profileId: string,
  data: { display_name?: string; image_id?: string },
  options?: RequestOptions,
) => {
  const response = await patchJson<{
    message: string;
    status: string;
    data: {
      id: string;
      display_name: string;
      avatar_id: string | null;
      avatar: { id: string; url: string; alt: string | null } | null;
    };
  }>(`/profiles/${profileId}`, data, options);
  return response.data;
};

/**
 * Uploads an image and returns its id. The backend field name is `imagefile`;
 * Content-Type must be left to the browser so the multipart boundary is set.
 */
export const uploadImage = async (
  file: File,
  alt: string,
  options?: RequestOptions,
): Promise<{ id: string; url: string; publicUrl: string | null }> => {
  const body = new FormData();
  body.append('imagefile', file);
  body.append('alt', alt);

  const response = await apiFetch('/images/upload', {
    method: 'POST',
    credentials: 'include',
    headers: await buildHeaders({ Accept: 'application/json' }, { mutate: true }),
    body,
    signal: options?.signal,
  });

  const parsed = await handleResponse<{
    status: string;
    data: { id: string; url: string; publicUrl: string | null };
  }>(response);
  return parsed.data;
};
