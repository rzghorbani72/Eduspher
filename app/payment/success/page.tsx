"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, Receipt, CreditCard, Calendar, Hash, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSchoolPath } from "@/components/providers/school-provider";
import { formatCurrencyWithSchool } from "@/lib/utils";

interface PaymentDetails {
  id: number;
  amount: number;
  currency: string;
  status: string;
  gateway?: string;
  gateway_id?: string;
  transaction_id?: string;
  reference_id?: string;
  created_at: string;
  gateway_responses?: Array<{
    id: number;
    response_type: string;
    status: string;
    transaction_id?: string;
    reference_id?: string;
    error_code?: string;
    error_message?: string;
    amount?: number;
    currency?: string;
    fee_amount?: number;
    raw_response?: Record<string, any>;
    processed_data?: Record<string, any>;
    gateway?: {
      name: string;
      display_name: string;
    };
    created_at: string;
  }>;
  transaction?: {
    id: number;
    gateway: string;
    gateway_id: string;
    amount: number;
    currency: string;
    status: string;
    error_message?: string;
  };
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const buildPath = useSchoolPath();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [school, setSchool] = useState<any>(null);

  // Bank gateway parameters (common across different gateways)
  const paymentId = searchParams.get("payment_id") || searchParams.get("PaymentId") || searchParams.get("paymentId");
  const transactionId = searchParams.get("transaction_id") || searchParams.get("TransactionId") || searchParams.get("TransId") || searchParams.get("transId") || searchParams.get("Authority");
  const reference = searchParams.get("reference") || searchParams.get("Reference") || searchParams.get("RefNum") || searchParams.get("refNum");
  const status = searchParams.get("status") || searchParams.get("Status") || searchParams.get("ResCode");
  const message = searchParams.get("message") || searchParams.get("Message");
  const authCode = searchParams.get("auth_code") || searchParams.get("AuthCode") || searchParams.get("authCode");
  const orderId = searchParams.get("order_id") || searchParams.get("OrderId") || searchParams.get("orderId");
  const basketId = searchParams.get("basket_id") || searchParams.get("BasketId") || searchParams.get("basketId");
  
  // Additional gateway-specific parameters
  const cardHash = searchParams.get("card_hash") || searchParams.get("CardHash");
  const cardPan = searchParams.get("card_pan") || searchParams.get("CardPan") || searchParams.get("cardPan");
  const rrn = searchParams.get("rrn") || searchParams.get("RRN");
  const traceNo = searchParams.get("trace_no") || searchParams.get("TraceNo");
  const hostRefNum = searchParams.get("host_ref_num") || searchParams.get("HostRefNum");
  const procReturnCode = searchParams.get("proc_return_code") || searchParams.get("ProcReturnCode");
  
  // Store all URL params for display
  const urlParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    urlParams[key] = value;
  });

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      // If payment_id exists, try to fetch details from backend
      if (paymentId) {
        try {
          const response = await fetch(`/api/payment/${paymentId}`, {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            setPaymentDetails(data.data);
          }
        } catch (err) {
          // Silently fail - we'll show URL params instead
        }
      }

      // Fetch school for currency formatting
      try {
        const schoolResponse = await fetch("/api/school/current", {
          credentials: "include",
        });
        if (schoolResponse.ok) {
          const schoolData = await schoolResponse.json();
          setSchool(schoolData.data);
        }
      } catch (err) {
        // Silently fail - currency formatting will use defaults
      }

      setLoading(false);
    };

    fetchPaymentDetails();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-600" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Loading Payment Details...
          </h2>
        </div>
      </div>
    );
  }

  // If there's an error and no URL params, show error state
  if (error && Object.keys(urlParams).length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Payment Details Not Found
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {error || "Unable to load payment details"}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <Button onClick={() => router.push(buildPath("/account"))} className="w-full" size="lg">
              Go to My Account
            </Button>
            <Button
              onClick={() => router.push(buildPath("/courses"))}
              variant="outline"
              className="w-full"
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get the latest callback response (most relevant for display)
  const latestResponse = paymentDetails?.gateway_responses?.find(
    (r) => r.response_type === "CALLBACK"
  ) || paymentDetails?.gateway_responses?.[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Payment Successful!
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
              Your payment has been processed successfully
            </p>
          </div>
        </div>

        {/* Payment Details Card */}
        {paymentDetails && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Receipt className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Payment Details
              </h2>
            </div>

            <div className="space-y-4">
              {/* Amount */}
              {paymentDetails.amount && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Amount Paid</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatCurrencyWithSchool(paymentDetails.amount, school)}
                  </span>
                </div>
              )}

              {/* Payment ID */}
              {paymentDetails.id && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Payment ID
                  </span>
                  <span className="font-mono text-sm text-slate-900 dark:text-white">
                    #{paymentDetails.id}
                  </span>
                </div>
              )}

              {/* Transaction ID */}
              {(latestResponse?.transaction_id || paymentDetails?.transaction_id || transactionId) && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Transaction ID
                  </span>
                  <span className="font-mono text-sm text-slate-900 dark:text-white break-all text-right max-w-[60%]">
                    {latestResponse?.transaction_id || paymentDetails?.transaction_id || transactionId}
                  </span>
                </div>
              )}

              {/* Reference ID */}
              {(latestResponse?.reference_id || paymentDetails?.reference_id || reference) && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Reference ID
                  </span>
                  <span className="font-mono text-sm text-slate-900 dark:text-white break-all text-right max-w-[60%]">
                    {latestResponse?.reference_id || paymentDetails?.reference_id || reference}
                  </span>
                </div>
              )}

              {/* Authorization Code */}
              {authCode && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Authorization Code
                  </span>
                  <span className="font-mono text-sm text-slate-900 dark:text-white break-all text-right max-w-[60%]">
                    {authCode}
                  </span>
                </div>
              )}

              {/* RRN */}
              {rrn && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    RRN
                  </span>
                  <span className="font-mono text-sm text-slate-900 dark:text-white break-all text-right max-w-[60%]">
                    {rrn}
                  </span>
                </div>
              )}

              {/* Host Reference Number */}
              {hostRefNum && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Host Reference
                  </span>
                  <span className="font-mono text-sm text-slate-900 dark:text-white break-all text-right max-w-[60%]">
                    {hostRefNum}
                  </span>
                </div>
              )}

              {/* Gateway */}
              {paymentDetails.gateway && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Payment Gateway</span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    {latestResponse?.gateway?.display_name || latestResponse?.gateway?.name || paymentDetails.gateway}
                  </span>
                </div>
              )}

              {/* Date */}
              {paymentDetails.created_at && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Payment Date
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {new Date(paymentDetails.created_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* URL Parameters from Bank (if available and different from payment details) */}
        {Object.keys(urlParams).length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Bank Gateway Parameters
            </h2>
            <div className="space-y-2">
              {Object.entries(urlParams).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm py-2 border-b border-slate-200 dark:border-slate-800 last:border-0">
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">
                    {key}
                  </span>
                  <span className="text-slate-900 dark:text-white font-mono text-xs break-all ml-4 text-right max-w-[60%]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gateway Response Details (if available) */}
        {latestResponse && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Gateway Response Details
            </h2>

            <div className="space-y-3">
              {latestResponse.status && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Status</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {latestResponse.status}
                  </span>
                </div>
              )}

              {latestResponse.fee_amount && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Gateway Fee</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatCurrencyWithSchool(latestResponse.fee_amount, school)}
                  </span>
                </div>
              )}

              {/* Processed Data */}
              {latestResponse.processed_data && Object.keys(latestResponse.processed_data).length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Additional Information
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(latestResponse.processed_data).map(([key, value]) => {
                      if (value === null || value === undefined) return null;
                      return (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400 capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-slate-900 dark:text-white font-mono">
                            {String(value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={() => router.push(buildPath("/account"))} className="w-full" size="lg">
            Go to My Account
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

