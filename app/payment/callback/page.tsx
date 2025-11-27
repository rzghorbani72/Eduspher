"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSchoolPath } from "@/components/providers/school-provider";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const buildPath = useSchoolPath();
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const status = searchParams.get("status");
  const paymentId = searchParams.get("payment_id");
  const basketId = searchParams.get("basket_id");
  const transactionId = searchParams.get("transaction_id");
  const reference = searchParams.get("reference");
  const errorCode = searchParams.get("error_code");
  const message = searchParams.get("message");

  useEffect(() => {
    const processPayment = async () => {
      if (status === "success") {
        try {
          // Call backend to verify and complete payment
          const response = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payment_id: paymentId,
              basket_id: basketId,
              transaction_id: transactionId,
              reference: reference,
            }),
          });

          const data = await response.json();
          
          if (data.success) {
            setResult({
              success: true,
              message: message || "Payment completed successfully",
            });
          } else {
            setResult({
              success: false,
              error: data.error || "Payment verification failed",
            });
          }
        } catch (error) {
          setResult({
            success: false,
            error: "Failed to verify payment",
          });
        }
      } else {
        setResult({
          success: false,
          error: message || "Payment failed",
        });
      }
      setProcessing(false);
    };

    if (status) {
      processPayment();
    } else {
      setResult({
        success: false,
        error: "Invalid payment status",
      });
      setProcessing(false);
    }
  }, [status, paymentId, basketId, transactionId, reference, message]);

  if (processing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-600" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Processing Payment...
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please wait while we verify your payment
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
                {result.message}
              </p>
            </div>
            {transactionId && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Transaction ID:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{transactionId}</span>
                  </div>
                  {reference && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Reference:</span>
                      <span className="font-mono text-slate-900 dark:text-white">{reference}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => router.push(buildPath("/account"))}
              className="w-full"
              size="lg"
            >
              Go to My Courses
            </Button>
            <Button
              onClick={() => router.push(buildPath("/courses"))}
              variant="outline"
              className="w-full"
            >
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Payment Failed
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {result?.error || "An error occurred during payment processing"}
            </p>
            {errorCode && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Error Code: {errorCode}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <Button
            onClick={() => router.push(buildPath("/checkout"))}
            className="w-full"
            size="lg"
          >
            Try Again
          </Button>
          <Button
            onClick={() => router.push(buildPath("/courses"))}
            variant="outline"
            className="w-full"
          >
            Browse Courses
          </Button>
        </div>
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            If you believe this is an error, please{" "}
            <Link
              href={buildPath("/contact")}
              className="text-sky-600 hover:underline dark:text-sky-400"
            >
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

