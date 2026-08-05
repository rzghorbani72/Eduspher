"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import Link from "@/components/ui/link";
import { cn } from "@/lib/utils";
import { AuthError } from "@/components/auth/auth-notice";
import { HCaptchaWidget } from "@/components/auth/hcaptcha-widget";
import type { useLogin } from "@/hooks/use-login";

type Login = ReturnType<typeof useLogin>;

/**
 * Login step 2: the account is already known, so this screen only asks for the
 * password and offers the other method that account really has.
 */
export function LoginPasswordStep({ login }: { login: Login }) {
  const { t, buildPath } = login;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        login.submitPassword();
      }}
    >
      <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3 text-sm">
        <span dir="ltr" className="truncate">
          {login.identifier}
        </span>
        <button
          type="button"
          onClick={login.changeIdentifier}
          className="shrink-0 ps-3 font-medium text-[color:var(--auth-accent)] hover:underline"
        >
          {t("auth.changeIdentifier")}
        </button>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            dir="ltr"
            autoComplete="current-password"
            autoFocus
            placeholder={t("auth.password")}
            value={login.password}
            onChange={(e) => login.setPassword(e.target.value)}
            className={cn("auth-input with-toggle")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute bottom-2 left-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="text-start">
          <Link
            href={buildPath("/auth/forgot-password")}
            className="text-xs text-[color:var(--auth-accent)] hover:underline"
          >
            {t("auth.forgotPassword")}
          </Link>
        </div>
      </div>

      {login.captchaRequired && <HCaptchaWidget onVerify={login.setCaptchaToken} />}

      <AuthError>{login.error}</AuthError>

      <button type="submit" className="auth-submit-btn" disabled={login.pending}>
        {login.pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {login.pending ? t("auth.signingIn") : t("auth.signIn")}
      </button>

      {login.canUseOtp && (
        <button
          type="button"
          onClick={login.useOtpInstead}
          disabled={login.pending}
          className="w-full text-center text-sm text-[color:var(--auth-accent)] hover:underline disabled:opacity-50"
        >
          {t("auth.useOtpInstead")}
        </button>
      )}
    </form>
  );
}
