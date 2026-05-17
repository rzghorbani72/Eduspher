"use client";

import { GraduationCap, School, Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n/hooks";

type PlatformRoleCardsProps = {
  adminLoginUrl: string;
  teacherRegisterUrl: string;
};

export function PlatformRoleCards({
  adminLoginUrl,
  teacherRegisterUrl,
}: PlatformRoleCardsProps) {
  const { t } = useTranslation();

  const roles = [
    {
      icon: GraduationCap,
      title: t("panel.studentTitle"),
      description: t("panel.studentDescription"),
      cta: null as string | null,
    },
    {
      icon: Users,
      title: t("panel.teacherTitle"),
      description: t("panel.teacherDescription"),
      cta: teacherRegisterUrl,
      ctaLabel: t("panel.teacherCta"),
    },
    {
      icon: School,
      title: t("panel.managerTitle"),
      description: t("panel.managerDescription"),
      cta: adminLoginUrl,
      ctaLabel: t("panel.managerCta"),
    },
  ];

  return (
    <ul className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
      {roles.map((role) => {
        const Icon = role.icon;
        return (
          <li
            key={role.title}
            className="flex flex-col rounded-theme border p-5 shadow-sm"
            style={{
              borderColor: "var(--theme-border-color)",
              backgroundColor: "var(--theme-card-bg)",
              color: "var(--theme-foreground)",
            }}
          >
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--theme-primary)_12%,transparent)]">
              <Icon className="h-5 w-5 text-[var(--theme-primary)]" />
            </span>
            <h2 className="text-lg font-semibold">{role.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 opacity-70">{role.description}</p>
            {role.cta ? (
              <a
                href={role.cta}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[var(--theme-primary)] px-5 text-sm font-semibold text-[var(--theme-on-primary)] transition hover:opacity-90"
              >
                {role.ctaLabel}
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
