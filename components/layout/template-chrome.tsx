import { BlocksRenderer } from "@/components/ui-blocks/blocks-renderer";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeaderShell } from "@/components/layout/site-header-shell";
import { getStoreThemeAndTemplate, type UIBlockConfig } from "@/lib/theme-config";

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

export async function TemplateHeader() {
  const block = await chromeBlock("header");
  if (!block) return <SiteHeaderShell />;
  return <BlocksRenderer blocks={[block]} includeHeaderFooter />;
}

export async function TemplateFooter() {
  const block = await chromeBlock("footer");
  if (!block) return <SiteFooter />;
  return <BlocksRenderer blocks={[block]} includeHeaderFooter />;
}
