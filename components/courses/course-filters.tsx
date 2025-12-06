"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition, useRef, useLayoutEffect } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useTranslation } from "@/lib/i18n/hooks";
import type { CategorySummary } from "@/lib/api/types";

interface CourseFiltersProps {
  categories: CategorySummary[];
  initialQuery?: string;
  initialCategoryId?: number;
  initialOrderBy?: string;
  initialIsFree?: boolean;
}

export function CourseFilters({
  categories,
  initialQuery = "",
  initialCategoryId,
  initialOrderBy = "",
  initialIsFree = false,
}: CourseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);
  const shouldRestoreFocusRef = useRef(false);

  const [query, setQuery] = useState(initialQuery ?? "");
  const [categoryId, setCategoryId] = useState(initialCategoryId?.toString() ?? "");
  const [orderBy, setOrderBy] = useState(initialOrderBy ?? "");
  const [isFree, setIsFree] = useState(initialIsFree ?? false);
  const [mounted, setMounted] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  // Check for focus restoration on mount
  useEffect(() => {
    setMounted(true);
    // Check if we should restore focus (from sessionStorage)
    if (typeof window !== 'undefined' && sessionStorage.getItem('restoreSearchFocus') === 'true') {
      shouldRestoreFocusRef.current = true;
      sessionStorage.removeItem('restoreSearchFocus');
    }
  }, []);

  // Only sync from props if user is not actively typing
  useEffect(() => {
    if (!isTypingRef.current) {
      setQuery(initialQuery ?? "");
      setCategoryId(initialCategoryId?.toString() ?? "");
      setOrderBy(initialOrderBy ?? "");
      setIsFree(initialIsFree ?? false);
    }
  }, [initialQuery, initialCategoryId, initialOrderBy, initialIsFree]);

  // Restore focus after URL update completes - use multiple strategies
  useEffect(() => {
    if (shouldRestoreFocusRef.current && mounted) {
      // Use requestAnimationFrame to ensure DOM is ready
      const rafId = requestAnimationFrame(() => {
        const rafId2 = requestAnimationFrame(() => {
          if (searchInputRef.current && document.contains(searchInputRef.current)) {
            searchInputRef.current.focus();
            // Restore cursor position to end of input
            const length = searchInputRef.current.value.length;
            searchInputRef.current.setSelectionRange(length, length);
            shouldRestoreFocusRef.current = false;
          }
        });
        return () => cancelAnimationFrame(rafId2);
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [mounted]);

  // Also try to restore focus when searchParams change (after page re-render)
  useEffect(() => {
    if (shouldRestoreFocusRef.current && mounted) {
      const timer = setTimeout(() => {
        if (searchInputRef.current && document.contains(searchInputRef.current)) {
          searchInputRef.current.focus();
          const length = searchInputRef.current.value.length;
          searchInputRef.current.setSelectionRange(length, length);
          shouldRestoreFocusRef.current = false;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams, mounted]);

  const updateSearchParams = (updates: Record<string, string | number | boolean | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    params.delete("page");

    // Track if input was focused before update - persist to sessionStorage for remounts
    const wasFocused = document.activeElement === searchInputRef.current;
    if (wasFocused) {
      shouldRestoreFocusRef.current = true;
      // Also store in sessionStorage in case component remounts
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('restoreSearchFocus', 'true');
      }
    }

    startTransition(() => {
      // Use replace instead of push to avoid adding to history and maintain focus
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  useEffect(() => {
    const currentQuery = searchParams.get("q") ?? "";
    if (debouncedQuery !== currentQuery) {
      updateSearchParams({ q: debouncedQuery || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    updateSearchParams({ category_id: value || undefined });
  };

  const handleOrderByChange = (value: string) => {
    setOrderBy(value);
    updateSearchParams({ order_by: value || undefined });
  };

  const handleIsFreeChange = (checked: boolean) => {
    setIsFree(checked);
    updateSearchParams({ is_free: checked || undefined });
  };

  const handleClear = () => {
    setQuery("");
    setCategoryId("");
    setOrderBy("");
    setIsFree(false);
    const wasFocused = document.activeElement === searchInputRef.current;
    if (wasFocused) {
      shouldRestoreFocusRef.current = true;
    }
    startTransition(() => {
      router.replace(pathname);
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      <form
        className="grid gap-5 md:grid-cols-[2fr_1fr_1fr] md:items-end"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="q">
            {t("courses.searchCourses")}
          </label>
          <Input
            ref={searchInputRef}
            id="q"
            name="q"
            value={query}
            onChange={(e) => {
              isTypingRef.current = true;
              setQuery(e.target.value);
              // Reset typing flag after a delay
              setTimeout(() => {
                isTypingRef.current = false;
              }, 600);
            }}
            onBlur={() => {
              // Allow prop sync after blur
              setTimeout(() => {
                isTypingRef.current = false;
              }, 100);
            }}
            placeholder={t("courses.searchPlaceholder")}
            disabled={isPending}
            className="transition-all focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary)]/20"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="category_id">
            {t("courses.category")}
          </label>
          <select
            id="category_id"
            name="category_id"
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={isPending}
            className="h-11 w-full rounded-theme border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-all focus-visible:border-[var(--theme-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
          >
            <option value="">{t("courses.allCategories")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="order_by">
            {t("courses.sortBy")}
          </label>
          <select
            id="order_by"
            name="order_by"
            value={orderBy}
            onChange={(e) => handleOrderByChange(e.target.value)}
            disabled={isPending}
            className="h-11 w-full rounded-theme border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-all focus-visible:border-[var(--theme-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
          >
            <option value="">{t("courses.newest")}</option>
            <option value="OLDEST">{t("courses.oldest")}</option>
            <option value="PRICE_LOW_TO_HIGH">{t("courses.priceLowToHigh")}</option>
            <option value="PRICE_HIGH_TO_LOW">{t("courses.priceHighToLow")}</option>
            <option value="UPDATED_DESC">{t("courses.recentlyUpdated")}</option>
          </select>
        </div>
        <div className="md:col-span-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_free"
                name="is_free"
                checked={isFree}
                onChange={(e) => handleIsFreeChange(e.target.checked)}
                disabled={isPending}
                className="h-4 w-4 rounded border-slate-300 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] disabled:opacity-50 dark:border-slate-600 transition-all"
              />
              <label htmlFor="is_free" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t("courses.freeCoursesOnly")}
              </label>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={isPending}
              className="inline-flex h-10 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all hover:scale-105 hover:bg-slate-100 hover:border-[var(--theme-primary)]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:opacity-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              {t("common.clear")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

