"use client";

import { motion } from "framer-motion";
import {
  Box,
  CalendarClock,
  Check,
  GraduationCap,
  Package,
  RefreshCw,
  Users,
} from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { toPersianDigits, cn } from "@/lib/utils";
import { formatAccessTerm } from "@/components/courses/curriculum/format";
import type {
  PurchaseKind,
  PurchaseOptionView,
} from "@/lib/courses/purchase-options";

const KIND_ICON: Record<PurchaseKind, typeof Box> = {
  FREE: Package,
  ONE_TIME: Box,
  PAYMENT_PLAN: CalendarClock,
  SUBSCRIPTION: RefreshCw,
  TUTORING: GraduationCap,
  PRIVATE: Users,
};

const KIND_TITLE: Record<PurchaseKind, string> = {
  FREE: "courses.offeringFREE",
  ONE_TIME: "courses.offeringONE_TIME",
  PAYMENT_PLAN: "courses.offeringPAYMENT_PLAN",
  SUBSCRIPTION: "courses.offeringSUBSCRIPTION",
  TUTORING: "courses.offeringTUTORING",
  PRIVATE: "courses.offeringPRIVATE",
};

const KIND_DESC: Record<PurchaseKind, string> = {
  FREE: "courses.methodFreeDesc",
  ONE_TIME: "courses.methodOneTimeDesc",
  PAYMENT_PLAN: "courses.methodInstallmentDesc",
  SUBSCRIPTION: "courses.methodSubscriptionDesc",
  TUTORING: "courses.methodTutoringDesc",
  PRIVATE: "courses.methodPrivateDesc",
};

interface PurchaseOptionRowProps {
  option: PurchaseOptionView;
  selected: boolean;
  onSelect: () => void;
  format: (amount: number) => string;
  language: string;
}

export function PurchaseOptionRow({
  option,
  selected,
  onSelect,
  format,
  language,
}: PurchaseOptionRowProps) {
  const { t } = useTranslation();
  const Icon = KIND_ICON[option.kind];
  const isFree = option.kind === "FREE" || option.price <= 0;

  const facts: string[] = [];
  if (option.installments) {
    facts.push(
      t("courses.installmentSchedule")
        .replace("{count}", toPersianDigits(option.installments.count, language))
        .replace("{days}", toPersianDigits(option.installments.intervalDays, language)),
    );
  }
  if (option.sessionsIncluded) {
    facts.push(
      t("courses.tutoringSessions").replace(
        "{count}",
        toPersianDigits(option.sessionsIncluded, language),
      ),
    );
  }
  if (option.tutorName) facts.push(option.tutorName);
  facts.push(formatAccessTerm(option.accessDurationDays, language, t));

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border p-3.5 text-start transition-all duration-200",
        selected ? "cd-method-active" : "cd-method",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors",
            selected
              ? "bg-(--theme-primary) text-white"
              : "bg-(--theme-surface) text-(--theme-muted)",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-extrabold text-(--theme-foreground)">
              {option.title || t(KIND_TITLE[option.kind])}
            </span>
            {option.discountPercent ? (
              <span className="cd-badge-save rounded-full px-2 py-0.5 text-[11px] font-bold">
                {toPersianDigits(option.discountPercent, language)}%
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-(--theme-muted)">
            {option.description || t(KIND_DESC[option.kind])}
          </p>
        </div>

        <span
          className={cn(
            "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
            selected ? "border-(--theme-primary)" : "border-(--theme-border-strong)",
          )}
        >
          {selected && (
            <motion.span
              layoutId="cd-radio-dot"
              className="h-2.5 w-2.5 rounded-full bg-(--theme-primary)"
            />
          )}
        </span>
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          <div className="mt-4 border-t border-(--theme-border-color) pt-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="cd-price text-2xl font-black text-(--theme-foreground)">
                {isFree ? t("courses.free") : format(option.price)}
              </span>
              {option.installments && (
                <span className="text-sm text-(--theme-muted)">
                  {t("courses.perInstallment")}
                </span>
              )}
              {option.originalPrice && (
                <span className="cd-price text-sm font-semibold text-(--theme-muted) line-through">
                  {format(option.originalPrice)}
                </span>
              )}
            </div>

            <ul className="mt-3 space-y-2">
              {facts.map((fact) => (
                <li
                  key={fact}
                  className="flex items-center gap-2 text-[13px] text-(--theme-foreground)"
                >
                  <Check className="h-4 w-4 shrink-0 text-(--theme-primary)" />
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </button>
  );
}
