import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { buildInternalBackendHeaders } from '@/lib/backend-internal';
import { backendApiBaseUrl, env } from '@/lib/env';
import { SELECTOR_KEYS } from '@/lib/payment/initiate-checkout';
import { resolvePublicRequestOrigin } from '@/lib/public-request-origin';

/**
 * POST /api/payment/initiate — cookie-auth proxy to Nest `POST /payments/checkout`.
 * Forwards Nest's body/status unchanged. Internal API key skips browser CSRF.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;
  const selector = Object.fromEntries(
    SELECTOR_KEYS.filter((key) => body[key]).map((key) => [key, String(body[key])]),
  );

  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;
  const academyId = cookieStore.get(env.academyIdCookie)?.value;
  const cookieHeader = request.headers.get('cookie') ?? undefined;
  const academyOrigin = resolvePublicRequestOrigin(request);
  const seats = Number(body.seats);

  // Unified callback handles BitPay + Saman; the backend picks the owner-active rail.
  const callback_url = `${academyOrigin}/payment/callback`;

  const response = await fetch(`${backendApiBaseUrl}/payments/checkout`, {
    method: 'POST',
    headers: buildInternalBackendHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(academyId ? { 'X-Academy-ID': academyId } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    }),
    body: JSON.stringify({
      ...selector,
      amount: Number(body.amount),
      callback_url,
      ...(typeof body.coupon_code === 'string' && body.coupon_code
        ? { coupon_code: body.coupon_code }
        : {}),
      ...(typeof body.affiliate_code === 'string' && body.affiliate_code
        ? { affiliate_code: body.affiliate_code }
        : {}),
      ...(typeof body.mobile === 'string' && body.mobile ? { mobile: body.mobile } : {}),
      // Do not forward a client-picked provider: the owner-panel active rail
      // (preferred: Saman) is the single source of truth for academy checkout.
      ...(seats > 1 ? { seats } : {}),
      ...(typeof body.join_code === 'string' && body.join_code
        ? { join_code: body.join_code }
        : {}),
      ...(body.use_credit === false || body.use_credit === 'false' ? { use_credit: false } : {}),
    }),
  });

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload, { status: response.status });
}
