import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { buildSchoolPath } from "@/lib/utils";
import type { ProductSummary } from "@/lib/api/types";

interface RelatedProductsProps {
  products: ProductSummary[];
  schoolSlug?: string | null;
  school?: {
    currency?: string;
    currency_symbol?: string;
    currency_position?: "before" | "after";
  } | null;
}

export const RelatedProducts = ({ products, schoolSlug, school }: RelatedProductsProps) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Related Products
        </h2>
        <Link
          href={buildSchoolPath(schoolSlug, "/products")}
          className="text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
        >
          View all products →
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard product={product} schoolSlug={schoolSlug} school={school} />
          </div>
        ))}
      </div>
    </section>
  );
};

