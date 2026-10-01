'use client';

import { apiFetch, buildHeaders, handleResponse, postJson } from './core';
import type { RequestOptions } from './core';
import { deleteJson, getJson } from './http-helpers';
import type {
  Envelope,
  TicketCategory,
  TicketDetail,
  TicketListItem,
  TicketPriority,
  TicketResponsible,
  TicketStatus,
} from './assessment';

export interface CreateTicketPayload {
  subject: string;
  category: TicketCategory;
  priority?: TicketPriority;
  responsible_id: string;
  body: string;
  image_ids?: string[];
  context_type?: 'COURSE';
  context_id?: string;
  request_call?: boolean;
  phone?: string;
  preferred_time?: string;
}

export type TicketCourseOption = {
  id: string;
  title: string;
};

/** Courses a student can attach to a support ticket (access + published catalog). */
export const listTicketCourses = async (
  options?: RequestOptions,
): Promise<TicketCourseOption[]> => {
  const [accessResult, catalogResult] = await Promise.all([
    getJson<Envelope<Array<{ course_id: string; title: string }>>>(
      `/enrollments/my-access`,
      options,
    ).catch(() => null),
    getJson<Envelope<{ courses: Array<{ id: string; title: string }> }>>(
      `/courses/public?limit=100&published=true`,
      options,
    ).catch(() => null),
  ]);

  const byId = new Map<string, string>();
  for (const course of catalogResult?.data?.courses ?? []) {
    byId.set(course.id, course.title);
  }
  for (const row of accessResult?.data ?? []) {
    byId.set(row.course_id, row.title);
  }
  return Array.from(byId.entries())
    .map(([id, title]) => ({ id, title }))
    .sort((a, b) => a.title.localeCompare(b.title, 'fa'));
};

export const listSupportResponsibles = async (options?: RequestOptions) =>
  (await getJson<Envelope<TicketResponsible[]>>(`/support/responsibles`, options)).data;

export const listMySupportTickets = async (
  params?: { status?: TicketStatus },
  options?: RequestOptions,
) => {
  const qs = params?.status ? `?status=${params.status}` : '';
  return (
    await getJson<Envelope<{ items: TicketListItem[]; total: number }>>(
      `/support/tickets/mine${qs}`,
      options,
    )
  ).data;
};

export const getSupportTicket = async (id: string, options?: RequestOptions) =>
  (await getJson<Envelope<TicketDetail>>(`/support/tickets/${id}`, options)).data;

export const createSupportTicket = async (payload: CreateTicketPayload, options?: RequestOptions) =>
  (await postJson<Envelope<TicketDetail>>(`/support/tickets`, { ...payload }, options)).data;

export const replySupportTicket = async (
  id: string,
  payload: { body: string; image_ids?: string[] },
  options?: RequestOptions,
) =>
  (
    await postJson<Envelope<{ id: string }>>(
      `/support/tickets/${id}/reply`,
      { ...payload },
      options,
    )
  ).data;

export const requestSupportCall = async (
  id: string,
  payload: { phone: string; preferred_time?: string },
  options?: RequestOptions,
) =>
  (
    await postJson<Envelope<TicketDetail>>(
      `/support/tickets/${id}/request-call`,
      { ...payload },
      options,
    )
  ).data;

export const closeSupportTicket = async (id: string, options?: RequestOptions) =>
  (await postJson<Envelope<TicketDetail>>(`/support/tickets/${id}/close`, {}, options)).data;

export const rateSupportTicket = async (
  id: string,
  payload: { score: number; comment?: string },
  options?: RequestOptions,
) =>
  (
    await postJson<Envelope<{ ticket_id: string; score: number }>>(
      `/support/tickets/${id}/rate`,
      { ...payload },
      options,
    )
  ).data;

/** One image as multipart `file`; the browser sets the boundary, so no Content-Type. */
const postImageFile = async <T>(path: string, file: File, options?: RequestOptions) => {
  const form = new FormData();
  form.append('file', file);
  const headers = await buildHeaders({}, { mutate: true });
  const response = await apiFetch(path, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: form,
    signal: options?.signal,
  });
  return (await handleResponse<{ data: T }>(response, undefined, true)).data;
};

export const uploadSupportAttachment = (file: File, options?: RequestOptions) =>
  postImageFile<{ id: string; mime: string; size: number }>('/support/attachments', file, options);

export const uploadAssignmentImage = (file: File, options?: RequestOptions) =>
  postImageFile<{ id: string }>('/assignments/submissions/images', file, options);

export type SeatHold = { hold_id: string; seats: number; expires_at: string };

/** Hold seats in a class from the moment the student confirms a selection. */
export const holdSeats = (groupId: string, seats: number, joinCode?: string) =>
  postJson<{ data: SeatHold }>(`/tutoring/groups/${groupId}/hold`, {
    seats,
    ...(joinCode ? { join_code: joinCode } : {}),
  });

/** Give held seats back when checkout is closed without paying. */
export const releaseSeatHold = (groupId: string) =>
  deleteJson<{ status: string }>(`/tutoring/groups/${groupId}/hold`);
