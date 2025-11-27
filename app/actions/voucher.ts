"use server";

import { validateDiscount } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";

interface ValidateVoucherRequest {
  code: string;
  amount: number;
}

interface ValidateVoucherResult {
  success: boolean;
  error?: string;
  discount_amount?: number;
  final_amount?: number;
  discount_code_id?: number;
}

export async function validateVoucher(
  request: ValidateVoucherRequest
): Promise<ValidateVoucherResult> {
  try {
    const session = await getSession();
    const profileId = session?.profileId;

    const result = await validateDiscount({
      code: request.code,
      amount: request.amount,
      profile_id: profileId,
    });

    return {
      success: true,
      discount_amount: result.discount_amount,
      final_amount: result.final_amount,
      discount_code_id: result.discount_code_id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to validate voucher code";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

