import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { backendApiBaseUrl, env } from "@/lib/env";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.profileId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { course_id, amount, coupon_code, mobile, provider } = body;

    if (!course_id || !amount) {
      return NextResponse.json(
        { success: false, error: "course_id and amount are required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const academyId = cookieStore.get(env.academyIdCookie)?.value;

    // Build the callback URL PayPing will redirect the user back to
    const origin = request.headers.get("origin") || env.backendOrigin;
    const callbackUrl = `${origin}/payment/callback`;

    const backendRes = await fetch(`${backendApiBaseUrl}/payments/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(academyId && { "X-Academy-ID": academyId }),
      },
      body: JSON.stringify({
        course_id,
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
        { success: false, error: data.message || "Failed to initiate payment" },
        { status: backendRes.status }
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
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
