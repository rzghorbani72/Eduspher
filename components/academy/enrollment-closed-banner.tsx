'use client';

import { useTranslation } from '@/lib/i18n/hooks';

type EnrollmentClosedBannerProps = {
  message: string | null;
  reopensAt: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
};

/**
 * Shown to everyone while the academy is closed to new enrollments. Students who
 * already paid keep their access, so the banner says so instead of reading like
 * an outage notice.
 */
export function EnrollmentClosedBanner({
  message,
  reopensAt,
  contactPhone,
  contactEmail,
}: EnrollmentClosedBannerProps) {
  const { t, language } = useTranslation();
  const contact = [contactPhone, contactEmail].filter(Boolean).join(' · ');
  const reopens = reopensAt
    ? new Date(reopensAt).toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div
      role="status"
      className="w-full border-b px-4 py-3 text-center text-sm"
      style={{
        backgroundColor: 'var(--theme-muted, rgba(0,0,0,0.04))',
        color: 'var(--theme-foreground)',
      }}
    >
      <p className="font-medium">{message ?? t('academyStatus.enrollmentClosed')}</p>
      <p className="mt-1 opacity-80">
        {t('academyStatus.currentStudentsKeepAccess')}
        {reopens ? ` · ${t('academyStatus.reopensOn')} ${reopens}` : ''}
        {contact ? ` · ${contact}` : ''}
      </p>
    </div>
  );
}
