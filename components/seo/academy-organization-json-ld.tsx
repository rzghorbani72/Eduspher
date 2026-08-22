import { getAcademyBySlug } from "@/lib/api/server";
import { buildAcademyOrganizationJsonLd } from "@/lib/seo/organization-json-ld";
import { getSeoRequestContext } from "@/lib/seo/request-context";
import { getAcademyContext } from "@/lib/store-context";
import { resolveAssetUrl } from "@/lib/utils";

/** Structured data for an academy home page, so search engines list the school. */
export async function AcademyOrganizationJsonLd() {
  const ctx = await getSeoRequestContext();
  if (ctx.isPlatform) return null;

  const { slug } = await getAcademyContext();
  if (!slug) return null;

  const academy = await getAcademyBySlug(slug).catch(() => null);
  if (!academy?.name) return null;

  const jsonLd = buildAcademyOrganizationJsonLd(
    {
      name: academy.name,
      description: academy.meta_description ?? academy.description ?? null,
      logoUrl: resolveAssetUrl(academy.logo?.publicUrl),
    },
    ctx,
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
