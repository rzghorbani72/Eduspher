"use client";

import { ArrowLeft, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { AuthError, AuthMessage } from "@/components/auth/auth-notice";
import type { useLogin } from "@/hooks/use-login";

type Login = ReturnType<typeof useLogin>;

/**
 * One code screen for both cases: signing in with a code, and the phone-
 * verification gate that follows a password login on an unverified account.
 */
export function LoginOtpStep({ login }: { login: Login }) {
  const { t } = login;

  return (
    <div className="space-y-5">
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold">{t("auth.otpVerification")}</p>
        <p className="text-xs text-muted-foreground">
          {t("auth.enterVerificationCode").replace("{phone}", login.otpTarget)}
        </p>
      </div>

      <Input
        id="otp"
        type="text"
        inputMode="numeric"
        maxLength={6}
        placeholder={t("auth.otpCodePlaceholder")}
        value={login.otp}
        onChange={(e) => login.setOtp(e.target.value)}
        className="text-center"
        autoFocus
      />

      <AuthError>{login.error}</AuthError>
      <AuthMessage>{!login.error ? login.message : null}</AuthMessage>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={login.changeIdentifier}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </button>
        <button
          type="button"
          className="auth-submit-btn flex-1"
          onClick={login.submitOtp}
          disabled={login.pending || login.otp.length < 4}
        >
          {login.pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {login.pending ? t("auth.signingIn") : t("auth.verifyAndSignIn")}
        </button>
      </div>

      <div className="text-center text-sm">
        {login.otpTimer.canResend ? (
          <button
            type="button"
            className="text-[color:var(--auth-accent)] hover:underline disabled:opacity-50"
            onClick={login.resendOtp}
            disabled={login.otpResending || login.pending}
          >
            {login.otpResending ? `${t("auth.resendOtp")}...` : t("auth.resendOtp")}
          </button>
        ) : (
          <span className="text-xs tabular-nums text-muted-foreground">
            {t("auth.resendIn")} {login.otpTimer.formatted}
          </span>
        )}
      </div>
    </div>
  );
}
