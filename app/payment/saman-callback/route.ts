import { type NextRequest, NextResponse } from 'next/server';
import { backendApiBaseUrl, env } from '@/lib/env';
import { buildInternalBackendHeaders } from '@/lib/backend-internal';

/**
 * Saman SEP POSTs the payment result here after the user completes (or cancels) payment.
 * The form body contains: State, Status, RefNum, ResNum (=our payment_id), TraceNo, MID, Amount, SecurePan, RRN
 *
 * The bank registers ONE callback URL, so this route always runs on the platform
 * host, even when the buyer started on an academy's own domain. The backend tells
 * us which academy site to send them back to (`return_url`); it is produced from
 * our own DB, never from the request, so it cannot be turned into an open redirect.
 *
 * Flow:
 *  1. Read State and RefNum from the SEP POST body
 *  2. If State !== 'OK' → back to the academy's /payment/failure
 *  3. Call backend /payments/verify/saman
 *  4. Back to the academy's /payment/success or /payment/failure
 */

type SepResult = {
  state: string | null;
  refNum: string | null;
  resNum: string | null;
  statusCode: string | null;
};

const readSepResult = async (request: NextRequest): Promise<SepResult> => {
  const contentType = request.headers.get('content-type') ?? '';
  const read = (get: (key: string) => string | null): SepResult => ({
    state: get('State'),
    refNum: get('RefNum'),
    resNum: get('ResNum'),
    statusCode: get('Status'),
  });

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(await request.text());
    return read((key) => params.get(key));
  }

  try {
    const form = await request.formData();
    return read((key) => (form.get(key) as string | null) ?? null);
  } catch {
    const json = (await request.json().catch(() => ({}))) as Record<string, string>;
    return read((key) => json[key] ?? null);
  }
};

/** Academy origin for a payment, used when we redirect before verifying. */
const fetchReturnOrigin = async (paymentId: string | null): Promise<string | null> => {
  if (!paymentId) return null;
  try {
    const res = await fetch(`${backendApiBaseUrl}/payments/${paymentId}/return-url`, {
      headers: buildInternalBackendHeaders(),
      cache: 'no-store',
    });
    const body = (await res.json()) as {
      data?: { return_url?: string | null };
    };
    return body.data?.return_url ?? null;
  } catch {
    return null;
  }
};

const redirectTo = (origin: string, path: string, params: Record<string, string>) => {
  const url = new URL(`${origin}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return NextResponse.redirect(url.toString(), { status: 303 });
};

export async function POST(request: NextRequest) {
  const platformOrigin = env.appUrl;

  let result: SepResult;
  try {
    result = await readSepResult(request);
  } catch {
    return redirectTo(platformOrigin, '/payment/failure', {
      reason: 'invalid_callback',
    });
  }

  const { state, refNum, resNum, statusCode } = result;

  if (state !== 'OK' || !refNum || !resNum) {
    const origin = (await fetchReturnOrigin(resNum)) ?? platformOrigin;
    return redirectTo(origin, '/payment/failure', {
      reason: state === 'CanceledByUser' ? 'cancelled' : 'payment_failed',
      ...(statusCode && { status: statusCode }),
    });
  }

  try {
    const verifyRes = await fetch(`${backendApiBaseUrl}/payments/verify/saman`, {
      method: 'POST',
      headers: buildInternalBackendHeaders(),
      body: JSON.stringify({ payment_id: resNum, ref_num: refNum }),
    });

    const data = (await verifyRes.json()) as {
      status?: string;
      data?: {
        payment_id?: string;
        reason?: string;
        return_url?: string | null;
      };
    };
    const origin = data.data?.return_url ?? platformOrigin;

    if (data.status === 'ok') {
      return redirectTo(origin, '/payment/success', {
        payment_id: data.data?.payment_id ?? resNum,
        RefNum: refNum,
      });
    }

    return redirectTo(origin, '/payment/failure', {
      reason: data.data?.reason ?? 'verification_failed',
    });
  } catch {
    const origin = (await fetchReturnOrigin(resNum)) ?? platformOrigin;
    return redirectTo(origin, '/payment/failure', { reason: 'server_error' });
  }
}
