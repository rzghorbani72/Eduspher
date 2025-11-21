import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildSchoolPath } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface HeroBlockProps {
  id?: string;
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
  schoolContext?: {
    id: number | null;
    slug: string | null;
    name: string | null;
  };
}

export function HeroBlock({ id, config, schoolContext }: HeroBlockProps) {
  const title = config?.title || "Welcome to Our School";
  const subtitle = config?.subtitle || "Learn something new today";
  const showCTA = config?.showCTA !== false;
  const ctaText = config?.ctaText || "Browse Courses";
  const alignment = config?.alignment || "center";
  const height = config?.height || "medium";
  const hasBackgroundImage = !!config?.backgroundImage;
  const overlay = config?.overlay === true;

  const heightClasses = {
    small: "py-8 sm:py-10",
    medium: "py-12 sm:py-16",
    large: "py-16 sm:py-20",
  };

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const maxWidthClasses = {
    left: "max-w-4xl",
    center: "max-w-4xl",
    right: "max-w-4xl",
  };

  return (
    <section
      id={id || "hero"}
      className={cn(
        "relative overflow-hidden",
        heightClasses[height],
        hasBackgroundImage
          ? "bg-cover bg-center bg-no-repeat"
          : "bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      )}
      style={
        hasBackgroundImage
          ? {
              backgroundImage: `url(${config.backgroundImage})`,
            }
          : undefined
      }
    >
      {/* Gradient overlay for better text readability */}
      {hasBackgroundImage && overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      )}
      
      {/* Decorative background elements */}
      {!hasBackgroundImage && (
          <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400/10 blur-3xl" />
          </div>
      )}

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 mt-14">
        <div
          className={cn(
            "mx-auto flex flex-col",
            alignmentClasses[alignment],
            maxWidthClasses[alignment]
          )}
        >
          <h1
            className={cn(
              "font-bold tracking-tight",
              height === "small"
                ? "text-3xl sm:text-4xl md:text-5xl"
                : height === "medium"
                ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
              hasBackgroundImage && overlay
                ? "text-white drop-shadow-2xl"
                : "text-slate-900 dark:text-white"
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn(
                "mt-3 leading-relaxed",
                height === "small"
                  ? "text-base sm:text-lg"
                  : "text-lg sm:text-xl md:text-2xl",
                hasBackgroundImage && overlay
                  ? "text-white/90 drop-shadow-lg"
                  : "text-slate-600 dark:text-slate-300"
              )}
            >
              {subtitle}
            </p>
          )}
          {showCTA && (
            <div
              className={cn(
                "mt-6 flex flex-wrap gap-4",
                alignment === "center"
                  ? "justify-center"
                  : alignment === "right"
                  ? "justify-end"
                  : "justify-start"
              )}
            >
              <Button 
                size={height === "small" ? "default" : "lg"}
                asChild
                className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40"
              >
                <Link href={buildSchoolPath(schoolContext?.slug ?? null, "/courses")} className="text-white">
                  {ctaText}
                </Link>
              </Button>
              {config?.ctaSecondary && (
                <Button 
                  size={height === "small" ? "default" : "lg"}
                  variant="outline" 
                  asChild
                  className={cn(
                    "border-2 transition-all hover:scale-105",
                    hasBackgroundImage && overlay
                      ? "border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/50"
                      : "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Link href={buildSchoolPath(schoolContext?.slug ?? null, "/about")} className="text-white">
                    {config.ctaSecondary}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

