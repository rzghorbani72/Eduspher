import "server-only";

import { cookies } from "next/headers";

import { backendApiBaseUrl, env } from "@/lib/env";

/**
 * The five ways a student can buy. The backend exposes them through one
 * endpoint (`POST /payments/checkout`), so the storefront keeps one entry point
 * too — exactly one selector is sent per purchase.
 */
export type PurchaseSelector = {
  course_id?: string;
  offer_id?: string;
  academy_plan_id?: string;
  tutoring_offer_id?: string;
  tutoring_group_id?: string;
  payment_plan_id?: string;
};

export const SELECTOR_KEYS = [
  "course_id",
  "offer_id",
  "academy_plan_id",
  "tutoring_offer_id",
  "tutoring_group_id",
  "payment_plan_id",
] as const satisfies readonly (keyof PurchaseSelector)[];

export type InitiateCheckoutInput = PurchaseSelector & {
  amount: number;
  /** Seats bought in one go — more than one books a group class privately. */
  seats?: number;
  /** Share code required to join a private group class. */
  join_code?: string;
  coupon_code?: string;
  affiliate_code?: string;
  mobile?: string;
  provider?: string;
  /** Origin of the storefront, used to build the gateway return URL. */
  origin: string;
};

export type CheckoutGateway = { provider: string; display_name: string };

export type InitiateCheckoutResult =
  | {
      ok: true;
      payment_id: string | null;
      redirect_url: string | null;
      amount: number;
      /** Non-empty when the academy has several gateways and the buyer must pick one. */
      gateways: CheckoutGateway[];
    }
  | { ok: false; status: number; error: string };

/**
 * Saman SEP POSTs back to the callback; every other gateway GETs back, and a
 * POST to a GET-only page would be rejected — hence two return URLs.
 *
 * Saman also registers ONE callback URL per merchant, so an academy on its own
 * hostname cannot be the return address: the SEP callback is pinned to the
 * platform origin (exactly the URL registered with the bank, no query string),
 * and the callback route sends the buyer back to their academy afterwards.
 */
const callbackFor = (origin: string, provider?: string) =>
  provider === "SAMAN_SEP"
    ? `${env.appUrl}/payment/saman-callback`
    : `${origin}/payment/callback`;

export const initiateCheckout = async (
  input: InitiateCheckoutInput,
): Promise<InitiateCheckoutResult> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;
  if (!token) {
    return { ok: false, status: 401, error: "Authentication required" };
  }

  const selectors = SELECTOR_KEYS.filter((key) => input[key]);
  if (selectors.length !== 1) {
    return {
      ok: false,
      status: 400,
      error:
        "Exactly one of course_id, offer_id, academy_plan_id, tutoring_offer_id, tutoring_group_id or payment_plan_id is required",
    };
  }

  const academyId = cookieStore.get(env.academyIdCookie)?.value;

  const response = await fetch(`${backendApiBaseUrl}/payments/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(academyId && { "X-Academy-ID": academyId }),
    },
    body: JSON.stringify({
      [selectors[0]]: input[selectors[0]],
      amount: input.amount,
      callback_url: callbackFor(input.origin, input.provider),
      ...(input.coupon_code && { coupon_code: input.coupon_code }),
      ...(input.affiliate_code && { affiliate_code: input.affiliate_code }),
      ...(input.mobile && { mobile: input.mobile }),
      ...(input.provider && { provider: input.provider }),
      ...(input.seats && input.seats > 1 && { seats: input.seats }),
      ...(input.join_code && { join_code: input.join_code }),
    }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: body?.message ?? "Failed to initiate payment",
    };
  }

  return {
    ok: true,
    payment_id: body?.data?.payment_id ?? null,
    // A free or already-covered purchase resolves without a gateway hop.
    redirect_url: body?.data?.redirect_url ?? null,
    amount: body?.data?.amount ?? input.amount,
    gateways: body?.data?.needs_gateway_selection
      ? ((body.data.available_gateways ?? []) as CheckoutGateway[])
      : [],
  };
};
