import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import {
  initiateCheckout,
  SELECTOR_KEYS,
  type PurchaseSelector,
} from "@/lib/payment/initiate-checkout";

/**
 * POST /api/payment/initiate — the single checkout entry point for the
 * storefront. Body carries exactly one selector (course_id, offer_id,
 * academy_plan_id, tutoring_offer_id or payment_plan_id) plus the amount.
 * Returns { payment_id, redirect_url, amount }; a null redirect_url means the
 * purchase resolved without a gateway (free or already covered).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.profileId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const selector: PurchaseSelector = Object.fromEntries(
      SELECTOR_KEYS.filter((key) => body[key]).map((key) => [key, String(body[key])]),
    );

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json(
        { success: false, error: "A valid amount is required" },
        { status: 400 },
      );
    }

    const result = await initiateCheckout({
      ...selector,
      amount,
      coupon_code: body.coupon_code,
      affiliate_code: body.affiliate_code,
      mobile: body.mobile,
      provider: body.provider,
      origin: request.headers.get("origin") || env.backendOrigin,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({
      success: true,
      payment_id: result.payment_id,
      redirect_url: result.redirect_url,
      amount: result.amount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
