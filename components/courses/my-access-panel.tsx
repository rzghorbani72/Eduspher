"use client";

import {
  ArrowLeft,
  GraduationCap,
  KeyRound,
  Package,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { formatDate } from "@/lib/utils";
import type { CourseAccessRow, CourseAccessType } from "@/lib/api/account-types";
import type { PurchaseOptionView } from "@/lib/courses/purchase-options";
import { accessTypeLabelKey } from "@/lib/courses/access-type";
import {
  accessTargetFor,
  accessTargetForType,
} from "@/lib/courses/access-target";

const ACCESS_ICON: Record<CourseAccessType, LucideIcon> = {
  STAFF_GRANT: KeyRound,
  ONE_TIME: PlayCircle,
  BUNDLE: Package,
  SUBSCRIPTION: RefreshCw,
  TUTORING: GraduationCap,
};

interface MyAccessPanelProps {
  /** Canonical how + until, from GET /v1/enrollments/my-access. */
  access: CourseAccessRow | null;
  /** Owned shop ways — extra entry points when they lead somewhere else. */
  owned: PurchaseOptionView[];
  learnHref: string;
  liveClassesHref: string;
  tutoringHref: string;
}

/**
 * Shows how this student got into the course and until when. Extra owned
 * offerings that open a different place (live class, tutoring) stay listed
 * as shortcuts.
 */
export function MyAccessPanel({
  access,
  owned,
  learnHref,
  liveClassesHref,
  tutoringHref,
}: MyAccessPanelProps) {
  const { t, language } = useTranslation();
  const hrefs = { learnHref, liveClassesHref, tutoringHref };

  const accessType = access?.access_type ?? "ONE_TIME";
  const accessTarget = access ? accessTargetForType(accessType, hrefs) : null;
  const extraOwned = access
    ? owned.filter((option) => accessTargetFor(option, hrefs).href !== accessTarget?.href)
    : owned;

  if (!access && extraOwned.length === 0) return null;

  const untilLabel = (expiresAt: string | null) =>
    expiresAt
      ? t("courses.accessUntil").replace("{date}", formatDate(expiresAt, language))
      : t("courses.lifetimeAccess");

  return (
    <div className="border-b border-theme bg-(--theme-primary)/8 px-5 py-4">
      <p className="text-xs font-black text-(--theme-foreground)">
        {t("courses.myAccessTitle")}
      </p>

      <ul className="mt-3 space-y-2">
        {access && accessTarget ? (
          <AccessLink
            href={accessTarget.href}
            icon={ACCESS_ICON[accessType]}
            title={t(accessTypeLabelKey(accessType))}
            subtitle={untilLabel(access.expires_at)}
          />
        ) : null}

        {extraOwned.map((option) => {
          const target = accessTargetFor(option, hrefs);
          return (
            <AccessLink
              key={option.key}
              href={target.href}
              icon={target.icon}
              title={option.title ?? t(`courses.offering${option.kind}`)}
              subtitle={
                option.accessExpiresAt
                  ? untilLabel(option.accessExpiresAt)
                  : t(target.actionKey)
              }
            />
          );
        })}
      </ul>
    </div>
  );
}

function AccessLink({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <li>
      <a
        href={href}
        className="flex items-center gap-3 rounded-xl border border-theme bg-card px-3.5 py-3 transition-colors hover:bg-surface"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-(--theme-primary)/12 text-(--theme-primary)">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold text-(--theme-foreground)">
            {title}
          </span>
          <span className="block text-[11px] text-muted">{subtitle}</span>
        </span>
        <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180 text-(--theme-primary)" />
      </a>
    </li>
  );
}
