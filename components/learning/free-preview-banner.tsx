"use client";

import { Sparkles } from "lucide-react";

import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/hooks";
import { buildAcademyPath } from "@/lib/utils";

/**
 * Shown to a visitor watching a free lesson without owning the course. The free
 * lesson is the sales pitch, so the way to buy has to be on this page.
 */
export function FreePreviewBanner({
  courseId,
  storeSlug,
}: {
  courseId: string;
  storeSlug: string | null;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-bold text-foreground">
            {t("learning.freePreviewTitle")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("learning.freePreviewDescription")}
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link href={buildAcademyPath(storeSlug, `/courses/${courseId}`)}>
          {t("learning.freePreviewCta")}
        </Link>
      </Button>
    </div>
  );
}
