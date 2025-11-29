import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath } from "@/lib/utils";
import { getSchoolBySlug } from "@/lib/api/server";
import { getSchoolLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

export const metadata: Metadata = {
  title: "Create account",
  description: "Join EduSpher and start your personalised learning journey.",
};

export default async function RegisterPage() {
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
  const school = schoolContext.slug ? await getSchoolBySlug(schoolContext.slug) : null;
  const defaultCountryCode = school?.country_code || undefined;
  
  // Get language for translations
  const language = getSchoolLanguage(school?.language || null, school?.country_code || null);
  const translate = (key: string) => t(key, language);
  
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-lg transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[1fr_1.2fr] lg:px-10 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("auth.joinEduSpher")}</h1>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
          {translate("auth.joinDescription")}
        </p>
        <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-[var(--theme-primary)] font-bold mt-0.5">•</span>
            <span>{translate("auth.personalisedRoadmap")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--theme-primary)] font-bold mt-0.5">•</span>
            <span>{translate("auth.weeklyCheckIns")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--theme-primary)] font-bold mt-0.5">•</span>
            <span>{translate("auth.progressAnalytics")}</span>
          </li>
        </ul>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {translate("auth.alreadyHaveAccount")}{" "}
          <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/auth/login")}>
            {translate("auth.signInHere")}
          </Link>
          .
        </p>
      </div>
      <div className="space-y-5">
        <RegisterForm 
          defaultCountryCode={defaultCountryCode}
          primaryVerificationMethod={school?.primary_verification_method || 'phone'}
        />
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          {translate("auth.agreeToTerms")}{" "}
          <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/legal/terms")}>
            {translate("auth.termsOfService")}
          </Link>{" "}
          {translate("auth.and")}{" "}
          <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/legal/privacy")}>
            {translate("auth.privacyPolicy")}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

