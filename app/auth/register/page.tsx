import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath } from "@/lib/utils";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

export const metadata: Metadata = {
  title: "Create account",
  description: "Join EduSpher and start your personalised learning journey.",
};

export default async function RegisterPage() {
  const storeContext = await getAcademyContext();
  const buildPath = (path: string) => buildAcademyPath(storeContext.slug, path);
  const store = storeContext.slug ? await getAcademyBySlug(storeContext.slug) : null;
  const defaultCountryCode = store?.country_code || undefined;
  
  // Get language for translations
  const language = getAcademyLanguage(store?.language || null, store?.country_code || null);
  const translate = (key: string) => t(key, language);
  
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 rounded-2xl border border-slate-200 bg-card lg:grid-cols-[1fr_1.2fr] lg:px-10 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{translate("auth.joinEduSpher")}</h1>
        <p className="text-base leading-7 text-muted">
          {translate("auth.joinDescription")}
        </p>
        <ul className="space-y-2.5 text-sm text-muted">
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
        <p className="text-sm text-muted opacity-70">
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
          primaryVerificationMethod={store?.primary_verification_method || 'phone'}
        />
        <p className="text-xs leading-5 text-muted opacity-70">
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

