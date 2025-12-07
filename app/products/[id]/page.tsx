/* eslint-disable @next/next/no-img-element */
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseCard } from "@/components/courses/course-card";
import { RelatedCourses } from "@/components/products/RelatedCourses";
import { RelatedProducts } from "@/components/courses/RelatedProducts";
import { ProductCartButton } from "@/components/cart/product-cart-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getProductById, getCourses, getProducts, getCurrentUser, getStoreBySlug, getCurrentStore } from "@/lib/api/server";
import { getStoreContext } from "@/lib/store-context";
import { buildStorePath, resolveAssetUrl, formatCurrencyWithStore } from "@/lib/utils";
import { getStoreLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { Package, ShoppingCart } from "lucide-react";

type PageParams = Promise<{
  id: string;
}>;

const detailItems = (
  product: Awaited<ReturnType<typeof getProductById>>,
  store?: { currency?: string; currency_symbol?: string; currency_position?: "before" | "after" } | null,
  translate?: (key: string) => string,
  language?: string
) => {
  if (!product) return [];
  const t = translate || ((key: string) => key);
  const hasDiscount = product.original_price && product.original_price > product.price;
  const isPhysical = product.product_type === 'PHYSICAL';
  const priceDisplay = hasDiscount
    ? (
        <div className="flex flex-col items-end gap-1">
          <span className="text-slate-500 line-through dark:text-slate-400">
            {formatCurrencyWithStore(product.original_price || 0, store, undefined, language)}
          </span>
          <span className="text-[var(--theme-primary)] font-semibold">
            {formatCurrencyWithStore(product.price, store, undefined, language)}
          </span>
        </div>
      )
    : formatCurrencyWithStore(product.price, store, undefined, language);
  
  const items = [
    {
      label: t("products.typeLabel"),
      value: isPhysical ? t("products.physical") : t("products.digital"),
    },
    {
      label: t("products.price"),
      value: priceDisplay,
    },
    {
      label: t("products.category"),
      value: product.category?.name ?? t("products.categoryGeneral"),
    },
  ];

  if (isPhysical && product.stock_quantity !== null) {
    items.push({
      label: t("products.stockLabel"),
      value: `${product.stock_quantity} ${t("products.stockAvailable")}`,
    });
  }

  if (product.weight) {
    items.push({
      label: t("products.weightLabel"),
      value: `${product.weight} kg`,
    });
  }

  if (product.dimensions) {
    items.push({
      label: t("products.dimensionsLabel"),
      value: product.dimensions,
    });
  }

  if (product.author) {
    items.push({
      label: t("products.sellerLabel"),
      value: product.author.display_name,
    });
  }

  return items;
};

export default async function ProductDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt");
  const storeContext = await getStoreContext();
  const buildPath = (path: string) => buildStorePath(storeContext.slug, path);

  const [product, user] = await Promise.all([
    getProductById(id).catch(() => null),
    getCurrentUser().catch(() => null),
  ]);
  const store = user?.currentStore || null;

  // Get store language for translations
  let currentStore = await getCurrentStore().catch(() => null);
  if (!currentStore && storeContext.slug) {
    currentStore = await getStoreBySlug(storeContext.slug).catch(() => null);
  }
  const language = getStoreLanguage(currentStore?.language || null, currentStore?.country_code || null);
  const translate = (key: string) => t(key, language);

  if (!product) {
    if (!token?.value) {
      return (
        <EmptyState
          title={translate("products.signInToView")}
          description={translate("products.signInToViewDescription")}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={buildPath("/auth/login")}
                className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
              >
                {translate("auth.login")}
              </Link>
              <Link
                href={buildPath("/auth/login")}
                className="inline-flex h-11 items-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {translate("auth.register")}
              </Link>
            </div>
          }
        />
      );
    }
    return notFound();
  }

  const normalizedProduct = {
    ...product,
    access_control: undefined,
  };

  const coverUrl = resolveAssetUrl(normalizedProduct.cover?.url) ?? "/globe.svg";
  const isPhysical = normalizedProduct.product_type === 'PHYSICAL';
  const isOutOfStock = isPhysical && normalizedProduct.stock_quantity !== null && normalizedProduct.stock_quantity <= 0;

  // Extract related courses from productCourses
  const relatedCoursesData = ((normalizedProduct as any).productCourses || [])
    .map((pc: any) => pc?.course)
    .filter((course: any) => course && (course.is_published !== false || course.is_published === undefined)) || [];

  // Fetch related products and additional courses
  const [relatedProducts, additionalCourses] = await Promise.all([
    getProducts({
      published: true,
      limit: 3,
      order_by: "NEWEST",
      category_id: normalizedProduct.category?.id,
    }).catch(() => null),
    getCourses({
      published: true,
      limit: 3,
      order_by: "NEWEST",
      category_id: normalizedProduct.category?.id,
    }).catch(() => null),
  ]);

  // Combine and deduplicate courses
  const allRelatedCourses = [
    ...relatedCoursesData,
    ...(additionalCourses?.courses?.filter(
      (c) => !relatedCoursesData.some((rc: any) => rc.id === c.id) && c.id !== normalizedProduct.id
    ) || []),
  ].slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            {normalizedProduct.category ? <Badge variant="soft">{normalizedProduct.category.name}</Badge> : null}
            {normalizedProduct.is_featured ? <Badge variant="warning">{translate("products.featured")}</Badge> : null}
            {isPhysical ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {translate("products.physical")}
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" />
                {translate("products.digital")}
              </Badge>
            )}
            {isOutOfStock && <Badge variant="destructive">{translate("products.outOfStock")}</Badge>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            {normalizedProduct.title}
          </h1>
          {normalizedProduct.short_description ? (
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              {normalizedProduct.short_description}
            </p>
          ) : null}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-250">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{translate("products.aboutThisProduct")}</h2>
            {normalizedProduct.description ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {normalizedProduct.description}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {translate("products.detailedInfoComingSoon")}
              </p>
            )}
          </div>
        </div>
        <aside className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <div className="relative overflow-hidden">
              <img src={coverUrl} alt={normalizedProduct.title} className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105" />
            </div>
            <div className="space-y-4 p-5">
              <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                {detailItems(normalizedProduct, store, translate, language).map((item) => (
                  <div key={item.label} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {item.label}
                    </span>
                    {typeof item.value === 'string' ? (
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.value}
                      </span>
                    ) : (
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {!isOutOfStock ? (
                  <ProductCartButton product={normalizedProduct} />
                ) : (
                  <button
                    disabled
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-slate-300 text-sm font-semibold text-slate-500 cursor-not-allowed"
                  >
                    {translate("products.outOfStock")}
                  </button>
                )}
              </div>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                {isPhysical
                  ? translate("products.physicalShippingInfo")
                  : translate("products.digitalDownloadInfo")}
              </p>
            </div>
          </div>
          {normalizedProduct.images && normalizedProduct.images.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{translate("products.productImages")}</h2>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                {normalizedProduct.images.map((image, index) => (
                  <li key={image.id || index}>
                    <Link 
                      className="group inline-flex items-center font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline" 
                      href={resolveAssetUrl(image.url) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {translate("products.viewImage")} {index + 1} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>

      {relatedProducts?.products?.length ? (
        <RelatedProducts
          products={relatedProducts.products.filter((p) => p.id !== normalizedProduct.id)}
          storeSlug={storeContext.slug}
          store={store}
        />
      ) : null}

      {allRelatedCourses.length > 0 ? (
        <RelatedCourses
          courses={allRelatedCourses}
          storeSlug={storeContext.slug}
          store={store}
        />
      ) : null}

      {additionalCourses?.courses?.length ? (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("products.youMightAlsoLike")}</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {additionalCourses.courses
              .filter((item) => !allRelatedCourses.some((rc: any) => rc.id === item.id))
              .map((item, index) => (
                <div
                  key={item.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CourseCard course={item} storeSlug={storeContext.slug} />
                </div>
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
