"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BankRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("payment_id");
  const basketId = searchParams.get("basket_id");
  const amount = searchParams.get("amount");
  const callbackUrl = searchParams.get("callback_url");

  useEffect(() => {
    // Simulate bank payment processing
    // In production, this would be handled by the bank's payment gateway
    const timer = setTimeout(() => {
      // Simulate successful payment (80% success rate for demo)
      const isSuccess = Math.random() > 0.2;
      
      const resultUrl = new URL(callbackUrl || "/payment/callback");
      resultUrl.searchParams.set("payment_id", paymentId || "");
      resultUrl.searchParams.set("basket_id", basketId || "");
      resultUrl.searchParams.set("amount", amount || "");
      resultUrl.searchParams.set("status", isSuccess ? "success" : "failed");
      resultUrl.searchParams.set("transaction_id", `TXN${Date.now()}`);
      resultUrl.searchParams.set("reference", `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
      
      if (isSuccess) {
        resultUrl.searchParams.set("message", "Payment successful");
      } else {
        resultUrl.searchParams.set("message", "Payment failed");
        resultUrl.searchParams.set("error_code", "PAYMENT_DECLINED");
      }

      window.location.href = resultUrl.toString();
    }, 2000);

    return () => clearTimeout(timer);
  }, [paymentId, basketId, amount, callbackUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-600" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Redirecting to Bank...
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please wait while we process your payment
        </p>
      </div>
    </div>
  );
}

