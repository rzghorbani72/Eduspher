import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { buildInternalBackendHeaders } from "@/lib/backend-internal";
import { backendApiBaseUrl, env } from "@/lib/env";
import { SELECTOR_KEYS } from "@/lib/payment/initiate-checkout";

/**
 * POST /api/payment/quote — cookie-auth proxy to Nest
 * `POST /payments/checkout/quote`. Forwards Nest's body/status unchanged.
 * Uses the internal API key so Nest CSRF (browser-only) does not block this
 * trusted server-to-server hop.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;
  const selector = Object.fromEntries(
    SELECTOR_KEYS.filter((key) => body[key]).map((key) => [
      key,
      String(body[key]),
    ]),
  );

  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;
  const academyId = cookieStore.get(env.academyIdCookie)?.value;
  const seats = Number(body.seats);
  // Prefer the browser Cookie header so Nest sees the same csrf-token the
  // client holds; Bearer alone is enough after CSRF middleware skips it.
  const cookieHeader = request.headers.get("cookie") ?? undefined;

  const response = await fetch(`${backendApiBaseUrl}/payments/checkout/quote`, {
    method: "POST",
    headers: buildInternalBackendHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(academyId ? { "X-Academy-ID": academyId } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    }),
    body: JSON.stringify({
      ...selector,
      ...(seats > 1 ? { seats } : {}),
      ...(typeof body.join_code === "string" && body.join_code
        ? { join_code: body.join_code }
        : {}),
      ...(body.use_credit === false || body.use_credit === "false"
        ? { use_credit: false }
        : {}),
      ...(typeof body.coupon_code === "string" && body.coupon_code
        ? { coupon_code: body.coupon_code }
        : {}),
    }),
  });

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload, { status: response.status });
}
