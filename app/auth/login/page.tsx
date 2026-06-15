import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { getAcademyContext } from "@/lib/store-context";
import { getAcademyBySlug } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access your EduSpher learning account.",
};

export default async function LoginPage() {
  const storeContext = await getAcademyContext();
  const store = storeContext.slug ? await getAcademyBySlug(storeContext.slug) : null;
  const defaultCountryCode = store?.country_code || undefined;

  return <LoginForm defaultCountryCode={defaultCountryCode} />;
}
