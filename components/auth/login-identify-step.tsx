'use client';

import { Loader2, Mail, Phone } from 'lucide-react';

import { PhoneInput } from '@/components/ui/phone-input';
import Link from '@/components/ui/link';
import { toEnglishDigits } from '@/lib/phone-utils';
import { cn } from '@/lib/utils';
import { AuthError } from '@/components/auth/auth-notice';
import { HCaptchaWidget } from '@/components/auth/hcaptcha-widget';
import type { useLogin } from '@/hooks/use-login';

type Login = ReturnType<typeof useLogin>;

/**
 * Login step 1: the identifier alone. The account is looked up before any
 * password is asked for, so an unknown visitor is offered signup instead of a
 * login they could never pass.
 */
export function LoginIdentifyStep({ login }: { login: Login }) {
  const { t, buildPath } = login;
  const registerQuery = new URLSearchParams();
  if (login.identifier) registerQuery.set('identifier', login.identifier);
  if (login.redirectParam) registerQuery.set('redirect', login.redirectParam);
  const registerHref = buildPath(
    registerQuery.size ? `/auth/register?${registerQuery}` : '/auth/register',
  );

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        login.submitIdentify();
      }}
    >
      <div className="auth-segment">
        {(['email', 'phone'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => login.changeChannel(m)}
            className={cn('auth-segment-item', login.channel === m && 'on')}
          >
            {m === 'email' ? <Mail className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
            {m === 'email' ? t('auth.email') : t('auth.phone')}
          </button>
        ))}
      </div>

      {login.channel === 'email' ? (
        <input
          id="identifier"
          type="email"
          dir="ltr"
          autoComplete="email"
          value={login.email}
          onChange={(e) => login.setEmail(toEnglishDigits(e.target.value))}
          placeholder={t('auth.enterEmail')}
          className="auth-input"
        />
      ) : (
        <PhoneInput
          id="identifier"
          value={login.phoneNumber}
          onChange={login.setPhoneNumber}
          lockCountryCode={login.country.code}
          autoComplete="tel"
          className="auth-phone"
        />
      )}

      {login.notRegistered && (
        <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
          <p>{t('auth.accountNotRegisteredForLogin')}</p>
          <p className="text-xs">{t('auth.registerToLoginHint')}</p>
          <Link
            href={registerHref}
            className="font-semibold text-[color:var(--auth-accent)] hover:underline"
          >
            {t('auth.createAccountToContinue')} →
          </Link>
        </div>
      )}

      {login.captchaRequired && <HCaptchaWidget onVerify={login.setCaptchaToken} />}

      <AuthError>{login.error}</AuthError>

      <button
        type="submit"
        className="auth-submit-btn"
        disabled={login.pending || !login.identifierValid}
      >
        {login.pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {t('auth.continueLabel')}
      </button>
    </form>
  );
}
