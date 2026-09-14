import type { PaymentSummary } from '@/lib/api/account-types';

/** Bank ref after verify (`gateway_id`), else checkout authority token. */
export function paymentTrackingCode(
  payment: Pick<PaymentSummary, 'gateway_id' | 'authority'>,
): string | null {
  const code = payment.gateway_id?.trim() || payment.authority?.trim();
  return code || null;
}
