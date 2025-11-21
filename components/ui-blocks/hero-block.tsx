import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroBlockProps {
  config?: {
    title?: string;
    subtitle?: string;
    showCTA?: boolean;
    ctaText?: string;
    ctaSecondary?: string;
    backgroundImage?: string | null;
    overlay?: boolean;
    alignment?: "left" | "center" | "right";
    height?: "small" | "medium" | "large";
  };
}

export function HeroBlock({ config }: HeroBlockProps) {
  const title = config?.title || "Welcome to Our School";
  const subtitle = config?.subtitle || "Learn something new today";
  const showCTA = config?.showCTA !== false;
  const ctaText = config?.ctaText || "Browse Courses";
  const alignment = config?.alignment || "center";
  const height = config?.height || "medium";

  const heightClasses = {
    small: "py-12",
    medium: "py-20",
    large: "py-32",
  };

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <section
      className={`relative ${heightClasses[height]} ${
        config?.backgroundImage ? "bg-cover bg-center" : ""
      }`}
      style={
        config?.backgroundImage
          ? {
              backgroundImage: `url(${config.backgroundImage})`,
            }
          : undefined
      }
    >
      {config?.backgroundImage && config?.overlay && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      <div className="relative mx-auto max-w-4xl px-6">
        <div className={alignmentClasses[alignment]}>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              {subtitle}
            </p>
          )}
          {showCTA && (
            <div
              className={`mt-10 flex ${
                alignment === "center"
                  ? "justify-center"
                  : alignment === "right"
                  ? "justify-end"
                  : "justify-start"
              } gap-x-6`}
            >
              <Button size="lg" asChild>
                <Link href="/courses">{ctaText}</Link>
              </Button>
              {config?.ctaSecondary && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/about">{config.ctaSecondary}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

