"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorePath } from "@/components/providers/store-provider";

/**
 * PayPing v3 redirects the user back here after payment with:
 *   ?refid=<gateway_ref_id>&clientrefid=<our_payment_id>
 *
 * We then call our backend to verify the payment with PayPing API.
 */
export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const buildPath = useStorePath();

  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    refId?: string;
    paymentId?: number;
    amount?: number;
    error?: string;
  } | null>(null);

  // PayPing v3 callback params
  const refId = searchParams.get("refid");          // gateway transaction reference
  const clientRefId = searchParams.get("clientrefid"); // our payment_id (sent as clientRefId)

  useEffect(() => {
    const verifyPayment = async () => {
      if (!refId || !clientRefId) {
        setResult({ success: false, error: "Invalid callback: missing refid or clientrefid" });
        setProcessing(false);
        return;
      }

      const paymentId = Number(clientRefId);
      if (isNaN(paymentId)) {
        setResult({ success: false, error: "Invalid payment reference" });
        setProcessing(false);
        return;
      }

      try {
        const response = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_id: paymentId, ref_id: refId }),
        });

        const data = await response.json();

        if (data.success || data.already_paid) {
          setResult({
            success: true,
            refId: data.ref_id || refId,
            paymentId,
            amount: data.amount,
          });
        } else {
          setResult({ success: false, error: data.error || "Payment verification failed" });
        }
      } catch {
        setResult({ success: false, error: "Failed to verify payment. Please contact support." });
      } finally {
        setProcessing(false);
      }
    };

    verifyPayment();
  }, [refId, clientRefId]);

  if (processing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-600" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Verifying Payment...
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please wait while we confirm your payment with PayPing
          </p>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Payment Successful!
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Your course access has been activated.
              </p>
            </div>
            {result.refId && (
              <div className="rounded-lg border border-theme bg-surface p-4 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Transaction Reference:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{result.refId}</span>
                  </div>
                  {result.amount && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {result.amount.toLocaleString("fa-IR")} ریال
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Button onClick={() => router.push(buildPath("/account"))} className="w-full" size="lg">
              Go to My Courses
            </Button>
            <Button onClick={() => router.push(buildPath("/courses"))} variant="outline" className="w-full">
              Browse More Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Failed</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {result?.error || "An error occurred during payment processing"}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <Button onClick={() => router.push(buildPath("/checkout"))} className="w-full" size="lg">
            Try Again
          </Button>
          <Button onClick={() => router.push(buildPath("/courses"))} variant="outline" className="w-full">
            Browse Courses
          </Button>
        </div>
        <div className="pt-4 border-t border-theme">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            If you believe this is an error, please{" "}
            <Link href={buildPath("/contact")} className="text-sky-600 hover:underline dark:text-sky-400">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
