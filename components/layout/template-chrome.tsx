import { BlocksRenderer } from "@/components/ui-blocks/blocks-renderer";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeaderShell } from "@/components/layout/site-header-shell";
import { getStoreThemeAndTemplate, type UIBlockConfig } from "@/lib/theme-config";
import { getAcademyContext } from "@/lib/store-context";

/**
 * The academy's chosen template owns the site chrome, so a template switch
 * restyles every page — courses, bundles, checkout and the account area — not
 * just the home page. Templates that publish no header/footer block fall back to
 * the built-in chrome, which is what a brand-new academy sees.
 */
const chromeBlock = async (type: "header" | "footer") => {
  const { template } = await getStoreThemeAndTemplate();
  const blocks: UIBlockConfig[] = template?.blocks ?? [];
  return blocks.find((block) => block.type === type && block.isVisible !== false) ?? null;
};

// The chrome is rendered on its own, outside the page's block list, so it has
// to carry the academy context itself — without it every link in the footer
// drops the `/{slug}` prefix a path-based academy needs.
export async function TemplateHeader() {
  const [block, storeContext] = await Promise.all([
    chromeBlock("header"),
    getAcademyContext(),
  ]);
  if (!block) return <SiteHeaderShell />;
  return (
    <BlocksRenderer blocks={[block]} storeContext={storeContext} includeHeaderFooter />
  );
}

export async function TemplateFooter() {
  const [block, storeContext] = await Promise.all([
    chromeBlock("footer"),
    getAcademyContext(),
  ]);
  if (!block) return <SiteFooter />;
  return (
    <BlocksRenderer blocks={[block]} storeContext={storeContext} includeHeaderFooter />
  );
}
