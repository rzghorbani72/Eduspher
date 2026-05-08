import { NextRequest, NextResponse } from "next/server";
import { backendApiBaseUrl, env } from "@/lib/env";
import { cookies } from "next/headers";

/**
 * Called by the /payment/callback page after PayPing redirects the user back.
 * PayPing appends ?refid=<txn_ref>&clientrefid=<payment_id> to the returnUrl.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, ref_id } = body;

    if (!payment_id || !ref_id) {
      return NextResponse.json(
        { success: false, error: "payment_id and ref_id are required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;
    const academyId = cookieStore.get(env.academyIdCookie)?.value;

    const backendRes = await fetch(`${backendApiBaseUrl}/payments/verify/payping`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Verify endpoint is @Public on backend — no auth required
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(academyId && { "X-Academy-ID": academyId }),
      },
      body: JSON.stringify({ payment_id: Number(payment_id), ref_id }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, error: data.message || "Verification failed" },
        { status: backendRes.status }
      );
    }

    const isSuccess = data.status === "ok";
    return NextResponse.json({
      success: isSuccess,
      payment_id: data.data?.payment_id,
      ref_id: data.data?.ref_id,
      amount: data.data?.amount,
      already_paid: data.data?.already_paid,
      error: isSuccess ? undefined : data.data?.reason,
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
