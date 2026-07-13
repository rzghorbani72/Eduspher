import { getAcademiesPublic } from "@/lib/api/server";
import { getServerAdminPanelUrl } from "@/lib/admin-panel-url.server";
import { DEFAULT_LANGUAGE } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/server-translations";
import { AcademyDirectoryClient } from "./academy-directory-client";
import { PlatformRoleCards } from "./platform-role-cards";

export async function AcademyDirectory() {
  const academies = await getAcademiesPublic().catch(() => []);
  const activeAcademies = academies.filter((academy) => academy.is_active !== false);
  const translate = (key: string) => t(key, DEFAULT_LANGUAGE);

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-[var(--theme-foreground)] sm:text-4xl">
          {translate("panel.title")}
        </h1>
        <p className="mx-auto max-w-2xl text-base text-slate-600 dark:text-slate-300">
          {translate("panel.description")}
        </p>
      </div>

      <PlatformRoleCards
        adminLoginUrl={await getServerAdminPanelUrl("/login")}
        teacherRegisterUrl={await getServerAdminPanelUrl("/register")}
      />

      <AcademyDirectoryClient academies={activeAcademies} />
    </div>
  );
}
