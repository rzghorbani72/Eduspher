import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { backendApiBaseUrl, env } from "@/lib/env";
import { cookies } from "next/headers";

/**
 * POST /api/payment/plan/initiate
 * Initiates a gateway checkout for an AcademyPlan (SUBSCRIPTION or PACKAGE).
 * Body: { academy_plan_id, amount, coupon_code?, mobile? }
 * Returns: { payment_id, redirect_url, amount }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.profileId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { academy_plan_id, amount, coupon_code, mobile, provider } = body;

    if (!academy_plan_id || !amount) {
      return NextResponse.json(
        { success: false, error: "academy_plan_id and amount are required" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const academyId = cookieStore.get(env.academyIdCookie)?.value;
    const origin = request.headers.get("origin") || env.backendOrigin;
    const callbackUrl = provider === 'SAMAN_SEP'
      ? `${origin}/payment/saman-callback`
      : `${origin}/payment/callback`;

    const backendRes = await fetch(`${backendApiBaseUrl}/payments/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(academyId && { "X-Academy-ID": academyId }),
      },
      body: JSON.stringify({
        academy_plan_id,
        amount,
        callback_url: callbackUrl,
        ...(coupon_code && { coupon_code }),
        ...(mobile && { mobile }),
        ...(provider && { provider }),
      }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, error: data.message || "Failed to initiate plan payment" },
        { status: backendRes.status },
      );
    }

    return NextResponse.json({
      success: true,
      payment_id: data.data.payment_id,
      redirect_url: data.data.redirect_url,
      amount: data.data.amount,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
