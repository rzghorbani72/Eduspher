import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PlatformContactPage } from '@/components/panel/platform-contact/platform-contact-page';
import { AcademyStaticPageView } from '@/components/academy/academy-static-page';
import { getServerAdminPanelUrl } from '@/lib/admin-panel-url.server';
import { getAcademySiteContent } from '@/lib/api/server';
import { getAcademyContext } from '@/lib/store-context';
import { t } from '@/lib/i18n/server-translations';
import { buildSiteMetadata } from '@/lib/seo/build-metadata';
import { getPlatformPageSeo } from '@/lib/seo/platform-pages';
import { getSeoRequestContext } from '@/lib/seo/request-context';

export const dynamic = 'force-dynamic';

/**
 * The academy's own contact page. Unlike `/about` it still renders when the
 * manager wrote no text, as long as they published contact channels — the
 * channels ARE the page.
 */
const loadAcademyContact = async () => {
  const store = await getAcademyContext();
  if (!store.slug) return null;

  const content = await getAcademySiteContent(store.slug);
  if (!content) return null;

  const page = content.pages.find((entry) => entry.slug === 'contact') ?? null;
  if (!page && content.links.length === 0) return null;

  return {
    content,
    page: page ?? {
      slug: 'contact' as const,
      title: t('academySite.contactFallbackTitle'),
      body: '',
      is_published: true,
      updated_at: null,
    },
  };
};

export async function generateMetadata(): Promise<Metadata> {
  const academy = await loadAcademyContact();
  if (academy) {
    return { title: `${academy.page.title} | ${academy.content.academy_name}` };
  }
  const ctx = await getSeoRequestContext();
  const pageSeo = getPlatformPageSeo('/contact');
  return buildSiteMetadata({
    title: pageSeo?.title,
    description: pageSeo?.description,
    ctx,
  });
}

export default async function ContactPage() {
  const store = await getAcademyContext();
  const academy = await loadAcademyContact();

  if (store.slug) {
    if (!academy) notFound();
    return <AcademyStaticPageView page={academy.page} links={academy.content.links} />;
  }

  const [adminLoginUrl, adminRegisterUrl, panelSupportUrl] = await Promise.all([
    getServerAdminPanelUrl('/login'),
    getServerAdminPanelUrl('/register'),
    getServerAdminPanelUrl('/support'),
  ]);
  return (
    <PlatformContactPage
      adminLoginUrl={adminLoginUrl}
      adminRegisterUrl={adminRegisterUrl}
      panelSupportUrl={panelSupportUrl}
      studentSupportUrl="/account/support"
    />
  );
}
