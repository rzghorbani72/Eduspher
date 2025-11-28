"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { CategorySummary } from "@/lib/api/types";

interface ProductFiltersProps {
  categories: CategorySummary[];
  initialQuery?: string;
  initialCategoryId?: number;
  initialOrderBy?: string;
  initialProductType?: 'DIGITAL' | 'PHYSICAL';
}

export function ProductFilters({
  categories,
  initialQuery = "",
  initialCategoryId,
  initialOrderBy = "",
  initialProductType,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  // Initialize state from URL params on mount to avoid hydration mismatch
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [productType, setProductType] = useState("");

  const debouncedQuery = useDebounce(query, 500);

  // Set mounted state and initialize from props/URL on client side only
  useEffect(() => {
    setMounted(true);
    const urlQuery = searchParams.get("q") ?? initialQuery;
    const urlCategoryId = searchParams.get("category_id") ?? (initialCategoryId?.toString() ?? "");
    const urlOrderBy = searchParams.get("order_by") ?? initialOrderBy;
    const urlProductType = searchParams.get("product_type") ?? (initialProductType ?? "");
    
    setQuery(urlQuery);
    setCategoryId(urlCategoryId);
    setOrderBy(urlOrderBy);
    setProductType(urlProductType);
  }, []); // Only run on mount

  // Update state when props change (for navigation)
  useEffect(() => {
    if (mounted) {
      setQuery(initialQuery);
      setCategoryId(initialCategoryId?.toString() ?? "");
      setOrderBy(initialOrderBy ?? "");
      setProductType(initialProductType ?? "");
    }
  }, [mounted, initialQuery, initialCategoryId, initialOrderBy, initialProductType]);

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

  const handleProductTypeChange = (value: string) => {
    setProductType(value);
    updateSearchParams({ product_type: value || undefined });
  };

  const handleClear = () => {
    setQuery("");
    setCategoryId("");
    setOrderBy("");
    setProductType("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
        <form className="grid gap-5 md:grid-cols-[2fr_1fr_1fr_1fr] md:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="q">
              Search products
            </label>
            <Input
              id="q"
              name="q"
              placeholder="Search by title, description..."
              disabled
              className="transition-all focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary)]/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="category_id">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              disabled
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-all focus-visible:border-[var(--theme-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
            >
              <option value="">All categories</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="product_type">
              Type
            </label>
            <select
              id="product_type"
              name="product_type"
              disabled
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-all focus-visible:border-[var(--theme-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
            >
              <option value="">All types</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="order_by">
              Sort by
            </label>
            <select
              id="order_by"
              name="order_by"
              disabled
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-all focus-visible:border-[var(--theme-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
            >
              <option value="">Newest</option>
            </select>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      <form
        className="grid gap-5 md:grid-cols-[2fr_1fr_1fr_1fr] md:items-end"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="q">
            Search products
          </label>
          <Input
            id="q"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description..."
            disabled={isPending}
            className="transition-all focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary)]/20"
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
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-all focus-visible:border-[var(--theme-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
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
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="product_type">
            Type
          </label>
          <select
            id="product_type"
            name="product_type"
            value={productType}
            onChange={(e) => handleProductTypeChange(e.target.value)}
            disabled={isPending}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-all focus-visible:border-[var(--theme-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
          >
            <option value="">All types</option>
            <option value="DIGITAL">Digital</option>
            <option value="PHYSICAL">Physical</option>
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
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-all focus-visible:border-[var(--theme-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
          >
            <option value="">Newest</option>
            <option value="OLDEST">Oldest</option>
            <option value="PRICE_LOW_TO_HIGH">Price: Low to High</option>
            <option value="PRICE_HIGH_TO_LOW">Price: High to Low</option>
            <option value="SALES_COUNT">Best Selling</option>
            <option value="UPDATED_DESC">Recently Updated</option>
          </select>
        </div>
        <div className="md:col-span-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              disabled={isPending}
              className="inline-flex h-10 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all hover:scale-105 hover:bg-slate-100 hover:border-[var(--theme-primary)]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:opacity-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              Clear
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

