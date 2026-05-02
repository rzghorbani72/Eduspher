import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath } from "@/lib/utils";
import { getCurrentAcademy, getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

export default async function NotFound() {
  const storeContext = await getAcademyContext();
  const buildPath = (path: string) => buildAcademyPath(storeContext.slug, path);
  
  // Get store language for translations
  let currentAcademy = await getCurrentAcademy().catch(() => null);
  if (!currentAcademy && storeContext.slug) {
    currentAcademy = await getAcademyBySlug(storeContext.slug).catch(() => null);
  }
  const language = getAcademyLanguage(currentAcademy?.language || null, currentAcademy?.country_code || null);
  const translate = (key: string) => t(key, language);
  
  return (
    <EmptyState
      title={translate("pages.pageNotFound")}
      description={translate("pages.pageNotFoundDescription")}
      action={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={buildPath("/")}
            className="inline-flex h-11 items-center rounded-full bg-sky-600 px-6 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            {translate("navigation.home")}
          </Link>
          <Link
            href={buildPath("/courses")}
            className="inline-flex h-11 items-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            {translate("pages.viewCourses")}
          </Link>
        </div>
      }
    />
  );
}

