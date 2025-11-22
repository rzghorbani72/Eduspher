import { UIBlockConfig } from "@/lib/theme-config";
import { HeroBlock } from "./hero-block";
import { FeaturesBlock } from "./features-block";
import { CoursesBlock } from "./courses-block";
import { TestimonialsBlock } from "./testimonials-block";
import { SidebarBlock } from "./sidebar-block";

interface BlocksRendererProps {
  blocks: UIBlockConfig[];
  schoolContext?: {
    id: number | null;
    slug: string | null;
    name: string | null;
  };
}

export function BlocksRenderer({ blocks, schoolContext }: BlocksRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  // Sort blocks by order to ensure correct rendering sequence
  // Filter out invisible blocks and header/footer blocks (they're rendered in layout)
  const visibleBlocks = blocks
    .filter((block) => block.isVisible !== false && block.type !== "header" && block.type !== "footer")
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (visibleBlocks.length === 0) {
    return null;
  }

  return (
    <>
      {visibleBlocks.map((block) => {
        try {
          switch (block.type) {
            case "hero":
              return <HeroBlock key={block.id} id={block.id} config={block.config} schoolContext={schoolContext} />;
            case "features":
              return <FeaturesBlock key={block.id} id={block.id} config={block.config} />;
            case "courses":
              return <CoursesBlock key={block.id} id={block.id} config={block.config} schoolContext={schoolContext} />;
            case "testimonials":
              return <TestimonialsBlock key={block.id} id={block.id} config={block.config} />;
            case "sidebar":
              return <SidebarBlock key={block.id} id={block.id} config={block.config} />;
            case "header":
            case "footer":
              // Header and footer are rendered in layout, skip them here
              return null;
            default:
              return null;
          }
        } catch (error) {
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

