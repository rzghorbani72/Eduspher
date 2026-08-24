import Image from "next/image";

import { cn } from "@/lib/utils";

const TYPE_WIDTH = 69;
const TYPE_HEIGHT = 28;

type Props = {
  className?: string;
  markSize?: number;
  typeClassName?: string;
  priority?: boolean;
};

export function BrandLockup({
  className,
  markSize = 38,
  typeClassName,
  priority = false,
}: Props) {
  return (
    <span className={cn("inline-flex items-center gap-4", className)}>
      <Image
        src="/logo-mark.svg"
        alt=""
        width={markSize}
        height={markSize}
        priority={priority}
        className="shrink-0"
        style={{ width: markSize, height: markSize }}
      />
      <span
        aria-hidden
        className={cn("brand-wordmark inline-block shrink-0", typeClassName)}
        style={{
          width: TYPE_WIDTH,
          height: TYPE_HEIGHT,
          WebkitMask: "url(/logo-type.png) center / contain no-repeat",
          mask: "url(/logo-type.png) center / contain no-repeat",
        }}
      />
    </span>
  );
}
