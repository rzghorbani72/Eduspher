import type { TicketMessageView, TicketStatus } from '@/lib/api/client';
import { getClientBackendApiBaseUrl } from '@/lib/env';

type Translate = (key: string) => string;

/**
 * Build the retrieval URL for a ticket attachment via the capability-checked
 * proxy — NOT the public-by-id `/images/get-image` endpoint. The browser sends
 * the auth cookie automatically on this same-origin-credentialed request, so a
 * plain <img src> works without custom headers.
 */
export function attachmentUrl(ticketId: string, attachmentId: string): string {
  return `${getClientBackendApiBaseUrl()}/support/tickets/${encodeURIComponent(ticketId)}/attachments/${encodeURIComponent(attachmentId)}`;
}

/** Localized text for a SYSTEM_EVENT message (e.g. responsible changed). */
export function formatSystemEvent(message: TicketMessageView, t: Translate): string {
  const meta = message.system_meta ?? {};
  const fill = (key: string) =>
    t(key)
      .replace('{from}', meta.from_name ?? '—')
      .replace('{to}', meta.to_name ?? '—')
      .replace('{by}', meta.by_name ?? '—');

  if (message.system_event_type === 'reassigned') {
    return meta.from_name
      ? fill('support.responsibleChanged')
      : fill('support.responsibleAssigned');
  }
  return t('support.callRequested');
}

export function statusBadgeVariant(
  status: TicketStatus,
): 'default' | 'soft' | 'success' | 'warning' {
  if (status === 'RESOLVED' || status === 'CLOSED') return 'success';
  if (status === 'WAITING_ON_USER') return 'warning';
  if (status === 'OPEN' || status === 'REOPENED') return 'default';
  return 'soft';
}

/** StatusPill tone for ticket list / thread chrome. */
export function ticketStatusTone(
  status: TicketStatus,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === 'RESOLVED' || status === 'CLOSED') return 'success';
  if (status === 'WAITING_ON_USER') return 'warning';
  if (status === 'OPEN' || status === 'REOPENED') return 'info';
  if (status === 'IN_PROGRESS') return 'neutral';
  return 'neutral';
}
