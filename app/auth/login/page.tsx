import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath } from "@/lib/utils";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access your EduSpher learning account.",
};

export default async function LoginPage() {
  const storeContext = await getAcademyContext();
  const buildPath = (path: string) => buildAcademyPath(storeContext.slug, path);
  const store = storeContext.slug ? await getAcademyBySlug(storeContext.slug) : null;
  const defaultCountryCode = store?.country_code || undefined;
  
  // Get language for translations
  const language = getAcademyLanguage(store?.language || null, store?.country_code || null);
  const translate = (key: string) => t(key, language);
  
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 rounded-2xl border border-slate-200 bg-card lg:flex-row lg:px-10 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("auth.welcomeBack")}</h1>
        <p className="text-base leading-7 text-muted">
          {translate("auth.welcomeBackDescription")}
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition-all hover:shadow-sm   ">
          {translate("auth.newToEduSpher")}{" "}
          <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/auth/register")}>
            {translate("auth.createFreeAccount")}
          </Link>
          . {translate("auth.takesLessThanTwoMinutes")}
        </div>
      </div>
      <div className="flex-1 space-y-5">
        <LoginForm defaultCountryCode={defaultCountryCode} />
        <div className="space-y-2.5 text-center text-sm">
          <div className="text-muted opacity-70">
            {translate("auth.forgotPassword")}{" "}
            <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/auth/forgot-password")}>
              {translate("auth.resetItHere")}
            </Link>
          </div>
          <div className="text-muted opacity-70">
            {translate("auth.dontHaveAccount")}{" "}
            <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/auth/register")}>
              {translate("auth.signUp")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

