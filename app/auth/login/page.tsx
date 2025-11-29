import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath } from "@/lib/utils";
import { getSchoolBySlug } from "@/lib/api/server";
import { getSchoolLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access your EduSpher learning account.",
};

export default async function LoginPage() {
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
  const school = schoolContext.slug ? await getSchoolBySlug(schoolContext.slug) : null;
  const defaultCountryCode = school?.country_code || undefined;
  
  // Get language for translations
  const language = getSchoolLanguage(school?.language || null, school?.country_code || null);
  const translate = (key: string) => t(key, language);
  
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-lg transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 lg:flex-row lg:px-10 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("auth.welcomeBack")}</h1>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
          {translate("auth.welcomeBackDescription")}
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition-all hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
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
          <div className="text-slate-500 dark:text-slate-400">
            {translate("auth.forgotPassword")}{" "}
            <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/auth/forgot-password")}>
              {translate("auth.resetItHere")}
            </Link>
          </div>
          <div className="text-slate-500 dark:text-slate-400">
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

