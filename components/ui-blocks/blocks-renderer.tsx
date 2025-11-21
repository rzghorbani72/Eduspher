import { UIBlockConfig } from "@/lib/theme-config";
import { HeroBlock } from "./hero-block";
import { FeaturesBlock } from "./features-block";
import { CoursesBlock } from "./courses-block";
import { TestimonialsBlock } from "./testimonials-block";
import { HeaderBlock } from "./header-block";
import { FooterBlock } from "./footer-block";

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

  return (
    <>
      {blocks.map((block) => {
        if (!block.isVisible) return null;

        switch (block.type) {
          case "header":
            return <HeaderBlock key={block.id} config={block.config} />;
          case "hero":
            return <HeroBlock key={block.id} config={block.config} />;
          case "features":
            return <FeaturesBlock key={block.id} config={block.config} />;
          case "courses":
            return <CoursesBlock key={block.id} config={block.config} />;
          case "testimonials":
            return <TestimonialsBlock key={block.id} config={block.config} />;
          case "footer":
            return <FooterBlock key={block.id} config={block.config} />;
          default:
            return null;
        }
      })}
    </>
  );
}

