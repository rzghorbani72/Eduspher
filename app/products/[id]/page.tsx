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
import { getProductById, getCourses, getProducts, getCurrentUser } from "@/lib/api/server";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath, resolveAssetUrl, formatCurrencyWithSchool } from "@/lib/utils";
import { Package, ShoppingCart } from "lucide-react";

type PageParams = Promise<{
  id: string;
}>;

const detailItems = (
  product: Awaited<ReturnType<typeof getProductById>>,
  school?: { currency?: string; currency_symbol?: string; currency_position?: "before" | "after" } | null
) => {
  if (!product) return [];
  const hasDiscount = product.original_price && product.original_price > product.price;
  const isPhysical = product.product_type === 'PHYSICAL';
  const priceDisplay = hasDiscount
    ? (
        <div className="flex flex-col items-end gap-1">
          <span className="text-slate-500 line-through dark:text-slate-400">
            {formatCurrencyWithSchool(product.original_price || 0, school)}
          </span>
          <span className="text-[var(--theme-primary)] font-semibold">
            {formatCurrencyWithSchool(product.price, school)}
          </span>
        </div>
      )
    : formatCurrencyWithSchool(product.price, school);
  
  const items = [
    {
      label: "Type",
      value: isPhysical ? "Physical" : "Digital",
    },
    {
      label: "Price",
      value: priceDisplay,
    },
    {
      label: "Category",
      value: product.category?.name ?? "General",
    },
  ];

  if (isPhysical && product.stock_quantity !== null) {
    items.push({
      label: "Stock",
      value: `${product.stock_quantity} available`,
    });
  }

  if (product.weight) {
    items.push({
      label: "Weight",
      value: `${product.weight} kg`,
    });
  }

  if (product.dimensions) {
    items.push({
      label: "Dimensions",
      value: product.dimensions,
    });
  }

  if (product.author) {
    items.push({
      label: "Seller",
      value: product.author.display_name,
    });
  }

  return items;
};

export default async function ProductDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt");
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);

  const [product, user] = await Promise.all([
    getProductById(id).catch(() => null),
    getCurrentUser().catch(() => null),
  ]);
  const school = user?.currentSchool || null;

  if (!product) {
    if (!token?.value) {
      return (
        <EmptyState
          title="Sign in to view product details"
          description="Create a free account or log in to view product details and make purchases."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={buildPath("/auth/login")}
                className="inline-flex h-11 items-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
              >
                Log in
              </Link>
              <Link
                href={buildPath("/auth/login")}
                className="inline-flex h-11 items-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                Create account
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
            {normalizedProduct.is_featured ? <Badge variant="warning">Featured</Badge> : null}
            {isPhysical ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                Physical
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" />
                Digital
              </Badge>
            )}
            {isOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
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
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">About this product</h2>
            {normalizedProduct.description ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {normalizedProduct.description}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Detailed information coming soon. Contact support for more details.
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
                {detailItems(normalizedProduct, school).map((item) => (
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
                    Out of Stock
                  </button>
                )}
              </div>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                {isPhysical
                  ? "Physical items will be shipped to your address. Shipping costs calculated at checkout."
                  : "Digital products are available for immediate download after purchase."}
              </p>
            </div>
          </div>
          {normalizedProduct.images && normalizedProduct.images.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Product Images</h2>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                {normalizedProduct.images.map((image, index) => (
                  <li key={image.id || index}>
                    <Link 
                      className="group inline-flex items-center font-semibold text-[var(--theme-primary)] transition-all hover:translate-x-1 hover:underline" 
                      href={resolveAssetUrl(image.url) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View image {index + 1} →
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
          schoolSlug={schoolContext.slug}
          school={school}
        />
      ) : null}

      {allRelatedCourses.length > 0 ? (
        <RelatedCourses
          courses={allRelatedCourses}
          schoolSlug={schoolContext.slug}
          school={school}
        />
      ) : null}

      {additionalCourses?.courses?.length ? (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">You might also like</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {additionalCourses.courses
              .filter((item) => !allRelatedCourses.some((rc: any) => rc.id === item.id))
              .map((item, index) => (
                <div
                  key={item.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CourseCard course={item} schoolSlug={schoolContext.slug} />
                </div>
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
