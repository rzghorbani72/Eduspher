import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access your EduSpher learning account.",
};

export default async function LoginPage() {
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 rounded-3xl border border-slate-200 bg-white px-8 py-12 shadow-xl dark:border-slate-800 dark:bg-slate-950 lg:flex-row lg:px-12 lg:py-16">
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Welcome back</h1>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
          Continue your learning path, review saved resources, and connect with mentors ready to help
          you level up faster.
        </p>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          New to EduSpher?{" "}
          <Link className="font-semibold text-sky-600 hover:underline dark:text-sky-400" href={buildPath("/auth/register")}>
            Create a free account
          </Link>
          . It takes less than two minutes.
        </div>
      </div>
      <div className="flex-1 space-y-6">
        <LoginForm />
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Forgot password?{" "}
          <Link className="font-semibold text-sky-600 hover:underline dark:text-sky-400" href={buildPath("/auth/forgot-password")}>
            Reset it here
          </Link>
        </div>
      </div>
    </div>
  );
}

