import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { backendApiBaseUrl, env } from "@/lib/env";
import { buildInternalBackendHeaders } from "@/lib/backend-internal";

/**
 * The one return URL every gateway can be sent to, so checkout never has to know
 * in advance which bank will be used. BitPay returns trans_id/id_get, Saman SEP
 * posts State/RefNum/ResNum, Mellat BP posts ResCode/RefId; anything we cannot
 * verify is reported as a failed payment rather than a blank page.
 *
 * Verification happens here, server-side, so the buyer never sees a screen that
 * "confirms" a payment the backend has not verified.
 */
const readParams = async (
  request: NextRequest,
): Promise<Record<string, string>> => {
  const params: Record<string, string> = {};
  new URL(request.url).searchParams.forEach((value, key) => {
    params[key] = value;
  });
  if (request.method === "POST") {
    try {
      const form = await request.formData();
      form.forEach((value, key) => {
        params[key] = String(value);
      });
    } catch {
      // A gateway that posts nothing readable is handled as an invalid callback.
    }
  }
  return params;
};

const redirectTo = (
  origin: string,
  path: string,
  query: Record<string, string>,
) => {
  const url = new URL(`${origin}${path}`);
  Object.entries(query).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );
  return NextResponse.redirect(url.toString(), { status: 303 });
};

const verifyWith = async (
  path: string,
  body: Record<string, string>,
): Promise<{ ok: boolean; paymentId?: string; reason?: string }> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;
  const academyId = cookieStore.get(env.academyIdCookie)?.value;

  const response = await fetch(`${backendApiBaseUrl}${path}`, {
    method: "POST",
    headers: buildInternalBackendHeaders({
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(academyId && { "X-Academy-ID": academyId }),
    }),
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as {
    status?: string;
    data?: { payment_id?: string; reason?: string };
  } | null;

  return data?.status === "ok"
    ? { ok: true, paymentId: data.data?.payment_id }
    : { ok: false, reason: data?.data?.reason };
};

const handle = async (request: NextRequest) => {
  const origin = new URL(request.url).origin;
  const params = await readParams(request);

  // BitPay: trans_id + id_get on the redirect, with payment_id carried on the
  // return URL we handed the gateway. trans_id = -1 means the buyer cancelled.
  if (params.trans_id || params.id_get) {
    const transId = params.trans_id;
    const idGet = params.id_get;
    if (!transId || transId === "-1" || !idGet) {
      return redirectTo(origin, "/payment/failure", {
        reason: transId === "-1" ? "cancelled" : "payment_failed",
      });
    }
    try {
      const result = await verifyWith("/payments/verify/bitpay", {
        payment_id: params.payment_id ?? "",
        trans_id: transId,
        id_get: idGet,
      });
      return result.ok
        ? redirectTo(origin, "/payment/success", {
            payment_id: result.paymentId ?? params.payment_id ?? "",
            reference: transId,
          })
        : redirectTo(origin, "/payment/failure", {
            reason: result.reason ?? "verification_failed",
          });
    } catch {
      return redirectTo(origin, "/payment/failure", { reason: "server_error" });
    }
  }

  // Saman SEP: State=OK plus RefNum, with ResNum carrying our payment id.
  if (params.State || params.ResNum) {
    const refNum = params.RefNum;
    const resNum = params.ResNum;
    if (params.State !== "OK" || !refNum || !resNum) {
      return redirectTo(origin, "/payment/failure", {
        reason:
          params.State === "CanceledByUser" ? "cancelled" : "payment_failed",
      });
    }
    try {
      const result = await verifyWith("/payments/verify/saman", {
        payment_id: resNum,
        ref_num: refNum,
      });
      return result.ok
        ? redirectTo(origin, "/payment/success", {
            payment_id: result.paymentId ?? resNum,
            reference: refNum,
          })
        : redirectTo(origin, "/payment/failure", {
            reason: result.reason ?? "verification_failed",
          });
    } catch {
      return redirectTo(origin, "/payment/failure", { reason: "server_error" });
    }
  }

  const resCode = params.ResCode ?? params.rescode;
  const refId = params.RefId ?? params.refid;
  const paymentId =
    params.payment_id ?? params.SaleOrderId ?? params.clientrefid ?? "";

  if (resCode === undefined || !refId) {
    return redirectTo(origin, "/payment/failure", {
      reason: "invalid_callback",
    });
  }

  // Mellat sends ResCode 17 when the payer cancels at the bank.
  if (resCode !== "0") {
    return redirectTo(origin, "/payment/failure", {
      reason: resCode === "17" ? "cancelled" : "payment_failed",
    });
  }

  try {
    const result = await verifyWith("/payments/verify/mellat", {
      payment_id: paymentId,
      ResCode: resCode,
      RefId: refId,
    });
    return result.ok
      ? redirectTo(origin, "/payment/success", {
          payment_id: result.paymentId ?? paymentId,
          reference: refId,
        })
      : redirectTo(origin, "/payment/failure", {
          reason: result.reason ?? "verification_failed",
        });
  } catch {
    return redirectTo(origin, "/payment/failure", { reason: "server_error" });
  }
};

export const GET = handle;
export const POST = handle;
