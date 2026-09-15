'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { formatPhoneDisplay } from '@/lib/utils';

type EnrollmentClosedBannerProps = {
  message: string | null;
  reopensAt: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
};

function toTelHref(raw: string): string {
  const digits = raw
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
    .replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  if (digits.startsWith('98')) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 11) return `+98${digits.slice(1)}`;
  return `+${digits}`;
}

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
  const reopens = reopensAt
    ? new Date(reopensAt).toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;
  const phoneHref = contactPhone ? toTelHref(contactPhone) : '';
  const phoneLabel = contactPhone ? formatPhoneDisplay(contactPhone, language) : null;
  const hasManagerContact = Boolean(phoneLabel || contactEmail);

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
      </p>
      {hasManagerContact ? (
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
          <span className="opacity-70">{t('academyStatus.managerContact')}</span>
          {phoneLabel && phoneHref ? (
            <a
              href={`tel:${phoneHref}`}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-semibold tracking-wide underline-offset-4 transition-opacity hover:opacity-80 hover:underline"
              style={{ color: 'var(--theme-primary, var(--theme-foreground))' }}
              dir="ltr"
            >
              {phoneLabel}
            </a>
          ) : null}
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center rounded-md px-2 py-0.5 font-medium underline-offset-4 transition-opacity hover:opacity-80 hover:underline"
              style={{ color: 'var(--theme-primary, var(--theme-foreground))' }}
              dir="ltr"
            >
              {contactEmail}
            </a>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
