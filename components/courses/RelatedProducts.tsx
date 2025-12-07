"use client";

import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { buildStorePath } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/hooks";
import type { ProductSummary } from "@/lib/api/types";

interface RelatedProductsProps {
  products: ProductSummary[];
  storeSlug?: string | null;
  store?: {
    currency?: string;
    currency_symbol?: string;
    currency_position?: "before" | "after";
  } | null;
}

export const RelatedProducts = ({ products, storeSlug, store }: RelatedProductsProps) => {
  const { t } = useTranslation();
  
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("courses.relatedProducts")}
        </h2>
        <Link
          href={buildStorePath(storeSlug, "/products")}
          className="text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
        >
          {t("courses.viewAllProducts")} →
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard product={product} storeSlug={storeSlug} store={store} />
          </div>
        ))}
      </div>
    </section>
  );
};

