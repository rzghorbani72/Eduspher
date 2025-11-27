import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CartCheckout } from "@/components/checkout/cart-checkout";
import { EmptyState } from "@/components/ui/empty-state";
import { getCourseById, getCurrentUser, getCart } from "@/lib/api/server";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath, resolveAssetUrl, formatCurrencyWithSchool } from "@/lib/utils";
import { getSession } from "@/lib/auth/session";

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
    const schoolContext = await getSchoolContext();
    const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
    const redirectUrl = courseId 
      ? `/checkout?course=${courseId}`
      : "/checkout";
    redirect(buildPath(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`));
  }

  const user = await getCurrentUser();
  if (!user) {
    const schoolContext = await getSchoolContext();
    const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
    redirect(buildPath("/auth/login"));
  }

  // If no course ID, show cart checkout
  if (!courseId) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Checkout
          </h1>
          <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
            Review your cart and complete your purchase.
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
              schoolId: session.schoolId,
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
        title="Course not found"
        description="The course you're looking for doesn't exist or is no longer available."
        action={
          <Link
            href="/courses"
            className="inline-flex h-11 items-center rounded-full bg-sky-600 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            Browse Courses
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
            Complete Your Enrollment
          </h1>
          <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
            This course is free. Complete your enrollment to get started.
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
              schoolId: session.schoolId,
            }} 
          />
        </div>
      </div>
    );
  }

  const coverUrl = resolveAssetUrl(course.cover?.url) ?? "/globe.svg";
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Complete Your Purchase
        </h1>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
          Review your order and complete your enrollment.
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
              What's included
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-[var(--theme-primary)] font-bold">✓</span>
                Lifetime access to course materials
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--theme-primary)] font-bold">✓</span>
                Certificate of completion {course.is_certificate ? "(included)" : "(not included)"}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--theme-primary)] font-bold">✓</span>
                14-day satisfaction guarantee
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--theme-primary)] font-bold">✓</span>
                Cancel anytime from your dashboard
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
              schoolId: session.schoolId,
            }} 
          />
        </div>
      </div>
    </div>
  );
}

