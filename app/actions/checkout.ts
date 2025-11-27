"use server";

import { getSession } from "@/lib/auth/session";
import { createPayment, createEnrollment } from "@/lib/api/server";

interface CheckoutRequest {
  course_id: number;
  user_id: number;
  profile_id: number;
  voucher_code?: string;
}

interface CheckoutResult {
  success: boolean;
  error?: string;
  enrollmentId?: number;
  paymentId?: number;
}

export async function processCheckout(
  request: CheckoutRequest
): Promise<CheckoutResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId || !session.profileId) {
      return {
        success: false,
        error: "You must be logged in to complete checkout",
      };
    }

    // Verify the user matches the session
    if (session.userId !== request.user_id || session.profileId !== request.profile_id) {
      return {
        success: false,
        error: "Invalid user session",
      };
    }

    // For free courses, create enrollment directly without payment
    // For paid courses, create payment first, then enrollment
    let paymentId: number | undefined;

    try {
      // Check if course is free by fetching it
      const { getCourseById } = await import("@/lib/api/server");
      const course = await getCourseById(request.course_id);

      if (!course) {
        return {
          success: false,
          error: "Course not found",
        };
      }

      if (!course.is_free && course.price > 0) {
        // Create payment for paid courses
        const paymentResult = await createPayment({
          course_id: request.course_id,
          user_id: request.user_id,
          profile_id: request.profile_id,
          amount: Math.round(course.price * 100), // Convert to smallest currency unit (cents)
          payment_method: "ONLINE",
          status: "PENDING", // Will be updated when payment gateway confirms
          coupon_code: request.voucher_code,
        });

        if (!paymentResult || !paymentResult.id) {
          return {
            success: false,
            error: "Failed to create payment",
          };
        }

        paymentId = paymentResult.id;
      }

      // Create enrollment
      const enrollmentResult = await createEnrollment({
        course_id: request.course_id,
        user_id: request.user_id,
        profile_id: request.profile_id,
        payment_id: paymentId,
        status: "ACTIVE",
      });

      if (!enrollmentResult || !enrollmentResult.id) {
        return {
          success: false,
          error: "Failed to create enrollment",
        };
      }

      return {
        success: true,
        enrollmentId: enrollmentResult.id,
        paymentId: paymentId,
      };
    } catch (apiError) {
      const errorMessage =
        apiError instanceof Error ? apiError.message : "Failed to process checkout";
      
      // Check if user is already enrolled
      if (errorMessage.toLowerCase().includes("already enrolled")) {
        return {
          success: false,
          error: "You are already enrolled in this course",
        };
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

