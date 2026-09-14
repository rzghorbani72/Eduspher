import {
  buildOrganizationJsonLd,
  buildPlatformWebPageJsonLd,
  buildSiteNavigationJsonLd,
  buildSoftwareApplicationJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo/organization-json-ld';
import { getSeoRequestContext } from '@/lib/seo/request-context';
import { serializeJsonLd } from '@/lib/seo/json-ld-script';

/**
 * Brand entity graph for the platform host. Emitted on every public platform
 * page so Google can group Mentoma as one site (sitelinks), not loose URLs.
 * WebSite.name = منتوما drives the SERP site-name chip above the blue title.
 */
export async function PlatformOrganizationJsonLd() {
  const ctx = await getSeoRequestContext();
  if (!ctx.isPlatform) {
    return null;
  }

  const payloads: Record<string, unknown>[] = [
    buildOrganizationJsonLd(ctx),
    buildWebSiteJsonLd(ctx),
    ...buildSiteNavigationJsonLd(ctx),
    buildSoftwareApplicationJsonLd(ctx),
  ];

  const webPage = buildPlatformWebPageJsonLd(ctx);
  if (webPage) payloads.push(webPage);

  return (
    <>
      {payloads.map((data, index) => (
        <script
          // Stable keys from @id when present keep React reconciliation quiet.
          key={typeof data['@id'] === 'string' ? data['@id'] : `ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
    </>
  );
}
