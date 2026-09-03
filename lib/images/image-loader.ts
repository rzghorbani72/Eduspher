import type { ImageLoaderProps } from "next/image";

/**
 * Next's built-in optimizer resizes images inside this pod and writes every
 * variant to `.next/cache/images` on the pod's own disk. That cache has no size
 * limit, so on a long-lived pod it grows until the node evicts us for exceeding
 * ephemeral storage — the exact failure this loader exists to prevent.
 *
 * With a custom loader Next never runs `/_next/image` at all: it only rewrites
 * the `src`. Resizing happens once in the backend, which stores the derivative
 * in the shared object bucket. This pod therefore keeps ZERO image bytes on
 * disk, and the cache is shared by every replica instead of being re-built per
 * pod.
 *
 * Kept dependency-free on purpose: `images.loaderFile` is bundled into the
 * client for every <Image>, so it must stay tiny and pure.
 */

/** Backend routes that understand the `w`/`q` derivative parameters. */
const RESIZABLE_PATHS = ["/images/fetch-image-by-id/", "/images/get-image"];

/** Vectors have no pixel size to shrink; asking for one just wastes a round trip. */
const isVector = (path: string) => /\.svg(\?|$)/i.test(path);

export default function backendImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  // Local /public assets and third-party URLs are served untouched — only our
  // own image API can produce a derivative.
  if (isVector(src) || !RESIZABLE_PATHS.some((path) => src.includes(path))) {
    return src;
  }

  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}w=${width}&q=${quality ?? 75}`;
}
