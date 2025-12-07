import { UIBlockConfig } from "@/lib/theme-config";
import { HeroBlock } from "./hero-block";
import { FeaturesBlock } from "./features-block";
import { CoursesBlock } from "./courses-block";
import { TestimonialsBlock } from "./testimonials-block";
import { SidebarBlock } from "./sidebar-block";
import { HeaderBlock } from "./header-block";
import { FooterBlock } from "./footer-block";

interface BlocksRendererProps {
  blocks: UIBlockConfig[];
  storeContext?: {
    id: number | null;
    slug: string | null;
    name: string | null;
  };
  includeHeaderFooter?: boolean; // Option to include header/footer in blocks renderer
}

export function BlocksRenderer({ blocks, storeContext, includeHeaderFooter = false }: BlocksRendererProps) {
  if (!blocks || blocks.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[BlocksRenderer] No blocks provided');
    }
    return null;
  }

  // Sort blocks by order to ensure correct rendering sequence
  // Filter out invisible blocks
  // If includeHeaderFooter is false, filter out header/footer (they're rendered in layout)
  const visibleBlocks = blocks
    .filter((block) => {
      if (block.isVisible === false) return false;
      if (!includeHeaderFooter && (block.type === "header" || block.type === "footer")) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (visibleBlocks.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[BlocksRenderer] No visible blocks after filtering');
    }
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[BlocksRenderer] Rendering blocks:', visibleBlocks.map(b => ({
      id: b.id,
      type: b.type,
      order: b.order,
      hasConfig: !!b.config
    })));
  }

  return (
    <>
      {visibleBlocks.map((block) => {
        try {
          switch (block.type) {
            case "header":
              return <HeaderBlock key={block.id} id={block.id} config={block.config} />;
            case "hero":
              return <HeroBlock key={block.id} id={block.id} config={block.config} storeContext={storeContext} />;
            case "features":
              return <FeaturesBlock key={block.id} id={block.id} config={block.config} />;
            case "courses":
              return <CoursesBlock key={block.id} id={block.id} config={block.config} storeContext={storeContext} />;
            case "testimonials":
              return <TestimonialsBlock key={block.id} id={block.id} config={block.config} />;
            case "sidebar":
              return <SidebarBlock key={block.id} id={block.id} config={block.config} />;
            case "footer":
              return <FooterBlock key={block.id} id={block.id} config={block.config} />;
            default:
              console.warn(`Unknown block type: ${block.type}`);
              return null;
          }
        } catch (error) {
          console.error(`Error rendering block ${block.id} (${block.type}):`, error);
          return (
            <div key={block.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Error rendering block: {block.type}</p>
            </div>
          );
        }
      })}
    </>
  );
}
