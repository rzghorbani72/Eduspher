import { cn } from "@/lib/utils";
import { sizedImageUrl } from "@/lib/images/sized-image-url";

export type MediaSize = "sm" | "md" | "lg" | "full";
export type MediaAspect = "16:9" | "4:3" | "1:1" | "auto";

// Owner-uploaded section image. Size/aspect come from the bounded design-system
// enums (never freeform px) and resolve against the theme size tokens.
const SIZE_MAX_WIDTH: Record<MediaSize, string> = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-2xl",
  full: "max-w-none w-full",
};

const ASPECT_CLASS: Record<MediaAspect, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  auto: "",
};

interface SectionMediaProps {
  src?: string | null;
  alt?: string;
  size?: MediaSize;
  aspect?: MediaAspect;
  className?: string;
  rounded?: boolean;
}

export function SectionMedia({
  src,
  alt = "",
  size = "md",
  aspect = "16:9",
  className,
  rounded = true,
}: SectionMediaProps) {
  const wrapper = cn(
    "relative mx-auto w-full overflow-hidden",
    SIZE_MAX_WIDTH[size] ?? SIZE_MAX_WIDTH.md,
    ASPECT_CLASS[aspect] ?? ASPECT_CLASS["16:9"],
    className,
  );
  const radiusStyle = rounded
    ? { borderRadius: "var(--theme-border-radius)" }
    : undefined;

  if (!src) {
    return (
      <div
        className={cn(wrapper, "border border-(--theme-border-color)")}
        style={{
          ...radiusStyle,
          background:
            "linear-gradient(135deg, var(--theme-primary-subtle), var(--theme-surface-alt))",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={wrapper} style={radiusStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sizedImageUrl(src, 1080) ?? src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          "h-full w-full",
          aspect === "auto" ? "object-contain" : "object-cover",
        )}
      />
    </div>
  );
}
