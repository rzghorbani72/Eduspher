'use client';

import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';

import { AuthError } from '@/components/auth/auth-notice';
import { useQuickEnrollAuth } from '@/components/courses/quick-enroll/use-quick-enroll-auth';
import { useStorePath } from '@/components/providers/store-provider';
import { OtpBoxInput } from '@/components/ui/otp-box-input';
import { PhoneInput } from '@/components/ui/phone-input';
import Link from '@/components/ui/link';
import { useLocaleDigits } from '@/hooks/use-locale-digits';
import { useTranslation } from '@/lib/i18n/hooks';

const OTP_LENGTH = 5;

interface QuickEnrollDialogProps {
  /** Class the visitor picked, shown so they know what the code unlocks. */
  classTitle: string;
  loginHref: string;
  onDone: () => void;
  onClose: () => void;
}

const fieldClassName =
  'border-theme bg-card h-12 w-full rounded-xl border px-4 text-sm text-(--theme-foreground) outline-none focus:border-(--theme-primary)';
const primaryButtonClassName =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--theme-primary) text-sm font-bold text-(--theme-on-primary) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';

/**
 * Phone → code, nothing else, so a guest who found a class time that suits
 * them enrolls without leaving the course page. New phones give a name too.
 */
export function QuickEnrollDialog({
  classTitle,
  loginHref,
  onDone,
  onClose,
}: QuickEnrollDialogProps) {
  const { t } = useTranslation();
  const buildPath = useStorePath();
  const localeDigits = useLocaleDigits();
  const auth = useQuickEnrollAuth(onDone);
  const isRegister = auth.mode === 'register';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.step === 'phone') auth.submitPhone();
    else auth.submitOtp();
  };

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-enroll-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <form
        noValidate
        onSubmit={submit}
        className="border-theme bg-card w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="border-theme flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="quick-enroll-title" className="text-base font-black text-(--theme-foreground)">
              {t('courses.quickEnrollTitle')}
            </h2>
            <p className="text-muted mt-0.5 text-xs">{classTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.cancel')}
            className="text-muted rounded-full p-1 hover:text-(--theme-foreground)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4 text-sm">
          {auth.step === 'phone' ? (
            <>
              <p className="text-muted text-xs">{t('courses.quickEnrollHint')}</p>
              <PhoneInput
                id="quick-enroll-phone"
                value={auth.phoneNumber}
                onChange={auth.setPhoneNumber}
                lockCountryCode={auth.country.code}
                autoComplete="tel"
                disabled={auth.pending}
              />
              {auth.passwordOnly ? (
                <AuthError>
                  {t('courses.quickEnrollPasswordOnly')}{' '}
                  <Link href={loginHref} className="font-semibold underline">
                    {t('auth.login')}
                  </Link>
                </AuthError>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-muted text-center text-xs">
                {t('auth.enterVerificationCode')
                  .split('{phone}')
                  .flatMap((part, i) =>
                    i === 0 ? [part] : [<bdi key={i}>{localeDigits(auth.fullPhone)}</bdi>, part],
                  )}
              </p>
              {isRegister ? (
                <input
                  value={auth.name}
                  onChange={(e) => auth.setName(e.target.value)}
                  placeholder={t('auth.enterFullName')}
                  autoComplete="name"
                  disabled={auth.pending}
                  className={fieldClassName}
                />
              ) : null}
              <OtpBoxInput
                length={OTP_LENGTH}
                value={auth.otp}
                onChange={auth.setOtp}
                disabled={auth.pending}
                autoFocus={!isRegister}
                onComplete={() => {
                  if (!auth.pending && (!isRegister || auth.name.trim().length >= 2)) {
                    auth.submitOtp();
                  }
                }}
              />
              <div className="text-muted text-center text-xs">
                {auth.timer.canResend ? (
                  <button
                    type="button"
                    onClick={auth.resend}
                    disabled={auth.pending}
                    className="font-semibold text-(--theme-primary-ink) underline-offset-4 hover:underline"
                  >
                    {t('auth.resendOtp')}
                  </button>
                ) : (
                  <span className="tabular-nums">
                    {t('auth.resendIn')} <bdi>{auth.timer.formatted}</bdi>
                  </span>
                )}
              </div>
            </>
          )}

          <AuthError>{auth.error}</AuthError>
        </div>

        <div className="space-y-3 px-5 pb-5">
          <button
            type="submit"
            disabled={
              auth.pending ||
              (auth.step === 'phone' ? !auth.phoneValid : auth.otp.length < OTP_LENGTH)
            }
            className={primaryButtonClassName}
          >
            {auth.pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {auth.step === 'phone' ? t('auth.continueLabel') : t('courses.quickEnrollConfirm')}
          </button>
          {auth.step === 'otp' ? (
            <button
              type="button"
              onClick={auth.back}
              disabled={auth.pending}
              className="text-muted w-full text-center text-xs hover:underline"
            >
              {t('common.back')}
            </button>
          ) : null}
          <p className="text-muted text-center text-[11px]">
            {t('courses.quickEnrollLegalPrefix')}{' '}
            <a href={buildPath('/terms')} target="_blank" rel="noreferrer" className="underline">
              {t('auth.termsOfService')}
            </a>{' '}
            {t('legal.and')}{' '}
            <a href={buildPath('/privacy')} target="_blank" rel="noreferrer" className="underline">
              {t('legal.privacyPolicy')}
            </a>{' '}
            {t('courses.quickEnrollLegalSuffix')}
          </p>
        </div>
      </form>
    </div>
  );

  return createPortal(dialog, document.body);
}
