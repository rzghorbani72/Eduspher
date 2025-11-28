"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { XCircle, Loader2, Receipt, CreditCard, Calendar, Hash, AlertTriangle } from "lucide-react";
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

export default function PaymentFailurePage() {
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
  const errorCode = searchParams.get("error_code") || searchParams.get("ErrorCode") || searchParams.get("errorCode") || searchParams.get("ResCode");
  const errorMessage = searchParams.get("error_message") || searchParams.get("ErrorMessage") || searchParams.get("errorMessage") || searchParams.get("message") || searchParams.get("Message") || searchParams.get("ErrMsg");
  const orderId = searchParams.get("order_id") || searchParams.get("OrderId") || searchParams.get("orderId");
  const basketId = searchParams.get("basket_id") || searchParams.get("BasketId") || searchParams.get("basketId");
  
  // Additional gateway-specific parameters
  const procReturnCode = searchParams.get("proc_return_code") || searchParams.get("ProcReturnCode");
  const hostRefNum = searchParams.get("host_ref_num") || searchParams.get("HostRefNum");
  
  // Store all URL params for display
  const urlParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    urlParams[key] = value;
  });

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      // If payment_id exists, try to fetch details
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

  // Get the latest callback response (most relevant for display)
  const latestResponse = paymentDetails?.gateway_responses?.find(
    (r) => r.response_type === "CALLBACK"
  ) || paymentDetails?.gateway_responses?.[0];

  // Get error details from response or URL params
  const displayErrorCode = latestResponse?.error_code || errorCode;
  const displayErrorMessage =
    latestResponse?.error_message || errorMessage || "Payment processing failed";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Failure Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Payment Failed
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
              {displayErrorMessage}
            </p>
            {displayErrorCode && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                Error Code: {displayErrorCode}
              </p>
            )}
          </div>
        </div>

        {/* Payment Details Card (if available) */}
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
                  <span className="text-slate-600 dark:text-slate-400">Amount</span>
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
              {(latestResponse?.transaction_id || paymentDetails.transaction_id || transactionId) && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Transaction ID
                  </span>
                  <span className="font-mono text-sm text-slate-900 dark:text-white">
                    {latestResponse?.transaction_id || paymentDetails.transaction_id || transactionId}
                  </span>
                </div>
              )}

              {/* Reference ID */}
              {(latestResponse?.reference_id || paymentDetails.reference_id || reference) && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Reference ID
                  </span>
                  <span className="font-mono text-sm text-slate-900 dark:text-white">
                    {latestResponse?.reference_id || paymentDetails.reference_id || reference}
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

        {/* Gateway Error Details (if available) */}
        {latestResponse && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-red-200 dark:border-red-900/30 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Gateway Response Details
              </h2>
            </div>

            <div className="space-y-3">
              {latestResponse.status && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Status</span>
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    {latestResponse.status}
                  </span>
                </div>
              )}

              {latestResponse.error_code && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Error Code</span>
                  <span className="text-slate-900 dark:text-white font-mono">
                    {latestResponse.error_code}
                  </span>
                </div>
              )}

              {latestResponse.error_message && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 text-sm">Error Message</span>
                  <p className="mt-1 text-slate-900 dark:text-white">{latestResponse.error_message}</p>
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

        {/* URL Parameters from Bank (always show if available) */}
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
                  <span className={`font-mono text-xs break-all ml-4 text-right max-w-[60%] ${
                    key.toLowerCase().includes('error') || key.toLowerCase().includes('code') && value !== '0' && value !== '00'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={() => router.push(buildPath("/checkout"))} className="w-full" size="lg">
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

        {/* Support Link */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
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

