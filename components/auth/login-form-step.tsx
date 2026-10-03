'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { PhoneInput } from '@/components/ui/phone-input';
import Link from '@/components/ui/link';
import { sanitizePasswordInput } from '@/lib/password-utils';
import { withAuthIdentifier } from '@/lib/auth/auth-identifier-draft';
import { cn } from '@/lib/utils';
import { AuthError } from '@/components/auth/auth-notice';
import { HumanCheck } from '@/components/auth/human-check';
import type { useLogin } from '@/hooks/use-login';

type Login = ReturnType<typeof useLogin>;

/**
 * One-step sign-in: identifier, method (password or one-time code), and a
 * human check shown from first render — never gated on failed attempts.
 */
export function LoginFormStep({ login }: { login: Login }) {
  const { t } = login;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-5" noValidate onSubmit={login.submit}>
      <PhoneInput
        id="identifier"
        value={login.phoneNumber}
        onChange={login.setPhoneNumber}
        lockCountryCode={login.country.code}
        autoComplete="tel"
        className="auth-phone"
      />

      <div className="auth-segment">
        {(['password', 'otp'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => login.changeMethod(m)}
            className={cn('auth-segment-item', login.method === m && 'on')}
          >
            {m === 'password' ? t('auth.loginWithPassword') : t('auth.loginWithOtp')}
          </button>
        ))}
      </div>

      {login.method === 'password' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              autoComplete="current-password"
              placeholder={t('auth.password')}
              value={login.password}
              onChange={(e) => login.setPassword(sanitizePasswordInput(e.target.value))}
              className={cn('auth-input with-toggle')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="auth-input-toggle"
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="text-start">
            <Link
              href={withAuthIdentifier(
                login.buildPath('/auth/forgot-password'),
                login.displayIdentifier,
                { redirect: null },
              )}
              className="text-xs text-[color:var(--auth-accent)] hover:underline"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>
        </div>
      )}

      <HumanCheck key={login.captcha.resetKey} onVerify={login.captcha.setToken} />

      <AuthError>{login.error}</AuthError>

      <button
        type="submit"
        className="auth-submit-btn"
        disabled={login.pending || !login.canSubmit}
      >
        {login.pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {login.method === 'otp'
          ? login.pending
            ? t('auth.sending')
            : t('auth.sendLoginCode')
          : login.pending
            ? t('auth.signingIn')
            : t('auth.signIn')}
      </button>
    </form>
  );
}
