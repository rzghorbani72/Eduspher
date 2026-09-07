import { KeyRound } from "lucide-react";

import Link from "@/components/ui/link";
import type { CourseAccessRow } from "@/lib/api/account-types";
import type { LanguageCode } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/server-translations";
import { accessTypeLabelKey } from "@/lib/courses/access-type";
import { buildAcademyPath, formatDate } from "@/lib/utils";

interface ExtraAccessListProps {
  rows: readonly CourseAccessRow[];
  storeSlug: string | null;
  language: LanguageCode;
}

/**
 * Courses reachable through a subscription, tutoring term or group grant. They
 * have no Enrollment row and therefore no progress, so they get a compact row
 * rather than the full progress card.
 */
export function ExtraAccessList({
  rows,
  storeSlug,
  language,
}: ExtraAccessListProps) {
  const translate = (key: string) => t(key, language);

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-(--theme-foreground)">
        <KeyRound
          className="size-4 text-(--theme-primary-ink)"
          aria-hidden="true"
        />
        {translate("account.accesses")}
      </h2>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.course_id}>
            <Link
              href={buildAcademyPath(storeSlug, `/learn/${row.course_id}`)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-theme bg-card p-4 transition hover:border-(--theme-primary)/40"
            >
              <span className="min-w-0">
                <span className="block font-medium text-(--theme-foreground)">
                  {row.title}
                </span>
                <span className="block text-xs text-muted">
                  {translate(accessTypeLabelKey(row.access_type))}
                </span>
              </span>
              <span className="text-sm text-muted">
                {row.expires_at
                  ? `${translate("account.expires")}: ${formatDate(row.expires_at, language)}`
                  : translate("courses.lifetimeAccess")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
