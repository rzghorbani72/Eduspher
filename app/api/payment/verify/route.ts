import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createEnrollment } from "@/lib/api/server";

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
    const { payment_id, basket_id, transaction_id, reference } = body;

    if (!payment_id || !basket_id) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // In production, verify payment with bank API using transaction_id and reference
    // For now, we'll just update the payment status and create enrollments
    
    // TODO: Call backend API to:
    // 1. Verify payment with bank using transaction_id
    // 2. Update payment status to COMPLETED
    // 3. Get basket items
    // 4. Create enrollments for all courses in basket
    // 5. Clear cart

    // Mock implementation - in production, this would call the backend
    const mockSuccess = true; // In production, this would be the result from bank verification

    if (mockSuccess) {
      return NextResponse.json({
        success: true,
        message: "Payment verified and enrollments created",
        payment_id,
        transaction_id,
        reference,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }
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

