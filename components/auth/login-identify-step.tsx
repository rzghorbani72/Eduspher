"use client";

import { Loader2, Mail, Phone } from "lucide-react";

import { PhoneInput } from "@/components/ui/phone-input";
import Link from "@/components/ui/link";
import { toEnglishDigits } from "@/lib/phone-utils";
import { cn } from "@/lib/utils";
import { AuthError, AuthMessage } from "@/components/auth/auth-notice";
import type { useLogin } from "@/hooks/use-login";

type Login = ReturnType<typeof useLogin>;

/**
 * Login step 1: the identifier alone. The account is looked up before any
 * password is asked for, so an unknown visitor is offered signup instead of a
 * login they could never pass.
 */
export function LoginIdentifyStep({ login }: { login: Login }) {
  const { t, buildPath } = login;
  const registerHref = buildPath(
    login.identifier ? `/auth/register?identifier=${encodeURIComponent(login.identifier)}` : "/auth/register"
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
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(["email", "phone"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => login.changeChannel(m)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
              login.channel === m
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "email" ? <Mail className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
            {m === "email" ? t("auth.email") : t("auth.phone")}
          </button>
        ))}
      </div>

      {login.channel === "email" ? (
        <input
          id="identifier"
          type="email"
          dir="ltr"
          autoComplete="email"
          value={login.email}
          onChange={(e) => login.setEmail(toEnglishDigits(e.target.value))}
          placeholder={t("auth.enterEmail")}
          className="auth-input"
        />
      ) : (
        <PhoneInput
          id="identifier"
          value={login.phoneNumber}
          onChange={login.setPhoneNumber}
          onCountryChange={login.setCountry}
          defaultCountry={login.country}
          placeholder={t("auth.enterPhone")}
          autoComplete="tel"
          inputClassName="text-center"
        />
      )}

      {login.notRegistered && (
        <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
          <p>{t("auth.accountNotRegisteredForLogin")}</p>
          <p className="text-xs">{t("auth.registerToLoginHint")}</p>
          <Link href={registerHref} className="font-semibold text-[color:var(--auth-accent)] hover:underline">
            {t("auth.createAccountToContinue")} →
          </Link>
        </div>
      )}

      <AuthError>{login.error}</AuthError>
      <AuthMessage>{!login.error ? login.message : null}</AuthMessage>

      <button type="submit" className="auth-submit-btn" disabled={login.pending}>
        {login.pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("auth.continueLabel")}
      </button>
    </form>
  );
}

