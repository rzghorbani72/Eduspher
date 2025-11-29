"use client";

import { useState, useEffect } from "react";
import { CheckoutForm } from "./checkout-form";
import { useTranslation } from "@/lib/i18n/hooks";
import { formatCurrencyWithSchool } from "@/lib/utils";
import type { CourseSummary } from "@/lib/api/types";

interface OrderSummaryProps {
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

export function OrderSummary({ course, user, session, onDiscountChange }: OrderSummaryProps) {
  const { t } = useTranslation();
  const [discount, setDiscount] = useState<{
    discount_amount: number;
    final_amount: number;
  } | null>(null);

  useEffect(() => {
    if (onDiscountChange) {
      onDiscountChange(discount);
    }
  }, [discount, onDiscountChange]);

  const finalPrice = discount ? discount.final_amount / 100 : course.price;
  const discountAmount = discount ? discount.discount_amount / 100 : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {t("checkout.orderSummary")}
      </h3>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-300">{t("courses.title")}</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {formatCurrencyWithSchool(course.price, user?.currentSchool || null)}
          </span>
        </div>
        {course.original_price && course.original_price > course.price && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">{t("courses.originalPrice")}</span>
            <span className="text-slate-500 line-through dark:text-slate-400">
              {formatCurrencyWithSchool(course.original_price, user?.currentSchool || null)}
            </span>
          </div>
        )}
        {discount && discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
            <span>{t("checkout.discount")}</span>
            <span className="font-medium">
              -{formatCurrencyWithSchool(discountAmount, user?.currentSchool || null)}
            </span>
          </div>
        )}
        <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">{t("checkout.total")}</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrencyWithSchool(finalPrice, user?.currentSchool || null)}
            </span>
          </div>
        </div>
      </div>
      <CheckoutForm 
        course={course} 
        user={user} 
        session={session}
        onDiscountChange={setDiscount}
      />
    </div>
  );
}

