"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

import { useTranslation } from "@/lib/i18n/hooks";
import type { CategorySummary } from "@/lib/api/types";

interface CourseFiltersProps {
  categories: CategorySummary[];
  initialCategoryId?: string;
  initialOrderBy?: string;
  initialIsFree?: boolean;
}

export function CourseFilters({
  categories,
  initialCategoryId,
  initialOrderBy = "",
  initialIsFree = false,
}: CourseFiltersProps) {
  const categoryList = Array.isArray(categories) ? categories : [];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const update = (updates: Record<string, string | number | boolean | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === false) params.delete(key);
      else params.set(key, String(value));
    });
    params.delete("page");
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  };

  const pillClass = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-[13.5px] font-bold transition-all disabled:opacity-50 ${
      active
        ? "bg-(--cc-brand) text-(--theme-on-primary) border-transparent"
        : "border-(--cc-bd) text-(--cc-ink-2) hover:border-(--cc-brand) hover:text-(--cc-ink)"
    }`;

  return (
    <section className="sticky top-[73px] z-40 flex flex-wrap items-center gap-3.5 rounded-[18px] border bg-(--cc-card) border-(--cc-bd) px-4 py-3.5 shadow-(--cc-sh-sm)">
      <div className="flex flex-wrap items-center gap-2">
        <span className="me-0.5 text-[13px] font-bold text-(--cc-ink-3)">{t("courses.category")}:</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => update({ category_id: undefined })}
          className={pillClass(!initialCategoryId)}
        >
          {t("courses.all")}
        </button>
        {categoryList.map((category) => (
          <button
            key={category.id}
            type="button"
            disabled={isPending}
            onClick={() => update({ category_id: category.id })}
            className={pillClass(initialCategoryId === category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-(--cc-bd)" />

      <button
        type="button"
        disabled={isPending}
        onClick={() => update({ is_free: !initialIsFree })}
        className={`inline-flex items-center gap-2 ${pillClass(initialIsFree)}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
        {t("courses.freeCoursesOnly")}
      </button>

      <div className="ms-auto flex items-center gap-2">
        <span className="text-[13px] font-bold text-(--cc-ink-3)">{t("courses.sortBy")}:</span>
        <select
          aria-label={t("courses.sortBy")}
          value={initialOrderBy}
          disabled={isPending}
          onChange={(e) => update({ order_by: e.target.value || undefined })}
          className="cursor-pointer rounded-[10px] border bg-(--cc-card) border-(--cc-bd) px-3 py-2 text-[13.5px] font-bold text-(--cc-ink) outline-none disabled:opacity-50"
        >
          <option value="">{t("courses.newest")}</option>
          <option value="OLDEST">{t("courses.oldest")}</option>
          <option value="PRICE_LOW_TO_HIGH">{t("courses.priceLowToHigh")}</option>
          <option value="PRICE_HIGH_TO_LOW">{t("courses.priceHighToLow")}</option>
          <option value="UPDATED_DESC">{t("courses.recentlyUpdated")}</option>
        </select>
      </div>
    </section>
  );
}
