import { redirect } from 'next/navigation';
import Link from '@/components/ui/link';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { OrderSummary } from '@/components/checkout/order-summary';
import { CartCheckout } from '@/components/checkout/cart-checkout';
import { EmptyState } from '@/components/ui/empty-state';
import { AppImage } from '@/components/ui/app-image';
import {
  getCourseById,
  getCurrentUser,
  getAcademyBySlug,
  getCurrentAcademy,
  getAcademyEnrollmentStatus,
} from '@/lib/api/server';
import { getAcademyContext } from '@/lib/store-context';
import { buildAcademyPath, resolveAssetUrl } from '@/lib/utils';
import { getSession } from '@/lib/auth/session';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { getPlatformFeatures } from '@/lib/api/server/platform-features';

type SearchParams = Promise<{
  course?: string;
}>;

export default async function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const courseId = params.course;

  const session = await getSession();
  if (!session || !session.userId || !session.profileId) {
    const storeContext = await getAcademyContext();
    const buildPath = (path: string) =>
      buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);
    const redirectUrl = courseId ? `/checkout?course=${courseId}` : '/checkout';
    redirect(buildPath(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`));
  }

  const user = await getCurrentUser();
  if (!user) {
    const storeContext = await getAcademyContext();
    const buildPath = (path: string) =>
      buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);
    redirect(buildPath('/auth/login'));
  }

  // Get store language for translations
  const storeContext = await getAcademyContext();
  let currentAcademy = await getCurrentAcademy().catch(() => null);
  if (!currentAcademy && storeContext.slug) {
    currentAcademy = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }
  const language = getAcademyLanguage(
    currentAcademy?.language || null,
    currentAcademy?.country_code || null,
  );
  const translate = (key: string) => t(key, language);
  const { certificates_enabled } = await getPlatformFeatures();

  // Closed to new enrollments: the server refuses the checkout anyway, so say why
  // here instead of letting a deep link walk into a payment form.
  const enrollmentStatus = storeContext.slug
    ? await getAcademyEnrollmentStatus(storeContext.slug)
    : null;
  if (enrollmentStatus?.disabled) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{translate('academyStatus.enrollmentClosedShort')}</h1>
        <p className="text-muted-foreground">
          {enrollmentStatus.message ?? translate('academyStatus.enrollmentClosed')}
        </p>
        <p className="text-muted-foreground text-sm">
          {translate('academyStatus.currentStudentsKeepAccess')}
        </p>
      </div>
    );
  }

  if (process.env.NEXT_PUBLIC_PAYMENT_ENABLED !== 'true') {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{translate('payment.comingSoon')}</h1>
        <p className="text-muted-foreground">{translate('payment.comingSoonDescription')}</p>
        <a
          href={`mailto:support@${typeof window !== 'undefined' ? window.location.hostname : 'mentoma.com'}`}
          className="bg-primary text-primary-foreground inline-flex h-10 items-center rounded-md px-6 text-sm font-semibold hover:opacity-90"
        >
          {translate('payment.contactUs')}
        </a>
      </div>
    );
  }

  // If no course ID, show cart checkout
  if (!courseId) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-3 duration-500">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {translate('checkout.title')}
          </h1>
          <p className="text-muted text-base leading-7">{translate('checkout.reviewCart')}</p>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 delay-100 duration-500">
          <CartCheckout
            user={{
              ...user,
              name: user.display_name || user.email || user.phone_number || 'User',
            }}
            session={{
              userId: session.userId!,
              profileId: session.profileId!,
              academyId: session.academyId,
            }}
          />
        </div>
      </div>
    );
  }

  const [course] = await Promise.all([getCourseById(courseId).catch(() => null)]);

  if (!course) {
    return (
      <EmptyState
        title={translate('checkout.courseNotFound')}
        description={translate('checkout.courseNotFoundDescription')}
        action={
          <Link
            href="/courses"
            className="inline-flex h-11 items-center rounded-full bg-sky-600 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            {translate('checkout.browseCourses')}
          </Link>
        }
      />
    );
  }

  if (course.is_free) {
    // For free courses, we can enroll directly without payment
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-3 duration-500">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {translate('checkout.completeEnrollment')}
          </h1>
          <p className="text-muted text-base leading-7">
            {translate('checkout.freeCourseEnrollment')}
          </p>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 delay-100 duration-500">
          <CheckoutForm
            course={course}
            user={{
              ...user,
              name: user.display_name || user.email || user.phone_number || 'User',
            }}
            session={{
              userId: session.userId!,
              profileId: session.profileId!,
              academyId: session.academyId,
            }}
          />
        </div>
      </div>
    );
  }

  const coverUrl = resolveAssetUrl(course.Image?.publicUrl) ?? '/globe.svg';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-3 duration-500">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {translate('checkout.completePurchase')}
        </h1>
        <p className="text-muted text-base leading-7">{translate('checkout.reviewOrder')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          <div className="rounded-theme border-theme bg-card animate-in fade-in slide-in-from-bottom-4 border p-5 shadow-sm transition-all delay-100 duration-500 hover:shadow-md">
            <div className="flex gap-4">
              {course.Image?.publicUrl && (
                <AppImage
                  src={coverUrl}
                  alt={course.title}
                  preset="thumb"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {course.title}
                </h2>
                {course.short_description && (
                  <p className="text-muted mt-1 text-sm">{course.short_description}</p>
                )}
                {course.Category && (
                  <p className="text-muted mt-2 text-xs opacity-70">{course.Category.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-theme border-theme bg-card animate-in fade-in slide-in-from-bottom-4 border p-5 shadow-sm transition-all delay-200 duration-500 hover:shadow-md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {translate('checkout.whatsIncluded')}
            </h3>
            <ul className="text-muted mt-4 space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <span className="font-bold text-[var(--theme-primary)]">✓</span>
                {translate('checkout.lifetimeAccess')}
              </li>
              {certificates_enabled && (
                <li className="flex items-center gap-2">
                  <span className="font-bold text-[var(--theme-primary)]">✓</span>
                  {translate('checkout.certificateOfCompletion')}{' '}
                  {course.is_certificate
                    ? `(${translate('checkout.included')})`
                    : `(${translate('checkout.notIncluded')})`}
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="font-bold text-[var(--theme-primary)]">✓</span>
                {translate('checkout.satisfactionGuarantee')}
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-[var(--theme-primary)]">✓</span>
                {translate('checkout.cancelAnytime')}
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:h-fit">
          <OrderSummary
            course={course}
            user={{
              ...user,
              name: user.display_name || user.email || user.phone_number || 'User',
            }}
            session={{
              userId: session.userId!,
              profileId: session.profileId!,
              academyId: session.academyId,
            }}
          />
        </div>
      </div>
    </div>
  );
}
