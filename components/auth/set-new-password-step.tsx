"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { sanitizePasswordInput } from "@/lib/password-utils";
import { AuthError } from "@/components/auth/auth-notice";
import type { useLogin } from "@/hooks/use-login";

type Login = ReturnType<typeof useLogin>;

/**
 * Shown after an admin-created account confirms it's really the right person
 * (password + OTP already checked) but is still carrying the one-time
 * password the admin generated. The account only gets a real session once
 * this step replaces it with a password only the user knows.
 */
export function SetNewPasswordStep({ login }: { login: Login }) {
  const { t } = login;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        login.submitNewPassword();
      }}
    >
      <p className="text-sm text-muted-foreground">{t("auth.setNewPasswordDescription")}</p>

      <div className="space-y-2">
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            dir="ltr"
            autoComplete="new-password"
            autoFocus
            placeholder={t("auth.newPassword")}
            value={login.newPassword}
            onChange={(e) => login.setNewPassword(sanitizePasswordInput(e.target.value))}
            className={cn("auth-input with-toggle")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="auth-input-toggle"
            aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <input
          id="confirm-new-password"
          type={showPassword ? "text" : "password"}
          dir="ltr"
          autoComplete="new-password"
          placeholder={t("auth.confirmPassword")}
          value={login.confirmNewPassword}
          onChange={(e) => login.setConfirmNewPassword(sanitizePasswordInput(e.target.value))}
          className="auth-input"
        />
      </div>

      <AuthError>{login.error}</AuthError>

      <button type="submit" className="auth-submit-btn" disabled={login.pending}>
        {login.pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {login.pending ? t("auth.settingPassword") : t("auth.setPasswordAndContinue")}
      </button>
    </form>
  );
}
