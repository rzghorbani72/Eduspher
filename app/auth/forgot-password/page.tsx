import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reset password",
};

export default async function ForgotPasswordPage() {
  const schoolContext = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(schoolContext.slug, path);
  return (
    <EmptyState
      title="Password reset coming soon"
      description="We're finalising the self-service password reset flow. In the meantime, contact support to reset your credentials."
      action={
        <Link
          href={buildPath("/contact")}
          className="inline-flex h-11 items-center rounded-full bg-sky-600 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
        >
          Contact support
        </Link>
      }
    />
  );
}

