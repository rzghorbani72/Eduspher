"use client";

import Link from "next/link";
import { Star, Package, ShoppingCart } from "lucide-react";

import type { ProductSummary } from "@/lib/api/types";
import { buildStorePath, formatCurrencyWithStore, resolveAssetUrl, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardMedia } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/hooks";

interface ProductCardProps {
  product: ProductSummary;
  storeSlug?: string | null;
  store?: {
    currency?: string;
    currency_symbol?: string;
    currency_position?: "before" | "after";
  } | null;
}

export const ProductCard = ({ product, storeSlug = null, store = null }: ProductCardProps) => {
  const { t, language } = useTranslation();
  const coverUrl = resolveAssetUrl(product.cover?.publicUrl) ?? "/window.svg";
  const hasDiscount = product.original_price && product.original_price > product.price;
  const detailHref = buildStorePath(storeSlug, `/products/${product.id}`);
  const isPhysical = product.product_type === 'PHYSICAL';
  const isOutOfStock = isPhysical && product.stock_quantity !== null && product.stock_quantity <= 0;

  return (
    <Card className="transition-all duration-300 hover:border-[var(--theme-primary)]/30">
      <CardMedia src={coverUrl} alt={product.title} />
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {product.category ? <Badge variant="soft">{product.category.name}</Badge> : null}
          {product.is_featured ? <Badge variant="warning">{t("products.featured")}</Badge> : null}
          {isPhysical ? (
            <Badge variant="outline" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {t("products.physical")}
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <ShoppingCart className="h-3 w-3" />
              {t("products.digital")}
            </Badge>
          )}
          {isOutOfStock && <Badge variant="destructive">{t("products.outOfStock")}</Badge>}
        </div>
        <div className="flex flex-col gap-2 h-[110px]">
          <h3 className="text-lg font-semibold leading-7 text-slate-900 transition-colors group-hover:text-[var(--theme-primary)] dark:text-slate-100 dark:group-hover:text-[var(--theme-primary)]">
            {product.title}
          </h3>
          {product.short_description ? (
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              {truncate(product.short_description, 160)}
            </p>
          ) : null}
        </div>
       
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 h-5">
          {product.reviews_count !== undefined && product.reviews_count > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-slate-400">({product.reviews_count})</span>
            </div>
          )}
          {product.sales_count !== undefined && product.sales_count > 0 && (
            <div className="flex items-center gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{product.sales_count} {t("products.soldCount")}</span>
            </div>
          )}
          {isPhysical && product.stock_quantity !== null && (
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              <span>{product.stock_quantity} {t("products.inStockCount")}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
          <div className="flex flex-col gap-1">
            {hasDiscount ? (
              <>
                <span className="text-slate-500 line-through dark:text-slate-400">
                  {formatCurrencyWithStore(product.original_price || 0, store, undefined, language)}
                </span>
                <span className="text-[var(--theme-primary)]">
                  {formatCurrencyWithStore(product.price || 0, store, undefined, language)}
                </span>
              </>
            ) : (
              <span className="text-[var(--theme-primary)]">
                {formatCurrencyWithStore(product.price || 0, store, undefined, language)}
              </span>
            )}
          </div>
          {product.author ? <span className="text-slate-600 dark:text-slate-400">{product.author.display_name}</span> : null}
        </div>
        <Link
          href={detailHref}
          className="inline-flex items-center text-sm font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline"
        >
          {t("products.viewProductLink")} →
        </Link>
      </CardContent>
    </Card>
  );
};

