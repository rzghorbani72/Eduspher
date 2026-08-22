import Image, { type ImageProps } from "next/image";

/**
 * Product screenshots under /public/landing. Served without the Next optimizer
 * so a missing/broken `sharp` install cannot blank the landing carousel.
 */
export function LandingShot({ alt, ...props }: ImageProps) {
  return <Image alt={alt} unoptimized {...props} />;
}
