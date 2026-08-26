import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AcademyHomePage } from "@/components/academy/academy-home-page";
import { AcademyOrganizationJsonLd } from "@/components/seo/academy-organization-json-ld";
import { getAcademyBySlug, getPublicAcademies } from "@/lib/api/server";
import { buildSiteMetadata } from "@/lib/seo/build-metadata";
import { getSeoRequestContext } from "@/lib/seo/request-context";
import { truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [academy, ctx] = await Promise.all([
    getAcademyBySlug(slug).catch(() => null),
    getSeoRequestContext(),
  ]);
  if (!academy) {
    return { title: "404", robots: { index: false, follow: false } };
  }

  return buildSiteMetadata({
    title: academy.meta_title?.trim() || academy.name,
    description: truncate(
      academy.meta_description || academy.description || academy.name,
      160,
    ),
    ctx,
  });
}

/**
 * This route matches last, so every unknown path under an academy
 * ("/mehr/paths") lands here. Without the check those typos would each render a
 * duplicate academy home page with a 200, which misleads visitors and search
 * engines alike.
 *
 * Existence is a slug lookup, not a scan of the marketing directory — the
 * directory is capped and only lists published academies. If the backend is
 * unreachable the page still renders, so a hiccup never takes the home down.
 */
export default async function AcademyHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);
  if (!academy) {
    const directory = await getPublicAcademies();
    if (directory !== null) {
      notFound();
    }
  }

  return (
    <>
      <AcademyOrganizationJsonLd />
      <AcademyHomePage />
    </>
  );
}
