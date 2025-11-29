import Link from "next/link";

import { env } from "@/lib/env";
import { getSchoolContext } from "@/lib/school-context";
import { buildSchoolPath } from "@/lib/utils";
import { getCurrentSchool, getSchoolBySlug } from "@/lib/api/server";
import { getSchoolLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";

export const SiteFooter = async () => {
  const school = await getSchoolContext();
  const buildPath = (path: string) => buildSchoolPath(school.slug, path);
  
  // Get school language for translations
  let currentSchool = await getCurrentSchool().catch(() => null);
  if (!currentSchool && school.slug) {
    currentSchool = await getSchoolBySlug(school.slug).catch(() => null);
  }
  const language = getSchoolLanguage(currentSchool?.language || null, currentSchool?.country_code || null);
  
  // Translation function with language
  const translate = (key: string) => t(key, language);

  const footerLinks = [
    {
      title: translate("footer.product"),
      items: [
        { label: translate("navigation.courses"), href: "/courses" },
        { label: translate("footer.learningPaths"), href: "/paths" },
        { label: translate("footer.pricing"), href: "/pricing" },
        { label: translate("footer.scholarships"), href: "/scholarships" },
      ],
    },
    {
      title: translate("footer.company"),
      items: [
        { label: translate("footer.about"), href: "/about" },
        { label: translate("footer.blog"), href: "/articles" },
        { label: translate("footer.careers"), href: "/careers" },
        { label: translate("footer.press"), href: "/press" },
      ],
    },
    {
      title: translate("footer.support"),
      items: [
        { label: translate("footer.helpCenter"), href: "/support" },
        { label: translate("footer.contact"), href: "/contact" },
        { label: translate("footer.status"), href: "/status" },
        { label: translate("footer.terms"), href: "/legal/terms" },
      ],
    },
  ];

  return (
    <footer className="border-t border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:justify-between md:gap-16">
        <div className="max-w-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/30">
              <span className="text-lg font-semibold">ES</span>
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{school.name}</p>
          </div>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {env.siteDescription} {translate("footer.description")}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            &copy; {new Date().getFullYear()} {school.name}. {translate("footer.allRightsReserved")}
          </p>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-8 sm:grid-cols-3">
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                {section.title}
              </p>
              <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link className="transition-all hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-primary)]" href={buildPath(item.href)}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

