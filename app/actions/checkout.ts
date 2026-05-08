"use server";

import { getSession } from "@/lib/auth/session";
import {
  createEnrollment,
  createBasket,
  initiateCheckoutPayment,
} from "@/lib/api/server";

interface CheckoutRequest {
  course_id?: number;
  course_ids?: number[];
  user_id: number;
  profile_id: number;
  voucher_code?: string;
}

interface CheckoutResult {
  success: boolean;
  error?: string;
  enrollmentId?: number;
  paymentId?: number;
  basketId?: number;
  bankRedirectUrl?: string;
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

    try {
      const { getCourseById, getCart } = await import("@/lib/api/server");
      
      // Determine course IDs - from request or cart
      let courseIds: number[] = [];
      if (request.course_ids && request.course_ids.length > 0) {
        courseIds = request.course_ids;
      } else if (request.course_id) {
        courseIds = [request.course_id];
      } else {
        // Get from server cart (hybrid approach - server is source of truth at checkout)
        const cart = await getCart();
        if (cart && cart.items) {
          courseIds = cart.items.map((item: any) => item.course_id);
        }
        
        // If no server cart, try to sync local cart first
        if (courseIds.length === 0) {
          // This would sync local cart to server, then get it
          // For now, we'll rely on client to pass course_ids
        }
      }

      if (courseIds.length === 0) {
        return {
          success: false,
          error: "No courses selected",
        };
      }

      // Fetch all courses to check if any are free
      const courses = await Promise.all(
        courseIds.map((id) => getCourseById(id).catch(() => null))
      );

      const validCourses = courses.filter((c) => c !== null);
      if (validCourses.length === 0) {
        return {
          success: false,
          error: "No valid courses found",
        };
      }

      const hasPaidCourses = validCourses.some((c) => !c.is_free && c.price > 0);
      const totalAmount = validCourses.reduce(
        (sum, c) => sum + (c.is_free ? 0 : c.price * 100),
        0
      );

      // For free courses only, enroll directly
      if (!hasPaidCourses) {
        const enrollments = await Promise.all(
          validCourses.map((course) =>
            createEnrollment({
              course_id: course.id,
              user_id: request.user_id,
              profile_id: request.profile_id,
              status: "ACTIVE",
            })
          )
        );

        return {
          success: true,
          enrollmentId: enrollments[0]?.id,
        };
      }

      if (courseIds.length > 1) {
        return {
          success: false,
          error:
            "Online payment currently supports one paid course per checkout. Please purchase courses one by one.",
        };
      }

      // For paid courses, create basket first (kept for voucher/accounting consistency)
      const basket = await createBasket({
        profile_id: request.profile_id,
        course_ids: courseIds,
        voucher_code: request.voucher_code,
      });

      if (!basket || !basket.id) {
        return {
          success: false,
          error: "Failed to create basket",
        };
      }

      // Initiate real gateway checkout via backend (/payments/checkout)
      const checkoutResult = await initiateCheckoutPayment({
        course_id: courseIds[0],
        amount: basket.final_amount,
        coupon_code: request.voucher_code,
      });

      return {
        success: true,
        paymentId: checkoutResult.payment_id,
        basketId: basket.id,
        bankRedirectUrl: checkoutResult.redirect_url,
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


