import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyContext } from "@/lib/store-context";
import { resolveAssetUrl } from "@/lib/utils";

/**
 * The picture a shared link shows when the page itself has none. The manager's
 * chosen share image comes first, then the academy logo. Returns null rather
 * than a placeholder — an absent og:image beats a broken one.
 *
 * `getAcademyBySlug` is request-cached, so this is free alongside other SEO reads.
 */
export async function getAcademyShareImageUrl(): Promise<string | null> {
  try {
    const { slug } = await getAcademyContext();
    if (!slug) return null;
    const academy = await getAcademyBySlug(slug);
    const path = academy?.og_image?.publicUrl ?? academy?.logo?.publicUrl;
    return path ? resolveAssetUrl(path) : null;
  } catch {
    return null;
  }
}
