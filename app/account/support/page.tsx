import Link from "@/components/ui/link";

import { EmptyState } from "@/components/ui/empty-state";
import { getSession } from "@/lib/auth/session";
import { getAcademyContext } from "@/lib/store-context";
import { getCurrentAcademy, getAcademyBySlug } from "@/lib/api/server";
import { buildAcademyPath } from "@/lib/utils";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { SupportCenter } from "@/components/account/support/support-center";

export default async function SupportPage() {
  const session = await getSession();
  const storeContext = await getAcademyContext();
  const buildPath = (path: string) => buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  let currentAcademy = await getCurrentAcademy().catch(() => null);
  if (!currentAcademy && storeContext.slug) {
    currentAcademy = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }
  const language = getAcademyLanguage(currentAcademy?.language ?? null, currentAcademy?.country_code ?? null);
  const translate = (key: string) => t(key, language);

  if (!session) {
    return (
      <EmptyState
        title={translate("account.loginToViewHub")}
        action={
          <Link
            href={buildPath("/auth/login")}
            className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-on-primary"
          >
            {translate("auth.login")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <SupportCenter />
    </div>
  );
}
