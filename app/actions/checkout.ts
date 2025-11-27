"use server";

import { getSession } from "@/lib/auth/session";
import { createPayment, createEnrollment, createBasket } from "@/lib/api/server";

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

      // For paid courses, create basket first
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

      // Create payment with basket reference
        const paymentResult = await createPayment({
        course_id: courseIds[0], // Keep for backward compatibility
          user_id: request.user_id,
          profile_id: request.profile_id,
        amount: basket.final_amount,
          payment_method: "ONLINE",
        status: "PENDING",
        coupon_code: request.voucher_code,
        });

        if (!paymentResult || !paymentResult.id) {
          return {
            success: false,
            error: "Failed to create payment",
          };
        }

      // Call bank API to get redirect URL
      const bankRedirectUrl = await callBankAPI({
        amount: basket.final_amount,
        payment_id: paymentResult.id,
        basket_id: basket.id,
        profile_id: request.profile_id,
      });

      return {
        success: true,
        paymentId: paymentResult.id,
        basketId: basket.id,
        bankRedirectUrl,
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

async function callBankAPI(data: {
  amount: number;
  payment_id: number;
  basket_id: number;
  profile_id: number;
}): Promise<string> {
  // Hardcoded bank API integration
  // In production, this would call the actual bank gateway API
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl = `${baseUrl}/payment/callback`;
  
  // Simulate bank API call - in real implementation, this would be:
  // const response = await fetch('https://bank-api.example.com/payment', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     amount: data.amount,
  //     callback_url: callbackUrl,
  //     payment_id: data.payment_id,
  //   }),
  // });
  // const result = await response.json();
  // return result.redirect_url;

  // For now, return a mock redirect URL that will redirect to our callback
  const mockBankUrl = new URL(`${baseUrl}/payment/bank-redirect`);
  mockBankUrl.searchParams.set("payment_id", data.payment_id.toString());
  mockBankUrl.searchParams.set("basket_id", data.basket_id.toString());
  mockBankUrl.searchParams.set("amount", data.amount.toString());
  mockBankUrl.searchParams.set("callback_url", callbackUrl);
  
  return mockBankUrl.toString();
}

