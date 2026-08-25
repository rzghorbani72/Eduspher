import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlatformAboutPage } from "@/components/panel/platform-about/platform-about-page";
import { ABOUT } from "@/components/panel/platform-about/about.messages";
import { AcademyStaticPageView } from "@/components/academy/academy-static-page";
import { getServerAdminPanelUrl } from "@/lib/admin-panel-url.server";
import { getAcademySiteContent } from "@/lib/api/server";
import { getAcademyContext } from "@/lib/store-context";

export const dynamic = "force-dynamic";

/**
 * `/about` belongs to whoever owns the hostname: the platform on the root
 * domain, the academy on its own site. Without the split, every academy site
 * served the platform's own about page under the academy's brand.
 */
const loadAcademyPage = async () => {
  const store = await getAcademyContext();
  if (!store.slug) return null;
  const content = await getAcademySiteContent(store.slug);
  const page = content?.pages.find((entry) => entry.slug === "about") ?? null;
  return page ? { page, content } : null;
};

export async function generateMetadata(): Promise<Metadata> {
  const academy = await loadAcademyPage();
  if (!academy) {
    return { title: ABOUT.meta.title, description: ABOUT.meta.description };
  }
  return { title: `${academy.page.title} | ${academy.content?.academy_name}` };
}

export default async function AboutPage() {
  const store = await getAcademyContext();
  const academy = await loadAcademyPage();

  if (store.slug) {
    if (!academy) notFound();
    return <AcademyStaticPageView page={academy.page} />;
  }

  const [adminLoginUrl, adminRegisterUrl] = await Promise.all([
    getServerAdminPanelUrl("/login"),
    getServerAdminPanelUrl("/register"),
  ]);
  return (
    <PlatformAboutPage
      adminLoginUrl={adminLoginUrl}
      adminRegisterUrl={adminRegisterUrl}
    />
  );
}
