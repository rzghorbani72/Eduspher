import type { CSSProperties } from "react";
import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { buildAcademyPath, cn, resolveAssetUrl } from "@/lib/utils";
import { hexContrast } from "@/lib/theme-apply";
import { HeroSlideshow, type SlideConfig } from "./hero-slideshow";
import {
  SectionMedia,
  type MediaAspect,
  type MediaSize,
} from "./section-media";

interface HeroBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    showCTA?: boolean;
    ctaText?: string;
    ctaSecondary?: string;
    backgroundImage?: string | null;
    /** Background controls from the Style tab (gradient = theme default). */
    bgType?: "gradient" | "solid" | "image";
    bgColor?: string;
    bgImage?: string | null;
    overlayOpacity?: number;
    illustration?: string | null;
    illustrationPreset?: string | null;
    overlay?: boolean;
    alignment?: "left" | "center" | "right";
    height?: "small" | "medium" | "large";
    speed?: "slow" | "normal" | "fast";
    style?:
      | "default"
      | "expert"
      | "creator-store"
      | "social"
      | "community"
      | "studio"
      | "creator"
      | "expert-academy"
      | "dark-programmer"
      | "flow"
      | "code"
      | "creative";
    /** Creative hero: 2×2 mini class cards + 4 headline stats. */
    stats?: { value: string; label: string }[];
    miniCards?: { title: string; instructor: string }[];
    /** Flow hero: highlighted middle line of the heading + decorative progress card. */
    titleEm?: string;
    titleEnd?: string;
    tag?: string;
    trustCount?: string;
    /** Code hero: trust block secondary line (rating) + live badge. */
    ratingText?: string;
    ratingLabel?: string;
    trustLabel?: string;
    liveText?: string;
    featuredLabel?: string;
    featuredTitle?: string;
    card?: {
      tag?: string;
      title?: string;
      instructor?: string;
      progress?: number;
      progressText?: string;
      stats?: { label: string; value: string }[];
      duration?: string;
      price?: string;
      rating?: string;
      ratingCount?: string;
      enroll?: string;
    };
    gradient?: "default" | "purple";
    dark?: boolean;
    showExpertPhotos?: boolean;
    showProductCards?: boolean;
    mediaSize?: MediaSize;
    mediaAspect?: MediaAspect;
    /** Multiple slides for the hero carousel. When provided, overrides single title/subtitle. */
    slides?: SlideConfig[];
    /** When true, fill stat fields (learner/course counts) from real academy data. */
    useLiveData?: boolean;
  };
  storeContext?: {
    id: string | null;
    slug: string | null;
    isSubdomain?: boolean;
    name: string | null;
    stats?: { courseCount: number; studentCount: number } | null;
  };
  blockType?: "hero" | "slideshow";
}

const heightCls = {
  small: "py-8 sm:py-10",
  medium: "py-12 sm:py-16",
  large: "py-20 sm:py-28",
};

const GRADIENT_BG =
  "linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 65%, color-mix(in srgb, var(--theme-secondary) 55%, var(--theme-accent)) 100%)";

type HeroBg =
  | { kind: "image"; url: string; overlay: number }
  | { kind: "solid"; color: string }
  | { kind: "gradient" };

// Resolves the Style-tab background config into one shape. Accepts both the new
// keys (bgType/bgColor/bgImage/overlayOpacity) and the legacy `backgroundImage`.
function resolveHeroBg(config?: HeroBlockProps["config"]): HeroBg {
  const url = resolveAssetUrl(config?.bgImage ?? config?.backgroundImage);
  const bgType = config?.bgType ?? (url ? "image" : "gradient");
  if (bgType === "image" && url) {
    return { kind: "image", url, overlay: config?.overlayOpacity ?? 40 };
  }
  if (bgType === "solid" && config?.bgColor) {
    return { kind: "solid", color: config.bgColor };
  }
  return { kind: "gradient" };
}

function heroBgStyle(bg: HeroBg): CSSProperties {
  if (bg.kind === "image") return { backgroundImage: `url(${bg.url})` };
  if (bg.kind === "solid") return { background: bg.color };
  return { background: GRADIENT_BG };
}

function heroContentColorFor(bg: HeroBg): string {
  if (bg.kind === "image") return "#ffffff";
  if (bg.kind === "solid") return hexContrast(bg.color);
  return "var(--theme-on-primary)";
}

function HeroOverlay({ bg }: { bg: HeroBg }) {
  if (bg.kind !== "image" || bg.overlay <= 0) return null;
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ backgroundColor: `rgba(0, 0, 0, ${bg.overlay / 100})` }}
    />
  );
}

function speedToMs(speed?: string) {
  if (speed === "slow") return 5000;
  if (speed === "fast") return 1500;
  return 2800;
}

// In "dynamic data" mode, fill the hero's learner-count field from real academy
// stats. Falls back to the static config when live data is off or unavailable
// (e.g. a brand-new academy with zero students), so the hero never reads "0".
function applyDynamicData(
  config: HeroBlockProps["config"],
  stats: { courseCount: number; studentCount: number } | null | undefined,
): HeroBlockProps["config"] {
  if (!config?.useLiveData || !stats) return config;
  const next = { ...config };
  if (stats.studentCount > 0) {
    next.trustCount = `${stats.studentCount.toLocaleString("fa-IR")}+`;
  }
  return next;
}

// Shared illustration slot — owner-uploaded image with bounded size/aspect.
function HeroMedia({
  config,
  defaultSize = "lg",
}: {
  config?: HeroBlockProps["config"];
  defaultSize?: MediaSize;
}) {
  return (
    <SectionMedia
      src={resolveAssetUrl(config?.illustration)}
      alt={config?.title ?? ""}
      size={config?.mediaSize ?? defaultSize}
      aspect={config?.mediaAspect ?? "4:3"}
    />
  );
}

export function HeroBlock({
  id,
  config: rawConfig,
  storeContext,
  blockType,
}: HeroBlockProps) {
  const config = applyDynamicData(rawConfig, storeContext?.stats);
  // Slideshow block type: always render as full-width image carousel
  if (blockType === "slideshow") {
    const slides = (config?.slides as SlideConfig[] | undefined) ?? [];
    const height = (config?.height ?? "large") as "small" | "medium" | "large";
    const alignment = (config?.alignment ?? "center") as
      | "left"
      | "center"
      | "right";
    return (
      <section id={id || "hero"}>
        <HeroSlideshow
          slides={slides.length > 0 ? slides : [{}]}
          alignment={alignment}
          height={height}
          storeContext={storeContext}
          dark
          interval={speedToMs(config?.speed)}
        />
      </section>
    );
  }

  const style = config?.style ?? "default";
  if (style === "expert" || style === "expert-academy")
    return (
      <ExpertAcademyHero id={id} config={config} storeContext={storeContext} />
    );
  if (style === "creator-store" || style === "creator")
    return <CreatorHero id={id} config={config} storeContext={storeContext} />;
  if (style === "social")
    return <SocialHero id={id} config={config} storeContext={storeContext} />;
  if (style === "community")
    return (
      <CommunityHero id={id} config={config} storeContext={storeContext} />
    );
  if (style === "studio")
    return <StudioHero id={id} config={config} storeContext={storeContext} />;
  if (style === "dark-programmer")
    return (
      <DarkProgrammerHero id={id} config={config} storeContext={storeContext} />
    );
  if (style === "flow")
    return <FlowHero id={id} config={config} storeContext={storeContext} />;
  if (style === "code")
    return <CodeHero id={id} config={config} storeContext={storeContext} />;
  if (style === "creative")
    return <CreativeHero id={id} config={config} storeContext={storeContext} />;
  return <DefaultHero id={id} config={config} storeContext={storeContext} />;
}

// ── Default ───────────────────────────────────────────────────────────────────

function DefaultHero({ id, config, storeContext }: HeroBlockProps) {
  const alignment = (config?.alignment ?? "center") as
    | "left"
    | "center"
    | "right";
  const height = (config?.height ?? "medium") as "small" | "medium" | "large";
  const hasIllustration = !!(
    config?.illustration || config?.illustrationPreset
  );

  // If slides array provided, delegate entirely to the carousel
  if (config?.slides && config.slides.length > 1) {
    return (
      <section id={id || "hero"}>
        <HeroSlideshow
          slides={config.slides}
          alignment={alignment}
          height={height}
          storeContext={storeContext}
          dark
          interval={speedToMs(config?.speed)}
        />
      </section>
    );
  }

  const title = config?.title || "به آکادمی ما خوش آمدید";
  const subtitle = config?.subtitle || "بهترین دوره‌های آموزشی را اینجا بیابید";
  const showCTA = config?.showCTA !== false;
  const ctaText = config?.ctaText || "مرور دوره‌ها";
  const titleSz =
    height === "small"
      ? "text-3xl sm:text-4xl md:text-5xl"
      : height === "medium"
        ? "text-4xl sm:text-5xl md:text-6xl"
        : "text-5xl sm:text-6xl md:text-7xl";
  const bg = resolveHeroBg(config);
  const isGradient = bg.kind === "gradient";
  const bgStyle = heroBgStyle(bg);
  const heroContentColor = heroContentColorFor(bg);

  // Split layout when illustration is configured (uploaded or built-in default)
  if (hasIllustration) {
    return (
      <section
        id={id || "hero"}
        className={cn(
          "relative overflow-hidden",
          heightCls[height],
          bg.kind === "image" ? "bg-cover bg-center" : "",
        )}
        style={{ ...bgStyle, color: heroContentColor }}
      >
        <HeroOverlay bg={bg} />
        {isGradient && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-float-slow" />
            <div
              className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/8 blur-3xl animate-float-slow"
              style={{ animationDelay: "1s" }}
            />
          </div>
        )}
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-4">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            {/* Text side */}
            <div
              className={cn(
                alignment === "center" ? "text-center" : "text-left",
              )}
            >
              <h1
                data-scroll-animate="fadeIn"
                data-editable="title"
                className={cn("font-bold tracking-tight", titleSz)}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  data-scroll-animate="fadeIn"
                  data-scroll-delay="0.15"
                  data-editable="subtitle"
                  data-editable-kind="rich"
                  className="mt-4 leading-relaxed text-lg sm:text-xl opacity-80"
                  dangerouslySetInnerHTML={{ __html: subtitle }}
                />
              )}
              {showCTA && (
                <div
                  data-scroll-animate="slideLeft"
                  data-scroll-delay="0.3"
                  className={cn(
                    "mt-8 flex flex-wrap gap-4",
                    alignment === "center" ? "justify-center" : "justify-start",
                  )}
                >
                  <Button
                    size="lg"
                    asChild
                    className="font-semibold hover:opacity-90"
                    style={
                      isGradient
                        ? {
                            backgroundColor: "var(--theme-background)",
                            color: "var(--theme-primary)",
                            borderRadius: "var(--theme-border-radius)",
                            boxShadow: "var(--theme-shadow)",
                          }
                        : { color: heroContentColor }
                    }
                  >
                    <Link
                      href={buildAcademyPath(
                        storeContext?.isSubdomain
                          ? null
                          : (storeContext?.slug ?? null),
                        "/courses",
                      )}
                    >
                      <span data-editable="ctaText">{ctaText}</span>
                    </Link>
                  </Button>
                  {config?.ctaSecondary && (
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      style={{
                        borderColor:
                          "color-mix(in srgb, var(--theme-on-primary) 40%, transparent)",
                        color: "var(--theme-on-primary)",
                      }}
                    >
                      <Link
                        href={buildAcademyPath(
                          storeContext?.isSubdomain
                            ? null
                            : (storeContext?.slug ?? null),
                          "/about",
                        )}
                      >
                        <span data-editable="ctaSecondary">
                          {config.ctaSecondary}
                        </span>
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
            {/* Illustration side */}
            <div
              data-scroll-animate="slideRight"
              className="flex justify-center lg:justify-end"
            >
              <HeroMedia config={config} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Centered layout (no illustration configured)
  const alignMap = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };
  return (
    <section
      id={id || "hero"}
      className={cn(
        "relative overflow-hidden",
        heightCls[height],
        bg.kind === "image" ? "bg-cover bg-center" : "",
      )}
      style={{ ...bgStyle, color: heroContentColor }}
    >
      <HeroOverlay bg={bg} />
      {isGradient && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-float-slow" />
          <div
            className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/8 blur-3xl animate-float-slow"
            style={{ animationDelay: "1s" }}
          />
        </div>
      )}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 mt-14">
        <div
          className={cn("mx-auto max-w-4xl flex flex-col", alignMap[alignment])}
        >
          <h1
            data-scroll-animate="fadeIn"
            data-editable="title"
            className={cn("font-bold tracking-tight", titleSz)}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.15"
              data-editable="subtitle"
              data-editable-kind="rich"
              className="mt-3 leading-relaxed text-lg sm:text-xl opacity-80"
              dangerouslySetInnerHTML={{ __html: subtitle }}
            />
          )}
          {showCTA && (
            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.3"
              className={cn(
                "mt-6 flex flex-wrap gap-4",
                alignment === "center" ? "justify-center" : "justify-start",
              )}
            >
              <Button
                size="lg"
                asChild
                className="font-semibold hover:opacity-90"
                style={
                  isGradient
                    ? {
                        backgroundColor: "var(--theme-background)",
                        color: "var(--theme-primary)",
                        borderRadius: "var(--theme-border-radius)",
                        boxShadow: "var(--theme-shadow)",
                      }
                    : { color: heroContentColor }
                }
              >
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain
                      ? null
                      : (storeContext?.slug ?? null),
                    "/courses",
                  )}
                >
                  <span data-editable="ctaText">{ctaText}</span>
                </Link>
              </Button>
              {config?.ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--theme-on-primary) 40%, transparent)",
                    color: "var(--theme-on-primary)",
                  }}
                >
                  <Link
                    href={buildAcademyPath(
                      storeContext?.isSubdomain
                        ? null
                        : (storeContext?.slug ?? null),
                      "/about",
                    )}
                  >
                    <span data-editable="ctaSecondary">
                      {config.ctaSecondary}
                    </span>
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

// ── Expert Academy (Kajabi-inspired) ─────────────────────────────────────────

function ExpertAcademyHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || "تخصص خود را به شهرت تبدیل کنید";
  const subtitle =
    config?.subtitle || "پلتفرم جامع برای ساخت، فروش و رشد کسب‌وکار تخصصی شما";
  const ctaText = config?.ctaText || "شروع رایگان";
  const ctaSecondary = config?.ctaSecondary || "نحوه کار را ببین";
  const hasIllustration = !!(
    config?.illustration || config?.illustrationPreset
  );

  return (
    <section
      id={id || "hero"}
      className="relative overflow-hidden bg-(--theme-background) py-20 sm:py-28"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-(--theme-primary)/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-(--theme-accent)/15 blur-2xl" />
        <div className="absolute top-20 left-1/2 h-1 w-32 bg-linear-to-r from-transparent via-(--theme-primary)/40 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className={cn(
            "grid grid-cols-1 items-center gap-12",
            hasIllustration && "lg:grid-cols-2",
          )}
        >
          {/* Text side */}
          <div>
            <div
              data-scroll-animate="fadeIn"
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--theme-primary-subtle) px-4 py-1.5 text-sm font-medium text-(--theme-primary)"
            >
              <span className="h-2 w-2 rounded-full bg-(--theme-primary) animate-pulse" />
              مورد اعتماد ۱۰۰هزار+ مدرس
            </div>
            <h1
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.1"
              className="text-4xl font-bold tracking-tight text-(--theme-foreground) sm:text-5xl md:text-6xl leading-tight"
            >
              {title}
            </h1>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.2"
              className="mt-5 text-lg leading-relaxed text-(--theme-foreground)/70 max-w-xl"
            >
              {subtitle}
            </p>

            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.3"
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                asChild
                className="bg-(--theme-primary) text-(--theme-on-primary) shadow-xl font-semibold px-8 hover:opacity-90"
              >
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain
                      ? null
                      : (storeContext?.slug ?? null),
                    "/courses",
                  )}
                  className="text-(--theme-on-primary)"
                >
                  {ctaText}
                </Link>
              </Button>
              {ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-(--theme-border-strong) text-(--theme-foreground)/70 hover:bg-(--theme-surface-alt) font-semibold"
                >
                  <Link
                    href={buildAcademyPath(
                      storeContext?.isSubdomain
                        ? null
                        : (storeContext?.slug ?? null),
                      "/pricing",
                    )}
                    className="text-(--theme-foreground)/70"
                  >
                    {ctaSecondary}
                  </Link>
                </Button>
              )}
            </div>

            {config?.showExpertPhotos !== false && (
              <div
                data-scroll-animate="fadeIn"
                data-scroll-delay="0.45"
                className="mt-10 flex items-center gap-3"
              >
                <div className="flex -space-x-3">
                  {["👩‍🏫", "👨‍💼", "👩‍🎤", "👨‍🎨", "👩‍⚕️"].map((e, i) => (
                    <div
                      key={i}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-(--theme-card-bg) text-lg shadow-md ring-2 ring-(--theme-background)"
                    >
                      {e}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {"★★★★★".split("").map((s, i) => (
                      <span key={i} className="text-(--theme-accent) text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-(--theme-foreground)/55 mt-0.5">
                    به ۱۰۰هزار+ مدرس موفق بپیوندید
                  </p>
                </div>
              </div>
            )}
          </div>

          {hasIllustration && (
            <div
              data-scroll-animate="slideRight"
              className="flex justify-center lg:justify-end"
            >
              <HeroMedia config={config} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Studio (Warm split — for educators & studio owners) ───────────────────────

function StudioHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || "استودیوی شما، قوانین شما";
  const subtitle =
    config?.subtitle ||
    "با یک پلتفرم جامع و زیبا دوره‌هایتان را بسازید، تدریس کنید و بفروشید";
  const ctaText = config?.ctaText || "شروع به ساخت";
  const ctaSecondary = config?.ctaSecondary || "کاوش ویژگی‌ها";

  return (
    <section
      id={id || "hero"}
      className="relative overflow-hidden bg-(--theme-surface-alt) py-20 sm:py-28"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-(--theme-secondary)/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-(--theme-accent)/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Text side */}
          <div>
            <div
              data-scroll-animate="slideLeft"
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-(--theme-border-color) bg-(--theme-secondary-subtle) px-4 py-1.5 text-sm font-medium text-(--theme-secondary)"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              برای مدرسان ساخته شده
            </div>
            <h1
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.1"
              className="text-4xl font-bold tracking-tight text-(--theme-foreground) sm:text-5xl lg:text-6xl leading-tight"
            >
              {title}
            </h1>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.2"
              className="mt-5 text-lg leading-relaxed text-(--theme-foreground)/70"
            >
              {subtitle}
            </p>

            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.3"
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                asChild
                className="bg-(--theme-primary) text-(--theme-on-primary) shadow-lg font-semibold hover:opacity-90"
              >
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain
                      ? null
                      : (storeContext?.slug ?? null),
                    "/courses",
                  )}
                  className="text-(--theme-on-primary)"
                >
                  {ctaText}
                </Link>
              </Button>
              {ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-(--theme-border-strong) text-(--theme-foreground)/70 hover:bg-(--theme-surface)"
                >
                  <Link
                    href={buildAcademyPath(
                      storeContext?.isSubdomain
                        ? null
                        : (storeContext?.slug ?? null),
                      "/about",
                    )}
                    className="text-(--theme-foreground)/70"
                  >
                    {ctaSecondary}
                  </Link>
                </Button>
              )}
            </div>

            {/* Trust indicators */}
            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.4"
              className="mt-10 grid grid-cols-3 gap-4"
            >
              {[
                ["۵هزار+", "دوره"],
                ["۹۸٪", "رضایت‌مندی"],
                ["۲۴/۷", "پشتیبانی"],
              ].map(([val, label], i) => (
                <div
                  key={i}
                  className="rounded-xl bg-(--theme-card-bg) p-3 text-center shadow-sm border border-(--theme-border-color)"
                >
                  <p className="text-xl font-bold text-(--theme-primary)">
                    {val}
                  </p>
                  <p className="text-xs text-(--theme-foreground)/55 mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual side */}
          <div data-scroll-animate="slideRight" className="relative">
            <div className="relative rounded-2xl bg-(--theme-card-bg) p-4 shadow-2xl border border-(--theme-border-color)">
              {/* Mock course card */}
              <div
                className="rounded-xl p-5 text-(--theme-on-primary) mb-3"
                style={{
                  background:
                    "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))",
                }}
              >
                <p className="text-xs font-medium opacity-80">دوره برگزیده</p>
                <p className="mt-1 text-lg font-bold leading-tight">
                  تسلط بر مهارت در ۳۰ روز
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm">
                    👩‍🏫
                  </div>
                  <span className="text-xs opacity-80">
                    ۱۲ درس · ۴ ساعت محتوا
                  </span>
                </div>
              </div>
              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-2">
                {["🎓 یادگیری", "🏆 گواهینامه", "🚀 رشد"].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-(--theme-surface-alt) p-2 text-center text-xs font-medium text-(--theme-foreground)/80"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -right-4 -top-4 rounded-xl bg-(--theme-primary) px-3 py-2 text-(--theme-on-primary) shadow-lg">
              <p className="text-xs font-bold">🔥 محبوب</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Creator (Bold creator economy) ────────────────────────────────────────────

function CreatorHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || "پلتفرم جامع برای مدرسان مدرن";
  const subtitle =
    config?.subtitle ||
    "دوره‌ها، محصولات دیجیتال و اشتراک‌ها را از یک فروشگاه زیبا بفروشید";
  const ctaText = config?.ctaText || "شروع رایگان";
  const ctaSecondary = config?.ctaSecondary || "مشاهده دمو";

  const products = [
    { icon: "📚", label: "دوره‌ها" },
    { icon: "🎁", label: "محصولات دیجیتال" },
    { icon: "👥", label: "اشتراک‌ها" },
    { icon: "🎙️", label: "مشاوره" },
  ];

  return (
    <section
      id={id || "hero"}
      className="relative overflow-hidden bg-(--theme-background) py-20 sm:py-28"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-(--theme-primary)/15 blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-(--theme-accent)/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Text */}
          <div>
            <div
              data-scroll-animate="slideLeft"
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-(--theme-primary) px-4 py-1.5 text-sm font-semibold text-(--theme-on-primary) shadow-lg"
            >
              ✨ ساخته‌شده برای مدرسانی مثل شما
            </div>
            <h1
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.1"
              className="text-4xl font-extrabold tracking-tight text-(--theme-foreground) sm:text-5xl lg:text-6xl leading-[1.1]"
            >
              {title}
            </h1>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.2"
              className="mt-5 text-lg leading-relaxed text-(--theme-foreground)/70"
            >
              {subtitle}
            </p>

            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.3"
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button
                size="lg"
                asChild
                className="bg-(--theme-primary) text-(--theme-on-primary) shadow-xl font-bold px-8 rounded-full hover:opacity-90"
              >
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain
                      ? null
                      : (storeContext?.slug ?? null),
                    "/courses",
                  )}
                  className="text-(--theme-on-primary)"
                >
                  {ctaText}
                </Link>
              </Button>
              {ctaSecondary && (
                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="text-(--theme-primary) hover:bg-(--theme-primary-subtle) font-semibold gap-2"
                >
                  <Link
                    href={buildAcademyPath(
                      storeContext?.isSubdomain
                        ? null
                        : (storeContext?.slug ?? null),
                      "/about",
                    )}
                    className="text-(--theme-primary)"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--theme-primary-subtle)">
                      ▶
                    </span>
                    {ctaSecondary}
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Product pills grid */}
          <div
            data-scroll-animate="slideRight"
            className="grid grid-cols-2 gap-4"
          >
            {products.map((p, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-2xl p-5 shadow-sm border border-(--theme-border-color) bg-(--theme-card-bg) hover:shadow-md transition-shadow",
                  i % 2 === 1 ? "mt-6" : "",
                )}
              >
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <p className="font-semibold text-(--theme-foreground) text-sm">
                    {p.label}
                  </p>
                  <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-(--theme-primary-subtle) text-(--theme-primary)">
                    آماده فروش
                  </span>
                </div>
              </div>
            ))}
            {/* Revenue widget */}
            <div
              className="col-span-2 rounded-2xl p-5 text-(--theme-on-primary) shadow-xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))",
              }}
            >
              <p className="text-sm font-medium opacity-80">درآمد این ماه</p>
              <p className="text-3xl font-bold mt-1">۱۲٬۸۴۰ هزار تومان</p>
              <p className="text-xs opacity-70 mt-1">↑ ۲۴٪ نسبت به ماه قبل</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Social / Stan-inspired ─────────────────────────────────────────────────────

function SocialHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || "فروشگاه جامع مدرسان محتوا";
  const subtitle =
    config?.subtitle || "به بیش از ۱۰۰٬۰۰۰ صاحب کسب‌وکار موفق بپیوندید";
  const ctaText = config?.ctaText || "شروع رایگان";
  const hasIllustration = !!(
    config?.illustration || config?.illustrationPreset
  );

  return (
    <section
      id={id || "hero"}
      className="relative overflow-hidden py-20 sm:py-28 text-(--theme-on-primary)"
      style={{
        background:
          "linear-gradient(135deg, var(--theme-primary), var(--theme-secondary) 60%, color-mix(in srgb, var(--theme-secondary) 60%, var(--theme-accent)))",
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className={cn(
            "grid grid-cols-1 items-center gap-10",
            hasIllustration && "lg:grid-cols-2",
          )}
        >
          <div>
            <h1
              data-scroll-animate="slideLeft"
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              {title}
            </h1>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.15"
              className="mt-5 text-lg leading-relaxed opacity-80"
            >
              {subtitle}
            </p>
            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.3"
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                asChild
                className="bg-(--theme-accent) text-(--theme-on-accent) font-semibold shadow-xl rounded-full px-8 hover:opacity-90"
              >
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain
                      ? null
                      : (storeContext?.slug ?? null),
                    "/courses",
                  )}
                >
                  {ctaText}
                </Link>
              </Button>
            </div>
          </div>
          {hasIllustration && (
            <div
              data-scroll-animate="slideRight"
              className="flex justify-center lg:justify-end"
            >
              <HeroMedia config={config} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Community (Circle-inspired, dark) ─────────────────────────────────────────

function CommunityHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || "جایی که جامعه شما زنده می‌شود";
  const subtitle =
    config?.subtitle || "فضاهایی برای ارتباط، یادگیری و رشد مخاطبانتان بسازید";
  const ctaText = config?.ctaText || "جامعه خود را بسازید";
  const ctaSecondary = config?.ctaSecondary || "نمونه‌ها را ببین";
  const hasIllustration = !!(
    config?.illustration || config?.illustrationPreset
  );

  return (
    <section
      id={id || "hero"}
      className="relative overflow-hidden bg-(--theme-background) py-24 sm:py-32"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-(--theme-primary)/30 blur-3xl" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-(--theme-secondary)/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className={cn(
            "grid grid-cols-1 items-center gap-12",
            hasIllustration && "lg:grid-cols-2",
          )}
        >
          {/* Text side */}
          <div>
            <div
              data-scroll-animate="fadeIn"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--theme-border-color) bg-(--theme-primary-subtle) px-4 py-1.5 text-sm font-medium text-(--theme-primary) backdrop-blur-sm"
            >
              <span className="h-2 w-2 rounded-full bg-(--theme-primary) animate-pulse" />
              در نسخه بتا عمومی
            </div>

            <h1
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.1"
              className="text-4xl font-bold tracking-tight text-(--theme-foreground) sm:text-5xl lg:text-6xl leading-tight"
            >
              {title}
            </h1>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.2"
              className="mt-6 text-lg leading-relaxed text-(--theme-foreground)/65"
            >
              {subtitle}
            </p>

            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.3"
              className="mt-10 flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                asChild
                className="bg-(--theme-primary) text-(--theme-on-primary) font-semibold shadow-xl px-8 rounded-xl hover:opacity-90"
              >
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain
                      ? null
                      : (storeContext?.slug ?? null),
                    "/courses",
                  )}
                >
                  {ctaText}
                </Link>
              </Button>
              {ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-(--theme-border-strong) text-(--theme-foreground)/70 hover:bg-(--theme-surface-alt) hover:text-(--theme-foreground) rounded-xl"
                >
                  <Link
                    href={buildAcademyPath(
                      storeContext?.isSubdomain
                        ? null
                        : (storeContext?.slug ?? null),
                      "/about",
                    )}
                  >
                    {ctaSecondary}
                  </Link>
                </Button>
              )}
            </div>

            <div
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.45"
              className="mt-10 flex items-center gap-3"
            >
              <div className="flex -space-x-3">
                {["🧑‍💼", "👩‍🎓", "👨‍🔬", "👩‍🎨", "🧑‍🏫"].map((e, i) => (
                  <div
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-(--theme-card-bg) text-lg ring-2 ring-(--theme-background)"
                  >
                    {e}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i} className="text-(--theme-accent) text-xs">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-(--theme-foreground)/55 mt-0.5">
                  ۱۰٬۰۰۰+ عضو فعال
                </p>
              </div>
            </div>
          </div>

          {hasIllustration && (
            <div
              data-scroll-animate="slideRight"
              className="flex justify-center lg:justify-end"
            >
              <HeroMedia config={config} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Dark Programmer / Rocket ──────────────────────────────────────────────────

function DarkProgrammerHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || "کدنویسی را جدی بگیر";
  const subtitle =
    config?.subtitle || "بیش از ۵۰۰ دوره برنامه‌نویسی با ضمانت کیفیت";
  const ctaText = config?.ctaText || "شروع یادگیری";
  const ctaSecondary = config?.ctaSecondary || "مشاهده دوره‌ها";
  const hasIllustration = !!(
    config?.illustration || config?.illustrationPreset
  );

  return (
    <section
      id={id || "hero"}
      className="relative overflow-hidden bg-(--theme-background) py-20 sm:py-28"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-(--theme-primary)/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-(--theme-accent)/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <div
              data-scroll-animate="fadeIn"
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-(--theme-primary)/40 bg-(--theme-primary-subtle) px-4 py-1.5 text-sm font-medium text-(--theme-primary)"
            >
              <span className="h-2 w-2 rounded-full bg-(--theme-primary) animate-pulse" />
              ۵۰۰+ دوره تخصصی
            </div>
            <h1
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.1"
              className="text-4xl font-bold tracking-tight text-(--theme-foreground) sm:text-5xl lg:text-6xl leading-tight"
            >
              {title}
            </h1>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.2"
              className="mt-5 text-lg leading-relaxed text-(--theme-foreground)/65"
            >
              {subtitle}
            </p>
            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.3"
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                asChild
                className="bg-(--theme-primary) text-(--theme-on-primary) font-bold shadow-xl rounded-full px-8 hover:opacity-90"
              >
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain
                      ? null
                      : (storeContext?.slug ?? null),
                    "/courses",
                  )}
                >
                  {ctaText}
                </Link>
              </Button>
              {ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-(--theme-border-strong) text-(--theme-foreground)/70 hover:bg-(--theme-surface-alt) rounded-full"
                >
                  <Link
                    href={buildAcademyPath(
                      storeContext?.isSubdomain
                        ? null
                        : (storeContext?.slug ?? null),
                      "/courses",
                    )}
                  >
                    {ctaSecondary}
                  </Link>
                </Button>
              )}
            </div>
            <div
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.45"
              className="mt-8 flex items-center gap-4"
            >
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {["👨‍💻", "👩‍💻", "🧑‍🎓", "👩‍🔬"].map((a, i) => (
                  <span
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-(--theme-background) bg-(--theme-card-bg) text-base"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i} className="text-(--theme-accent) text-sm">
                      {s}
                    </span>
                  ))}
                  <span className="ms-1 text-sm font-semibold text-(--theme-foreground)">
                    ۴.۸
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-(--theme-foreground)/55">
                  ۱۲۰,۰۰۰ دانش‌آموز در سراسر ایران
                </p>
              </div>
            </div>
          </div>
          {hasIllustration ? (
            <div
              data-scroll-animate="slideRight"
              className="flex justify-center lg:justify-end"
            >
              <HeroMedia config={config} />
            </div>
          ) : (
            <DarkProgrammerShowcase storeContext={storeContext} />
          )}
        </div>
      </div>
    </section>
  );
}

function DarkProgrammerShowcase({
  storeContext,
}: {
  storeContext?: HeroBlockProps["storeContext"];
}) {
  return (
    <div
      data-scroll-animate="slideRight"
      className="relative mx-auto w-full max-w-md"
    >
      {/* Live learners badge */}
      <div className="absolute -top-4 right-6 z-20 inline-flex items-center gap-2 rounded-full border border-(--theme-accent)/50 bg-(--theme-accent-subtle) px-3 py-1.5 text-xs font-medium text-(--theme-accent) shadow-lg">
        <span className="h-2 w-2 rounded-full bg-(--theme-accent) animate-pulse" />
        همین الان ۲۳۴ نفر در حال یادگیری
      </div>

      {/* Code editor card */}
      <div className="overflow-hidden rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) shadow-2xl">
        <div className="flex items-center gap-2 border-b border-(--theme-border-color) px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-(--theme-foreground)/30" />
          <span className="h-3 w-3 rounded-full bg-(--theme-foreground)/30" />
          <span className="h-3 w-3 rounded-full bg-(--theme-foreground)/30" />
          <span className="ms-auto text-xs text-(--theme-foreground)/50">
            JavaScript
          </span>
        </div>
        <pre
          dir="ltr"
          className="px-5 py-4 text-left font-mono text-sm leading-6"
        >
          <code>
            <span className="text-(--theme-primary)">function</span>{" "}
            <span className="text-(--theme-secondary)">calcAverage</span>
            <span className="text-(--theme-foreground)/60">
              (datasets) {"{"}
            </span>
            {"\n"}
            {"  "}
            <span className="text-(--theme-primary)">let</span>{" "}
            <span className="text-(--theme-foreground)">subjectAverage</span>{" "}
            <span className="text-(--theme-foreground)/60">=</span>{" "}
            <span className="text-(--theme-accent)">0</span>
            <span className="text-(--theme-foreground)/60">;</span>
            {"\n"}
            {"  "}
            <span className="text-(--theme-foreground)">datasets</span>
            <span className="text-(--theme-foreground)/60">.</span>
            <span className="text-(--theme-secondary)">forEach</span>
            <span className="text-(--theme-foreground)/60">
              ((dataset) {"=> {"}
            </span>
            {"\n"}
            {"    "}
            <span className="text-(--theme-foreground)">
              subjectAverage
            </span>{" "}
            <span className="text-(--theme-foreground)/60">+=</span>{" "}
            <span className="text-(--theme-secondary)">parseFloat</span>
            <span className="text-(--theme-foreground)/60">(dataset);</span>
            {"\n"}
            {"  "}
            <span className="text-(--theme-foreground)/60">{"});"}</span>
            {"\n"}
            <span className="text-(--theme-foreground)/60">{"}"}</span>
          </code>
        </pre>
      </div>

      {/* Achievement badge */}
      <div className="absolute -bottom-3 -left-3 z-20 inline-flex items-center gap-2 rounded-xl border border-(--theme-border-color) bg-(--theme-card-bg) px-3 py-2 text-xs font-medium text-(--theme-foreground)/80 shadow-lg">
        🏆 React Advanced Patterns
      </div>

      {/* Sample course card */}
      <div className="mt-5 rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-4 shadow-xl">
        <div className="mb-3 h-2 w-16 rounded-full bg-(--theme-primary)" />
        <p className="text-sm font-semibold text-(--theme-foreground)">
          JavaScript: از صفر تا مسلط — دوره جامع ۲۰۲۴
        </p>
        <div className="mt-1 flex items-center gap-1">
          {"★★★★★".split("").map((s, i) => (
            <span key={i} className="text-(--theme-accent) text-xs">
              {s}
            </span>
          ))}
          <span className="ms-1 text-xs text-(--theme-foreground)/50">
            (۲٬۳۹۱)
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-(--theme-foreground)">
            ۱,۳۰۰,۰۰۰ تومان
          </span>
          <Button
            size="sm"
            asChild
            className="bg-(--theme-primary) text-(--theme-on-primary) rounded-full hover:opacity-90"
          >
            <Link
              href={buildAcademyPath(
                storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                "/courses",
              )}
            >
              ثبت‌نام
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Flow (منتوما) — course-progress hero card ──────────────────────────────

const FLOW_AVATAR_TONES = [
  "bg-(--theme-primary) text-(--theme-on-primary)",
  "bg-(--theme-secondary) text-(--theme-on-secondary)",
  "bg-(--theme-accent) text-(--theme-on-accent)",
  "bg-(--theme-primary) text-(--theme-on-primary)",
  "bg-(--theme-accent) text-(--theme-on-accent)",
];

function FlowHero({ id, config, storeContext }: HeroBlockProps) {
  const tag = config?.tag || "جدید — مسیرهای راهنمایی راه‌اندازی شد";
  const title = config?.title || "دانش را کشف کن.";
  const titleEm = config?.titleEm || "هر مهارتی";
  const titleEnd = config?.titleEnd || "را فتح کن.";
  const subtitle =
    config?.subtitle ||
    "با راهنمایی متخصصان و پروژه‌های عملی، در سرعت خودت یاد بگیر و حرفه‌ات را شتاب بده.";
  const ctaText = config?.ctaText || "شروع رایگان";
  const ctaSecondary = config?.ctaSecondary || "مرور دوره‌ها";
  const trustCount = config?.trustCount || "۱۲٬۴۰۰+";
  const avatars = ["آ", "س", "م", "ر", "ج"];

  const bannerImage = resolveAssetUrl(config?.backgroundImage);
  const card = config?.card ?? {};
  const cardTag = card.tag || "طراحی";
  const cardTitle = card.title || "فیگما پیشرفته: از وایرفریم تا پروتوتایپ";
  const cardInstructor = card.instructor || "توسط سارا چن · ۹ درس";
  const progress = typeof card.progress === "number" ? card.progress : 68;
  const progressText = card.progressText || "۶۸٪ تکمیل شده · ۴ درس مانده";
  const cardStats = card.stats ?? [
    { label: "رشته", value: "🔥 ۱۴" },
    { label: "XP امروز", value: "۳۲۰" },
    { label: "رتبه", value: "#۴۲" },
  ];

  return (
    <section id={id || "hero"} className="bg-(--theme-background)">
      <div className="mx-auto grid max-w-[1240px] items-center gap-[60px] px-[48px] pb-[48px] pt-[40px] lg:grid-cols-2">
        {/* Left — copy */}
        <div>
          <div className="mb-[24px] inline-flex items-center gap-2 rounded-full bg-(--theme-primary-subtle) px-[14px] py-[6px] text-[12px] font-bold text-(--theme-primary)">
            <span className="h-[6px] w-[6px] animate-pulse rounded-full bg-(--theme-primary)" />
            {tag}
          </div>
          <h1 className="mb-[20px] text-[clamp(40px,4.5vw,62px)] font-black leading-[1.25] text-(--theme-foreground)">
            {title}
            <br />
            <em className="not-italic text-(--theme-primary)">{titleEm}</em>
            <br />
            {titleEnd}
          </h1>
          <p className="mb-[36px] max-w-[440px] text-[16px] leading-[1.9] text-(--theme-muted)">
            {subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-[16px]">
            <Link
              href={buildAcademyPath(
                storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                "/courses",
              )}
              className="inline-flex items-center justify-center rounded-(--theme-border-radius) bg-(--theme-primary) px-[28px] py-[14px] text-[15px] font-bold text-(--theme-on-primary) transition-opacity hover:opacity-90"
            >
              {ctaText}
            </Link>
            <Link
              href={buildAcademyPath(
                storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                "/courses",
              )}
              className="flex items-center gap-[6px] text-[14px] font-semibold text-(--theme-foreground)"
            >
              <span aria-hidden>←</span>
              {ctaSecondary}
            </Link>
          </div>
          <div className="mt-[48px] flex items-center gap-[16px]">
            <div className="flex flex-row-reverse">
              {avatars.map((a, i) => (
                <span
                  key={i}
                  className={cn(
                    "-ms-2 flex h-[32px] w-[32px] items-center justify-center rounded-full border-2 border-(--theme-surface) text-[11px] font-bold first:ms-0",
                    FLOW_AVATAR_TONES[i % FLOW_AVATAR_TONES.length],
                  )}
                >
                  {a}
                </span>
              ))}
            </div>
            <div>
              <div className="mb-0.5 flex gap-0.5">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-[12px] text-(--theme-accent)">
                    {s}
                  </span>
                ))}
              </div>
              <div className="text-[13px] font-medium text-(--theme-muted)">
                مورد اعتماد{" "}
                <strong className="text-(--theme-foreground)">
                  {trustCount}
                </strong>{" "}
                یادگیرنده
              </div>
            </div>
          </div>
        </div>

        {/* Right — progress card */}
        <div className="relative h-[520px]">
          <div className="absolute left-[20px] right-[20px] top-[40px] rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.08)]">
            <div className="relative mb-[16px] flex h-[160px] items-center justify-center overflow-hidden rounded-[10px] bg-[linear-gradient(135deg,var(--theme-primary),color-mix(in_srgb,var(--theme-primary)_35%,var(--theme-secondary)))]">
              {bannerImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bannerImage}
                  alt={cardTitle}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <span className="text-[12px] font-semibold text-white/85">
                  طراحی UX/UI
                </span>
              )}
            </div>
            <div className="mb-[8px] flex items-center gap-2">
              <span className="rounded-full bg-(--theme-primary-subtle) px-[10px] py-[3px] text-[11px] font-bold text-(--theme-primary)">
                {cardTag}
              </span>
            </div>
            <div className="mb-[6px] text-[15px] font-bold text-(--theme-foreground)">
              {cardTitle}
            </div>
            <div className="mb-[14px] text-[12px] text-(--theme-muted)">
              {cardInstructor}
            </div>
            <div className="mb-[6px] h-[4px] overflow-hidden rounded-full bg-(--theme-border-color)">
              <div
                className="h-full rounded-full bg-(--theme-primary)"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[11px] font-medium text-(--theme-muted)">
              {progressText}
            </div>
            <div className="mt-[12px] flex gap-[10px]">
              {cardStats.map((s, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-[10px] border border-(--theme-border-color) bg-(--theme-background) p-[12px]"
                >
                  <div className="mb-1 text-[10px] font-semibold text-(--theme-muted)">
                    {s.label}
                  </div>
                  <div className="text-[18px] font-extrabold text-(--theme-foreground)">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Floating badges */}
          <div className="absolute left-0 top-0 flex items-center gap-[10px] rounded-[12px] border border-(--theme-border-color) bg-(--theme-surface) px-[16px] py-[12px] shadow-[0_16px_40px_rgba(0,0,0,0.1)]">
            <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-[10px] bg-(--theme-primary-subtle) text-[18px]">
              🎓
            </div>
            <div>
              <div className="text-[10px] font-semibold text-(--theme-muted)">
                گواهینامه دریافت شد
              </div>
              <div className="text-[14px] font-extrabold text-(--theme-foreground)">
                مبانی UX
              </div>
            </div>
          </div>
          <div className="absolute bottom-[20px] right-0 flex items-center gap-[10px] rounded-[12px] border border-(--theme-border-color) bg-(--theme-surface) px-[16px] py-[12px] shadow-[0_16px_40px_rgba(0,0,0,0.1)]">
            <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-[10px] bg-(--theme-accent-subtle) text-[18px]">
              ⚡
            </div>
            <div>
              <div className="text-[10px] font-semibold text-(--theme-muted)">
                تازه پیوست
              </div>
              <div className="text-[14px] font-extrabold text-(--theme-foreground)">
                ۳ یادگیرنده امروز
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Code (کدیار) — programming academy hero with course card ─────────────────

function CodeHero({ id, config, storeContext }: HeroBlockProps) {
  const tag = config?.tag || "بیش از ۵۰۰ دوره تخصصی";
  const title = config?.title || "برنامه‌نویسی را از";
  const titleEm = config?.titleEm || "متخصص‌های واقعی";
  const titleEnd = config?.titleEnd || "یاد بگیر";
  const subtitle =
    config?.subtitle ||
    "دوره‌های جامع و پروژه‌محور برای توسعه‌دهندگان جدی. از مبتدی تا حرفه‌ای، مسیر یادگیری خود را انتخاب کن.";
  const ctaText = config?.ctaText || "شروع یادگیری ←";
  const ctaSecondary = config?.ctaSecondary || "مشاهده دوره‌ها";
  const trustCount = config?.trustCount || "+۱۲۰,۰۰۰ دانش‌آموز";
  const trustLabel = config?.trustLabel || "از سراسر ایران";
  const ratingText = config?.ratingText || "۴.۸ / ۵";
  const ratingLabel = config?.ratingLabel || "میانگین امتیاز دوره‌ها";
  const liveText = config?.liveText || "هم‌اکنون ۲۳۴ نفر در حال یادگیری";
  const featuredLabel = config?.featuredLabel || "دوره پرفروش";
  const featuredTitle = config?.featuredTitle || "الگوهای پیشرفته React";
  const avatars = ["آ", "س", "م", "ر"];

  const bannerImage = resolveAssetUrl(config?.backgroundImage);
  const card = config?.card ?? {};
  const cardTag = card.tag || "JavaScript";
  const cardDuration = card.duration || "⏱ ۴۸ ساعت آموزش";
  const cardTitle = card.title || "JavaScript: از صفر تا مسلط — دوره جامع ۲۰۲۴";
  const cardPrice = card.price || "۱,۲۰۰,۰۰۰ تومان";
  const cardRating = card.rating || "۴.۹";
  const cardRatingCount = card.ratingCount || "(۳,۲۴۱)";
  const cardEnroll = card.enroll || "ثبت‌نام";

  return (
    <section id={id || "hero"} className="bg-(--theme-background)">
      <div className="mx-auto grid max-w-[1240px] items-center gap-[60px] px-[48px] pb-[72px] pt-[80px] lg:grid-cols-[1fr_460px]">
        {/* Right (visual) renders second in DOM but RTL places copy first */}
        <div>
          <div className="mb-[22px] inline-flex items-center gap-[7px] rounded-full border border-(--theme-primary)/20 bg-(--theme-primary-subtle) px-[14px] py-[5px] text-[12px] font-bold tracking-[0.04em] text-(--theme-primary)">
            <span className="h-[6px] w-[6px] animate-pulse rounded-full bg-(--theme-primary)" />
            {tag}
          </div>
          <h1 className="mb-[18px] text-[clamp(36px,4vw,56px)] font-bold leading-[1.18] tracking-[-0.02em] text-(--theme-foreground)">
            {title}
            <br />
            <em className="not-italic text-(--theme-primary)">{titleEm}</em>
            <br />
            {titleEnd}
          </h1>
          <p className="mb-[34px] max-w-[450px] text-[16px] leading-[1.85] text-(--theme-muted)">
            {subtitle}
          </p>
          <div className="mb-[44px] flex flex-wrap items-center gap-[14px]">
            <Link
              href={buildAcademyPath(
                storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                "/courses",
              )}
              className="inline-flex items-center justify-center rounded-(--theme-border-radius) bg-(--theme-primary) px-[28px] py-[14px] text-[15px] font-bold text-(--theme-on-primary) transition-opacity hover:opacity-90"
            >
              {ctaText}
            </Link>
            <Link
              href={buildAcademyPath(
                storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                "/courses",
              )}
              className="inline-flex items-center justify-center rounded-(--theme-border-radius) border-[1.5px] border-(--theme-border-strong) bg-(--theme-surface-alt) px-[26px] py-[13px] text-[15px] font-semibold text-(--theme-foreground)"
            >
              {ctaSecondary}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-[18px]">
            <div className="flex flex-row-reverse">
              {avatars.map((a, i) => (
                <span
                  key={i}
                  className={cn(
                    "-ms-[9px] flex h-[34px] w-[34px] items-center justify-center rounded-full border-[2.5px] border-(--theme-background) text-[11px] font-bold first:ms-0",
                    FLOW_AVATAR_TONES[i % FLOW_AVATAR_TONES.length],
                  )}
                >
                  {a}
                </span>
              ))}
            </div>
            <div>
              <div className="mb-0.5 flex gap-0.5">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-[13px] text-(--theme-accent)">
                    {s}
                  </span>
                ))}
              </div>
              <div className="text-[13px] text-(--theme-muted)">
                <strong className="block font-bold text-(--theme-foreground)">
                  {trustCount}
                </strong>
                {trustLabel}
              </div>
            </div>
            <div className="h-[28px] w-px bg-(--theme-border-color)" />
            <div className="text-[13px] text-(--theme-muted)">
              <strong className="font-bold text-(--theme-foreground)">
                {ratingText}
              </strong>
              <br />
              {ratingLabel}
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="relative pb-[32px]">
          <div className="absolute -top-[20px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-[12px] bg-(--theme-accent) px-[16px] py-[10px] text-[13px] font-bold text-(--theme-on-accent) shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white/70" />
            {liveText}
          </div>

          <div className="overflow-hidden rounded-[16px] border border-(--theme-border-color) bg-(--theme-card-bg) shadow-[0_24px_72px_rgba(0,0,0,0.15)]">
            <div className="relative flex h-[200px] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,var(--theme-primary),color-mix(in_srgb,var(--theme-primary)_35%,var(--theme-secondary)))]">
              {bannerImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bannerImage}
                  alt={cardTitle}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <span className="text-[13px] font-semibold text-white/85">
                  {cardTag}
                </span>
              )}
            </div>
            <div className="px-[20px] pb-[20px] pt-[18px]">
              <div className="mb-[14px] flex items-center gap-[14px]">
                <span className="rounded-[6px] bg-(--theme-primary-subtle) px-[10px] py-[3px] text-[11px] font-bold text-(--theme-primary)">
                  {cardTag}
                </span>
                <span className="text-[12px] text-(--theme-muted)">
                  {cardDuration}
                </span>
              </div>
              <div className="mb-[8px] text-[16px] font-bold text-(--theme-foreground)">
                {cardTitle}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-[10px]">
                <div className="text-[18px] font-bold text-(--theme-foreground)">
                  {cardPrice}
                </div>
                <div className="flex items-center gap-[5px] text-[12px] text-(--theme-muted)">
                  <span className="text-(--theme-accent)">★★★★★</span>{" "}
                  {cardRating} {cardRatingCount}
                </div>
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain
                      ? null
                      : (storeContext?.slug ?? null),
                    "/courses",
                  )}
                  className="rounded-[8px] bg-(--theme-primary) px-[18px] py-[9px] text-[13px] font-bold text-(--theme-on-primary)"
                >
                  {cardEnroll}
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-[10px] left-[-20px] flex items-center gap-[12px] whitespace-nowrap rounded-[12px] border border-(--theme-border-color) bg-(--theme-surface) px-[16px] py-[12px] shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
            <span className="text-[22px]">🏆</span>
            <div>
              <div className="text-[11px] text-(--theme-muted)">
                {featuredLabel}
              </div>
              <div className="text-[14px] font-bold text-(--theme-foreground)">
                {featuredTitle}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Creative (استودیوی خلاق) — navy hero with 2×2 class cards + stats ─────────

const CREATIVE_THUMB_GRADIENTS = [
  "bg-[linear-gradient(135deg,var(--theme-primary),color-mix(in_srgb,var(--theme-primary)_40%,var(--theme-secondary)))]",
  "bg-[linear-gradient(135deg,var(--theme-accent),color-mix(in_srgb,var(--theme-accent)_55%,var(--theme-primary)))]",
  "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--theme-primary)_70%,var(--theme-accent)),var(--theme-secondary))]",
  "bg-[linear-gradient(135deg,var(--theme-accent),color-mix(in_srgb,var(--theme-primary)_60%,var(--theme-secondary)))]",
];

const CREATIVE_STATS = [
  { value: "۴۲۵هزار+", label: "عضو" },
  { value: "۳۰هزار+", label: "کلاس" },
  { value: "۹هزار+", label: "مدرس" },
  { value: "۴.۸★", label: "امتیاز اپ" },
];

function CreativeHero({ id, config, storeContext }: HeroBlockProps) {
  const tag = config?.tag || "🎨 جامعه یادگیری خلاق";
  const title = config?.title || "کلاس‌های خلاقانه از بهترین";
  const titleEm = config?.titleEm || "متخصصان";
  const titleEnd = config?.titleEnd || "صنعت";
  const subtitle =
    config?.subtitle ||
    "هزاران کلاس در تصویرسازی، طراحی، عکاسی، فیلم، فریلنسری و بیشتر. به جامعه خلاقان بپیوند.";
  const ctaText = config?.ctaText || "آزمایش رایگان شروع کن";
  const ctaSecondary = config?.ctaSecondary || "کشف کلاس‌ها";
  const stats = config?.stats?.length
    ? config.stats
    : storeContext?.stats
      ? [
          storeContext.stats.studentCount > 0
            ? {
                value: `${storeContext.stats.studentCount.toLocaleString("fa-IR")}+`,
                label: "دانشجو",
              }
            : null,
          storeContext.stats.courseCount > 0
            ? {
                value: `${storeContext.stats.courseCount.toLocaleString("fa-IR")}+`,
                label: "دوره",
              }
            : null,
        ].filter((s): s is { value: string; label: string } => s !== null)
      : CREATIVE_STATS;
  // Mini-cards only from config — do not show fake placeholder courses
  const miniCards = config?.miniCards?.length ? config.miniCards : [];

  return (
    <section
      id={id || "hero"}
      className="relative overflow-hidden bg-(--theme-secondary) text-(--theme-on-secondary)"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[20px] right-[55%] h-[120px] w-[120px] rounded-full bg-(--theme-primary) opacity-[0.18]" />
        <div className="absolute left-[5%] top-[30%] h-[80px] w-[80px] rounded-full bg-(--theme-accent) opacity-[0.18]" />
        <div className="absolute -bottom-[60px] left-[15%] h-[200px] w-[200px] rounded-full bg-(--theme-primary) opacity-[0.12]" />
      </div>

      <div className="relative z-[2] mx-auto grid max-w-[1200px] items-center gap-[60px] px-[40px] py-[80px] lg:grid-cols-2">
        {/* Copy */}
        <div>
          <div className="mb-[24px] inline-flex items-center gap-2 rounded-full border-[1.5px] border-(--theme-primary)/40 bg-(--theme-primary)/20 px-[14px] py-[6px] text-[12px] font-extrabold text-(--theme-primary)">
            {tag}
          </div>
          <h1 className="mb-[20px] text-[clamp(32px,4.5vw,56px)] font-black leading-[1.2] text-(--theme-on-secondary)">
            {title}{" "}
            <em className="not-italic text-(--theme-primary)">{titleEm}</em>{" "}
            {titleEnd}
          </h1>
          <p className="mb-[36px] max-w-[440px] text-[16px] leading-[1.85] text-(--theme-on-secondary)/75">
            {subtitle}
          </p>
          <div className="mb-[40px] flex flex-wrap gap-[12px]">
            <Link
              href={buildAcademyPath(
                storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                "/courses",
              )}
              className="inline-flex items-center justify-center rounded-(--theme-border-radius) bg-(--theme-primary) px-[32px] py-[14px] text-[15px] font-extrabold text-(--theme-secondary) transition-opacity hover:opacity-90"
            >
              {ctaText}
            </Link>
            <Link
              href={buildAcademyPath(
                storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                "/courses",
              )}
              className="inline-flex items-center justify-center rounded-(--theme-border-radius) border-2 border-(--theme-on-secondary)/30 px-[32px] py-[12px] text-[15px] font-extrabold text-(--theme-on-secondary) transition-colors hover:border-(--theme-on-secondary)/70"
            >
              {ctaSecondary}
            </Link>
          </div>
          <div className="flex flex-wrap gap-[32px]">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-[26px] font-black text-(--theme-on-secondary)">
                  {s.value}
                </div>
                <div className="text-[12px] font-semibold text-(--theme-on-secondary)/65">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2×2 mini class cards */}
        <div className="grid grid-cols-2 gap-[16px]">
          {miniCards.map((c, i) => (
            <div
              key={i}
              className={cn(
                "rounded-[16px] border-[1.5px] border-(--theme-on-secondary)/15 bg-(--theme-on-secondary)/[0.06] p-[20px]",
                i % 2 === 1 && "mt-[24px]",
              )}
            >
              <div
                className={cn(
                  "mb-[14px] h-[88px] rounded-[10px]",
                  CREATIVE_THUMB_GRADIENTS[i % CREATIVE_THUMB_GRADIENTS.length],
                )}
              />
              <div className="mb-[4px] text-[13px] font-extrabold text-(--theme-on-secondary)">
                {c.title}
              </div>
              <div className="text-[11px] font-bold text-(--theme-primary)">
                {c.instructor}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
