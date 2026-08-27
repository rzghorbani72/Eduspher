import { type NextRequest, NextResponse } from 'next/server';
import { backendApiBaseUrl, env } from '@/lib/env';
import { buildInternalBackendHeaders } from '@/lib/backend-internal';
import { cookies } from 'next/headers';

/**
 * Saman SEP POSTs the payment result here after the user completes (or cancels) payment.
 * The form body contains: State, Status, RefNum, ResNum (=our payment_id), TraceNo, MID, Amount, SecurePan, RRN
 *
 * Flow:
 *  1. Read State and RefNum from SEP POST body
 *  2. If State !== 'OK' → redirect to /payment/failure
 *  3. Call backend /payments/verify/saman
 *  4. Redirect to /payment/success or /payment/failure
 */
export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin;

  let state: string | null = null;
  let refNum: string | null = null;
  let resNum: string | null = null;
  let statusCode: string | null = null;

  try {
    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      state = params.get('State');
      refNum = params.get('RefNum');
      resNum = params.get('ResNum');
      statusCode = params.get('Status');
    } else {
      // Fallback: try JSON or formData
      try {
        const form = await request.formData();
        state = form.get('State') as string | null;
        refNum = form.get('RefNum') as string | null;
        resNum = form.get('ResNum') as string | null;
        statusCode = form.get('Status') as string | null;
      } catch {
        const json = await request.json().catch(() => ({}));
        state = json.State ?? null;
        refNum = json.RefNum ?? null;
        resNum = json.ResNum ?? null;
        statusCode = json.Status ?? null;
      }
    }
  } catch {
    return NextResponse.redirect(`${origin}/payment/failure?reason=invalid_callback`, { status: 303 });
  }

  if (state !== 'OK' || !refNum || !resNum) {
    const reason = state === 'CanceledByUser' ? 'cancelled' : 'payment_failed';
    const url = new URL(`${origin}/payment/failure`);
    url.searchParams.set('reason', reason);
    if (statusCode) url.searchParams.set('status', statusCode);
    return NextResponse.redirect(url.toString(), { status: 303 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;
    const academyId = cookieStore.get(env.academyIdCookie)?.value;

    const verifyRes = await fetch(`${backendApiBaseUrl}/payments/verify/saman`, {
      method: 'POST',
      headers: buildInternalBackendHeaders({
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(academyId && { 'X-Academy-ID': academyId }),
      }),
      body: JSON.stringify({ payment_id: resNum, ref_num: refNum }),
    });

    const data = await verifyRes.json() as { status?: string; data?: { payment_id?: string; reason?: string } };

    if (data.status === 'ok') {
      const url = new URL(`${origin}/payment/success`);
      url.searchParams.set('payment_id', data.data?.payment_id ?? resNum);
      url.searchParams.set('RefNum', refNum);
      return NextResponse.redirect(url.toString(), { status: 303 });
    }

    const url = new URL(`${origin}/payment/failure`);
    url.searchParams.set('reason', data.data?.reason ?? 'verification_failed');
    return NextResponse.redirect(url.toString(), { status: 303 });
  } catch {
    return NextResponse.redirect(`${origin}/payment/failure?reason=server_error`, { status: 303 });
  }
}
