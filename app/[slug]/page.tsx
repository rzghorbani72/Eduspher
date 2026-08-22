import { notFound } from "next/navigation";

import { AcademyHomePage } from "@/components/academy/academy-home-page";
import { AcademyOrganizationJsonLd } from "@/components/seo/academy-organization-json-ld";
import { getPublicAcademies } from "@/lib/api/server";

export const dynamic = "force-dynamic";

/**
 * This route matches last, so every unknown path under an academy
 * ("/mehr/paths") lands here. Without the check those typos would each render a
 * duplicate academy home page with a 200, which misleads visitors and search
 * engines alike.
 *
 * The check only rejects a slug we know is not an academy: when the list is
 * unavailable the page still renders, so a backend hiccup never takes the
 * academy home page down.
 */
export default async function AcademyHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const academies = await getPublicAcademies();
  if (academies && !academies.some((academy) => academy.slug === slug)) {
    notFound();
  }

  return (
    <>
      <AcademyOrganizationJsonLd />
      <AcademyHomePage />
    </>
  );
}
