import backendImageLoader from "./image-loader";

/**
 * The escape hatch for images that cannot be a next/image: CSS
 * `background-image`, and the few `<img>` tags whose layout depends on the
 * browser measuring the file itself (`h-auto w-full`, a logo of unknown
 * aspect ratio). They still get the right download size — they just don't get
 * a srcset, so pass the largest width the element is ever rendered at.
 *
 * Same rules as the <Image> loader, so a URL never gets sized twice or sized
 * when it is a local/vector asset.
 */
export const sizedImageUrl = (
  src: string | null | undefined,
  width: number,
  quality = 75,
): string | null => (src ? backendImageLoader({ src, width, quality }) : null);
