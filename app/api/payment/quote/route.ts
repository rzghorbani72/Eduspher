import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getSession } from "@/lib/auth/session";
import { backendApiBaseUrl, env } from "@/lib/env";
import { SELECTOR_KEYS, type PurchaseSelector } from "@/lib/payment/initiate-checkout";

/**
 * POST /api/payment/quote — what this purchase will cost before the bank: the
 * offer price, what the coupon takes off, and the VAT already inside the total.
 * Creates nothing; the checkout endpoint stays the authority on the charge.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const selector: PurchaseSelector = Object.fromEntries(
    SELECTOR_KEYS.filter((key) => body[key]).map((key) => [key, String(body[key])]),
  );
  if (Object.keys(selector).length !== 1) {
    return NextResponse.json(
      { success: false, error: "Exactly one purchase selector is required" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const academyId = cookieStore.get(env.academyIdCookie)?.value;

  const response = await fetch(`${backendApiBaseUrl}/payments/checkout/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(academyId && { "X-Academy-ID": academyId }),
    },
    body: JSON.stringify({
      ...selector,
      // A group class is priced per seat, so the quote must know how many.
      ...(Number(body.seats) > 1 && { seats: Number(body.seats) }),
      ...(body.join_code && { join_code: String(body.join_code) }),
      ...(body.coupon_code && { coupon_code: String(body.coupon_code) }),
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return NextResponse.json(
      { success: false, error: payload?.message ?? "Could not price this purchase" },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true, quote: payload?.data ?? null });
}
