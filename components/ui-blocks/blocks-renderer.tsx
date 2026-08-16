import { UIBlockConfig } from "@/lib/theme-config";
import { HeroBlock } from "./hero-block";
import { FeaturesBlock } from "./features-block";
import { CoursesBlock } from "./courses-block";
import { TestimonialsBlock } from "./testimonials-block";
import { HeaderBlock } from "./header-block";
import { FooterBlock } from "./footer-block";
import { MembershipBlock } from "./membership-block";
import { SidebarBlockServer } from "./sidebar-block-server";
import { MarqueeBlock } from "./marquee-block";
import { CourseGridBlock } from "./course-grid-block";
import { PricingBlock } from "./pricing-block";
import { CtaBlock } from "./cta-block";
import { CategoriesBlock } from "./categories-block";
import { ProjectsBlock } from "./projects-block";
import { resolveTemplateSection } from "@/components/templates/registry";

interface BlocksRendererProps {
  blocks: UIBlockConfig[];
  storeContext?: {
    id: string | null;
    slug: string | null;
    isSubdomain?: boolean;
    name: string | null;
    stats?: { courseCount: number; studentCount: number } | null;
    // Cuid academy scope used by preview real-data mode so dynamic blocks fetch
    // the editing academy's own records instead of the ambient/default one.
    academyId?: string | null;
    // Preview-only: lets sections top thin data up with labelled sample rows.
    sampleData?: boolean;
    editMode?: boolean;
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

  const visibleBlocks = blocks
    .filter((block) => {
      if (block.isVisible === false) return false;
      if (block.type === 'placeholder') return false;
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

  return (
    <div className="ui-blocks-root">
      {visibleBlocks.map((block) => {
        try {
          // One of the seven gallery templates owns this section type — render
          // its own design. Anything it does not implement falls through to the
          // shared blocks below, so legacy styles keep working unchanged.
          const TemplateSection = resolveTemplateSection(block.config?.style, block.type);
          if (TemplateSection) {
            return (
              <TemplateSection
                key={block.id}
                id={block.id}
                config={block.config}
                storeContext={storeContext}
              />
            );
          }

          switch (block.type) {
            case "header":
              return <HeaderBlock key={block.id} id={block.id} config={block.config} />;
            case "hero":
              return <HeroBlock key={block.id} id={block.id} config={block.config} storeContext={storeContext} />;
            case "slideshow":
              return <HeroBlock key={block.id} id={block.id} config={block.config} storeContext={storeContext} blockType="slideshow" />;
            case "features":
              return <FeaturesBlock key={block.id} id={block.id} config={block.config} />;
            case "courses":
              return <CoursesBlock key={block.id} id={block.id} config={block.config} storeContext={storeContext} />;
            case "testimonials":
              return <TestimonialsBlock key={block.id} id={block.id} config={block.config} />;
            case "membership":
              return <MembershipBlock key={block.id} id={block.id} config={block.config} storeContext={storeContext} />;
            case "footer":
              return <FooterBlock key={block.id} id={block.id} config={block.config} />;
            case "marquee":
              return <MarqueeBlock key={block.id} id={block.id} config={block.config} />;
            case "course-grid":
              return <CourseGridBlock key={block.id} id={block.id} config={block.config} />;
            case "pricing":
              return <PricingBlock key={block.id} id={block.id} config={block.config} />;
            case "cta":
              return <CtaBlock key={block.id} id={block.id} config={block.config} />;
            case "categories":
              return <CategoriesBlock key={block.id} id={block.id} config={block.config} />;
            case "projects":
              return <ProjectsBlock key={block.id} id={block.id} config={block.config} />;
            case "sidebar":
              return <SidebarBlockServer key={block.id} id={block.id} config={block.config} />;
            default:
              return null;
          }
        } catch (error) {
          console.error(`Error rendering block ${block.id} (${block.type}):`, error);
          return (
            <div key={block.id} className="p-4 bg-(--theme-surface-alt) border border-(--theme-border-color) rounded-lg">
              <p className="text-(--theme-foreground)">Error rendering block: {block.type}</p>
            </div>
          );
        }
      })}
    </div>
  );
}
