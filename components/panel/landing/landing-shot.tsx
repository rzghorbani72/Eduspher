import Image, { type ImageProps } from "next/image";

/**
 * Product screenshots under /public/landing. Static files we ship ourselves, so
 * they are already sized correctly and there is no backend endpoint that could
 * resize them — `unoptimized` skips the pointless srcset the loader would build.
 */
export function LandingShot({ alt, ...props }: ImageProps) {
  return <Image alt={alt} unoptimized {...props} />;
}
