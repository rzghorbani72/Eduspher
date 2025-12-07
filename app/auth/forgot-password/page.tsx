import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getStoreContext } from "@/lib/store-context";
import { buildStorePath } from "@/lib/utils";
import { getStoreBySlug } from "@/lib/api/server";
import { getStoreLanguage, getServerTranslations } from "@/lib/i18n/server-translations";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your password using email or phone verification.",
};

export default async function ForgotPasswordPage() {
  const storeContext = await getStoreContext();
  const buildPath = (path: string) => buildStorePath(storeContext.slug, path);
  const store = storeContext.slug ? await getStoreBySlug(storeContext.slug) : null;
  const defaultCountryCode = store?.country_code || undefined;
  const language = getStoreLanguage(store);
  const t = getServerTranslations(language);
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-lg transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 lg:flex-row lg:px-10 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("auth.resetPassword")}</h1>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
          {t("auth.resetPasswordDescription")}
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition-all hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {t("auth.rememberPassword")}{" "}
          <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/auth/login")}>
            {t("auth.signInHere")}
          </Link>
          .
        </div>
      </div>
      <div className="flex-1 space-y-5">
        <ForgotPasswordForm defaultCountryCode={defaultCountryCode} />
      </div>
    </div>
  );
}

