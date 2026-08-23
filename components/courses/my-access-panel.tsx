"use client";

import { ArrowLeft } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { formatDate } from "@/lib/utils";
import type { PurchaseOptionView } from "@/lib/courses/purchase-options";
import { accessTargetFor } from "@/lib/courses/access-target";

interface MyAccessPanelProps {
  /** Only the ways this student actually holds. */
  owned: PurchaseOptionView[];
  learnHref: string;
  liveClassesHref: string;
  tutoringHref: string;
}

/**
 * A student can hold several ways into the same course — recorded lessons, the
 * live class, private tutoring — and each is entered somewhere different. This
 * lists what they hold and takes them straight into that way.
 */
export function MyAccessPanel({
  owned,
  learnHref,
  liveClassesHref,
  tutoringHref,
}: MyAccessPanelProps) {
  const { t, language } = useTranslation();

  if (owned.length === 0) return null;

  const targetFor = (option: PurchaseOptionView) =>
    accessTargetFor(option, { learnHref, liveClassesHref, tutoringHref });

  return (
    <div className="border-b border-theme bg-(--theme-primary)/8 px-5 py-4">
      <p className="text-xs font-black text-(--theme-foreground)">
        {t("courses.myAccessTitle")}
      </p>

      <ul className="mt-3 space-y-2">
        {owned.map((option) => {
          const target = targetFor(option);
          const Icon = target.icon;
          return (
            <li key={option.key}>
              <a
                href={target.href}
                className="flex items-center gap-3 rounded-xl border border-theme bg-card px-3.5 py-3 transition-colors hover:bg-surface"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-(--theme-primary)/12 text-(--theme-primary)">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-(--theme-foreground)">
                    {option.title ?? t(`courses.offering${option.kind}`)}
                  </span>
                  <span className="block text-[11px] text-muted">
                    {option.accessExpiresAt
                      ? t("courses.accessUntil").replace(
                          "{date}",
                          formatDate(option.accessExpiresAt, language),
                        )
                      : t(target.actionKey)}
                  </span>
                </span>
                <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180 text-(--theme-primary)" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
