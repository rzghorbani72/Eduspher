import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CartCheckout } from "@/components/checkout/cart-checkout";
import { EmptyState } from "@/components/ui/empty-state";
import { getCourseById, getCurrentUser, getCart, getStoreBySlug, getCurrentStore } from "@/lib/api/server";
import { getStoreContext } from "@/lib/store-context";
import { buildStorePath, resolveAssetUrl, formatCurrencyWithStore } from "@/lib/utils";
import { getSession } from "@/lib/auth/session";
import { getStoreLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

type SearchParams = Promise<{
  course?: string;
}>;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const courseId = params.course;

  const session = await getSession();
  if (!session || !session.userId || !session.profileId) {
    const storeContext = await getStoreContext();
    const buildPath = (path: string) => buildStorePath(storeContext.slug, path);
    const redirectUrl = courseId 
      ? `/checkout?course=${courseId}`
      : "/checkout";
    redirect(buildPath(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`));
  }

  const user = await getCurrentUser();
  if (!user) {
    const storeContext = await getStoreContext();
    const buildPath = (path: string) => buildStorePath(storeContext.slug, path);
    redirect(buildPath("/auth/login"));
  }

  // Get store language for translations
  const storeContext = await getStoreContext();
  let currentStore = await getCurrentStore().catch(() => null);
  if (!currentStore && storeContext.slug) {
    currentStore = await getStoreBySlug(storeContext.slug).catch(() => null);
  }
  const language = getStoreLanguage(currentStore?.language || null, currentStore?.country_code || null);
  const translate = (key: string) => t(key, language);

  // If no course ID, show cart checkout
  if (!courseId) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {translate("checkout.title")}
          </h1>
          <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
            {translate("checkout.reviewCart")}
          </p>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <CartCheckout 
            user={{
              ...user,
              name: user.display_name || user.email || user.phone_number || "User",
            }} 
            session={{
              userId: session.userId!,
              profileId: session.profileId!,
              storeId: session.storeId,
            }} 
          />
        </div>
      </div>
    );
  }

  const [course] = await Promise.all([
    getCourseById(courseId).catch(() => null),
  ]);

  if (!course) {
    return (
        <EmptyState
          title={translate("checkout.courseNotFound")}
          description={translate("checkout.courseNotFoundDescription")}
          action={
            <Link
              href="/courses"
              className="inline-flex h-11 items-center rounded-full bg-sky-600 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              {translate("checkout.browseCourses")}
            </Link>
          }
        />
    );
  }


  if (course.is_free) {
    // For free courses, we can enroll directly without payment
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {translate("checkout.completeEnrollment")}
          </h1>
          <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
            {translate("checkout.freeCourseEnrollment")}
          </p>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <CheckoutForm 
            course={course} 
            user={{
              ...user,
              name: user.display_name || user.email || user.phone_number || "User",
            }} 
            session={{
              userId: session.userId!,
              profileId: session.profileId!,
              storeId: session.storeId,
            }} 
          />
        </div>
      </div>
    );
  }

  const coverUrl = resolveAssetUrl(course.cover?.url) ?? "/globe.svg";
  const buildPath = (path: string) => buildStorePath(storeContext.slug, path);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {translate("checkout.completePurchase")}
        </h1>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
          {translate("checkout.reviewOrder")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex gap-4">
              {course.cover?.url && (
                <img
                  src={coverUrl}
                  alt={course.title}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {course.title}
                </h2>
                {course.short_description && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {course.short_description}
                  </p>
                )}
                {course.category && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {course.category.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {translate("checkout.whatsIncluded")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-[var(--theme-primary)] font-bold">✓</span>
                {translate("checkout.lifetimeAccess")}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--theme-primary)] font-bold">✓</span>
                {translate("checkout.certificateOfCompletion")} {course.is_certificate ? `(${translate("checkout.included")})` : `(${translate("checkout.notIncluded")})`}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--theme-primary)] font-bold">✓</span>
                {translate("checkout.satisfactionGuarantee")}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--theme-primary)] font-bold">✓</span>
                {translate("checkout.cancelAnytime")}
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:h-fit">
          <OrderSummary 
            course={course} 
            user={{
              ...user,
              name: user.display_name || user.email || user.phone_number || "User",
            }} 
            session={{
              userId: session.userId!,
              profileId: session.profileId!,
              storeId: session.storeId,
            }} 
          />
        </div>
      </div>
    </div>
  );
}

