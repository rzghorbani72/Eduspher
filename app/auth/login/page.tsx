import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath } from "@/lib/utils";
import { getSchoolBySlug } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access your EduSpher learning account.",
};

export default async function LoginPage() {
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
  const school = schoolContext.slug ? await getSchoolBySlug(schoolContext.slug) : null;
  const defaultCountryCode = school?.country_code || undefined;
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-lg transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 lg:flex-row lg:px-10 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
          Continue your learning path, review saved resources, and connect with mentors ready to help
          you level up faster.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition-all hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          New to EduSpher?{" "}
          <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/auth/register")}>
            Create a free account
          </Link>
          . It takes less than two minutes.
        </div>
      </div>
      <div className="flex-1 space-y-5">
        <LoginForm defaultCountryCode={defaultCountryCode} />
        <div className="space-y-2.5 text-center text-sm">
          <div className="text-slate-500 dark:text-slate-400">
            Forgot password?{" "}
            <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/auth/forgot-password")}>
              Reset it here
            </Link>
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link className="font-semibold text-[var(--theme-primary)] transition-all hover:underline hover:translate-x-0.5" href={buildPath("/auth/register")}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

