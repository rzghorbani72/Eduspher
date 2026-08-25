import type { Metadata } from "next";

import { PlatformOrganizationJsonLd } from "@/components/seo/platform-organization-json-ld";
import { buildSiteMetadata } from "@/lib/seo/build-metadata";
import { getPlatformPageSeo } from "@/lib/seo/platform-pages";
import { getSeoRequestContext } from "@/lib/seo/request-context";

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await getSeoRequestContext();
  if (!ctx.isPlatform) {
    return {};
  }

  const pageSeo = getPlatformPageSeo(ctx.pathname);
  if (!pageSeo) {
    return {};
  }

  return buildSiteMetadata({
    title: pageSeo.title,
    description: pageSeo.description,
    ctx,
  });
}

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PlatformOrganizationJsonLd />
      {children}
    </>
  );
}
