import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildStorePath } from "@/lib/utils";
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
  storeContext?: {
    id: number | null;
    slug: string | null;
    name: string | null;
  };
}

export function HeroBlock({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || "Welcome to Our Store";
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
      
      {/* Enhanced animated decorative background elements */}
      {!hasBackgroundImage && (
          <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradient orbs with motion */}
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-[var(--theme-primary)]/20 to-[var(--theme-secondary)]/20 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-[var(--theme-secondary)]/20 to-[var(--theme-accent)]/20 blur-3xl animate-float-slow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[var(--theme-accent)]/10 via-[var(--theme-primary)]/10 to-[var(--theme-secondary)]/10 blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
          
          {/* Additional floating gradient orbs */}
          <div className="absolute top-1/4 right-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-[var(--theme-primary)]/15 to-[var(--theme-accent)]/15 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-1/3 left-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-[var(--theme-secondary)]/15 to-[var(--theme-primary)]/15 blur-3xl animate-float-slow" style={{ animationDelay: "1.2s" }} />
          
          {/* Floating particles with theme colors */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-[var(--theme-primary)]/30 rounded-full animate-float-slow shadow-lg shadow-[var(--theme-primary)]/50" style={{ animationDelay: "0s" }} />
          <div className="absolute bottom-32 right-32 w-1.5 h-1.5 bg-[var(--theme-secondary)]/30 rounded-full animate-float-slow shadow-lg shadow-[var(--theme-secondary)]/50" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-[var(--theme-accent)]/40 rounded-full animate-float-slow shadow-lg shadow-[var(--theme-accent)]/50" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-[var(--theme-primary)]/25 rounded-full animate-float-slow shadow-lg shadow-[var(--theme-primary)]/50" style={{ animationDelay: "0.8s" }} />
          <div className="absolute top-1/2 right-1/5 w-2 h-2 bg-[var(--theme-secondary)]/20 rounded-full animate-float-slow shadow-lg shadow-[var(--theme-secondary)]/50" style={{ animationDelay: "2.5s" }} />
          <div className="absolute bottom-1/5 left-1/2 w-1 h-1 bg-[var(--theme-accent)]/35 rounded-full animate-float-slow shadow-lg shadow-[var(--theme-accent)]/50" style={{ animationDelay: "1.8s" }} />
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
            data-scroll-animate="fadeInUp"
            data-scroll-delay="0"
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
            <span className="text-gradient-theme bg-clip-text text-transparent bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-secondary)] to-[var(--theme-accent)]">
            {title}
            </span>
          </h1>
          {subtitle && (
            <p
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.2"
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
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.4"
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
                size={height === "small" ? "md" : "lg"}
                asChild
                className="bg-gradient-theme-primary hover:opacity-90 text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[var(--theme-primary)]/40 relative"
              >
                <Link href={buildStorePath(storeContext?.slug ?? null, "/courses")} className="text-white">
                  {ctaText}
                </Link>
              </Button>
              {config?.ctaSecondary && (
                <Button 
                  size={height === "small" ? "md" : "lg"}
                  variant="outline" 
                  asChild
                  className={cn(
                    "border-2 transition-all hover:scale-105",
                    hasBackgroundImage && overlay
                      ? "border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/50"
                      : "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Link href={buildStorePath(storeContext?.slug ?? null, "/about")} className="text-white">
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

