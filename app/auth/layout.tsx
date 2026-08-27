import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { getAcademyContext } from "@/lib/store-context";
import { getAcademyBySlug } from "@/lib/api/server";
import { resolveAssetUrl } from "@/lib/utils";
import { env } from "@/lib/env";
import { NOINDEX_ROBOTS } from "@/lib/seo/crawl-policy";

/** Auth flows are private — block indexing even if a link leaks. */
export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

function resolveLogoUrl(academy: Awaited<ReturnType<typeof getAcademyBySlug>>) {
  if (!academy) return null;
  const candidate =
    (academy as { logo?: { publicUrl?: string; filename?: string } }).logo
      ?.publicUrl ??
    (academy as { logo?: { publicUrl?: string; filename?: string } }).logo
      ?.filename ??
    academy.images?.[0]?.filename;
  return candidate ? resolveAssetUrl(candidate) : null;
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeContext = await getAcademyContext();
  const academy = storeContext.slug
    ? await getAcademyBySlug(storeContext.slug)
    : null;

  const academyName = academy?.name || env.siteName;
  const academySubtitle =
    academy?.domain?.public_address ||
    (academy?.slug ? `${academy.slug}.mentoma.ir` : undefined);
  const logoGlyph = academyName.trim().charAt(0) || "✦";

  return (
    <AuthShell
      academyName={academyName}
      academySubtitle={academySubtitle ?? undefined}
      logoUrl={resolveLogoUrl(academy)}
      logoGlyph={logoGlyph}
    >
      {children}
    </AuthShell>
  );
}
