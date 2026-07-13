import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/organization-json-ld";
import { getSeoRequestContext } from "@/lib/seo/request-context";

export async function PlatformOrganizationJsonLd() {
  const ctx = await getSeoRequestContext();
  if (!ctx.isPlatform || ctx.pathname !== "/") {
    return null;
  }

  const organization = buildOrganizationJsonLd(ctx);
  const website = buildWebSiteJsonLd(ctx);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
