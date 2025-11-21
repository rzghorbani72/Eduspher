"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
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
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId?.toString() ?? "");
  const [orderBy, setOrderBy] = useState(initialOrderBy);
  const [isFree, setIsFree] = useState(initialIsFree);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    setQuery(initialQuery);
    setCategoryId(initialCategoryId?.toString() ?? "");
    setOrderBy(initialOrderBy ?? "");
    setIsFree(initialIsFree);
  }, [initialQuery, initialCategoryId, initialOrderBy, initialIsFree]);

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

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
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
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <form
        className="grid gap-6 md:grid-cols-[2fr_1fr_1fr] md:items-end"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="q">
            Search courses
          </label>
          <Input
            id="q"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description..."
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="category_id">
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={isPending}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="order_by">
            Sort by
          </label>
          <select
            id="order_by"
            name="order_by"
            value={orderBy}
            onChange={(e) => handleOrderByChange(e.target.value)}
            disabled={isPending}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
          >
            <option value="">Newest</option>
            <option value="OLDEST">Oldest</option>
            <option value="PRICE_LOW_TO_HIGH">Price: Low to High</option>
            <option value="PRICE_HIGH_TO_LOW">Price: High to Low</option>
            <option value="UPDATED_DESC">Recently Updated</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_free"
                name="is_free"
                checked={isFree}
                onChange={(e) => handleIsFreeChange(e.target.checked)}
                disabled={isPending}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:opacity-50 dark:border-slate-600"
              />
              <label htmlFor="is_free" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Free courses only
              </label>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={isPending}
              className="inline-flex h-11 items-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:opacity-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              Clear
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

