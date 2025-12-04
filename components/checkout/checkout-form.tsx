"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { processCheckout } from "@/app/actions/checkout";
import { validateVoucher } from "@/app/actions/voucher";
import type { CourseSummary } from "@/lib/api/types";
import { useSchoolPath } from "@/components/providers/school-provider";
import { CheckCircle, Loader2, AlertCircle, X } from "lucide-react";
import { formatCurrencyWithSchool } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/hooks";

interface CheckoutFormProps {
  course: CourseSummary;
  user: {
    id: number;
    email: string | null;
    phone_number: string | null;
    name: string;
    display_name?: string;
    currentProfile?: {
      id: number;
      schoolId: number;
      role: string;
      displayName: string;
    };
    currentSchool?: {
      id: number;
      name: string;
      slug: string;
      domain: string | null;
      currency: string;
      currency_symbol: string;
    } | null;
  };
  session: {
    userId: number;
    profileId: number;
    schoolId: number | null;
  };
  onDiscountChange?: (discount: {
    discount_amount: number;
    final_amount: number;
  } | null) => void;
}

export function CheckoutForm({ course, user, session, onDiscountChange }: CheckoutFormProps) {
  const router = useRouter();
  const buildPath = useSchoolPath();
  const { t, language } = useTranslation();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [discount, setDiscount] = useState<{
    discount_amount: number;
    final_amount: number;
    discount_code_id: number;
  } | null>(null);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError(t("checkout.pleaseEnterVoucher"));
      return;
    }

    if (course.is_free) {
      setVoucherError(t("checkout.voucherNotForFreeCourses"));
      return;
    }

    setVoucherError(null);
    setValidatingVoucher(true);

    try {
      const result = await validateVoucher({
        code: voucherCode.trim(),
        amount: Math.round(course.price * 100),
      });

      if (result.success && result.discount_amount !== undefined) {
        const discountData = {
          discount_amount: result.discount_amount,
          final_amount: result.final_amount ?? Math.round(course.price * 100) - result.discount_amount,
          discount_code_id: result.discount_code_id ?? 0,
        };
        setDiscount(discountData);
        setVoucherError(null);
        if (onDiscountChange) {
          onDiscountChange({
            discount_amount: discountData.discount_amount,
            final_amount: discountData.final_amount,
          });
        }
      } else {
        setVoucherError(result.error || t("checkout.invalidVoucher"));
        setDiscount(null);
        if (onDiscountChange) {
          onDiscountChange(null);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("checkout.voucherValidationFailed");
      setVoucherError(errorMessage);
      setDiscount(null);
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setDiscount(null);
    setVoucherError(null);
    if (onDiscountChange) {
      onDiscountChange(null);
    }
  };

  const handleCheckout = () => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const result = await processCheckout({
          course_id: course.id,
          user_id: user.id,
          profile_id: session.profileId,
          voucher_code: discount ? voucherCode.trim() : undefined,
        });

        if (result.success) {
          // If bank redirect URL is provided, redirect to bank payment
          if (result.bankRedirectUrl) {
            window.location.href = result.bankRedirectUrl;
            return;
          }
          
          // For free courses or direct enrollment
          setSuccess(true);
          setTimeout(() => {
            router.push(buildPath(`/courses/${course.id}`));
            router.refresh();
          }, 1500);
        } else {
          setError(result.error || t("checkout.checkoutFailed"));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t("common.error");
        setError(errorMessage);
      }
    });
  };

  const finalPrice = discount
    ? discount.final_amount / 100
    : course.price;

  if (success) {
    return (
      <div className="mt-6 space-y-4 rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/70">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100">
              {t("checkout.enrollmentSuccessful")}
            </h4>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              {t("checkout.redirectingToCourse")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t("checkout.enrollingAs")}
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {user.display_name || user.currentProfile?.displayName || user.name}
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {user.email || user.phone_number}
          </div>
        </div>

        {!course.is_free && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-white">
              {t("checkout.voucherCode")}
            </label>
            {discount ? (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/70">
                <div className="flex-1">
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">
                    {voucherCode.toUpperCase()}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    {t("checkout.discountApplied")}: {formatCurrencyWithSchool(discount.discount_amount / 100, user.currentSchool || null, undefined, language)}
                  </div>
                </div>
                <button
                  onClick={handleRemoveVoucher}
                  className="rounded-full p-1 text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-900"
                  aria-label={t("checkout.removeVoucher")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t("checkout.enterVoucherCode")}
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    setVoucherError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleApplyVoucher();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyVoucher}
                  disabled={validatingVoucher || !voucherCode.trim()}
                  loading={validatingVoucher}
                  size="md"
                >
                  {t("checkout.apply")}
                </Button>
              </div>
            )}
            {voucherError && (
              <p className="text-xs text-red-600 dark:text-red-400">{voucherError}</p>
            )}
          </div>
        )}

        <Button
          onClick={handleCheckout}
          className="w-full"
          size="lg"
          loading={pending}
          disabled={pending || success}
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("checkout.processing")}
            </>
          ) : course.is_free ? (
            t("checkout.completeEnrollment")
          ) : (
            `${t("checkout.completePurchase")} - ${formatCurrencyWithSchool(finalPrice, user.currentSchool || null, undefined, language)}`
          )}
        </Button>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          {t("checkout.termsAgreement")}
        </p>
      </div>
    </div>
  );
}




