import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getAcademyContext } from "@/lib/store-context";
import { getAcademyBySlug } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your password using email or phone verification.",
};

export default async function ForgotPasswordPage() {
  const storeContext = await getAcademyContext();
  const store = storeContext.slug ? await getAcademyBySlug(storeContext.slug) : null;
  const defaultCountryCode = store?.country_code || undefined;

  return <ForgotPasswordForm defaultCountryCode={defaultCountryCode} />;
}
