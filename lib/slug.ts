/**
 * Academy address rules, mirrored from the backend's `isWellFormedSubdomain`
 * so the dialog can reject a bad address before spending a request on it.
 * The backend stays the authority — this is only a fast first answer.
 */
const MAX_SLUG_LENGTH = 40;

export type SlugStatus =
  "idle" | "checking" | "available" | "taken" | "invalid";

export const ACADEMY_DOMAIN =
  process.env.NEXT_PUBLIC_ACADEMY_DOMAIN ?? "mentoma.ir";

/**
 * Latin-only, so a Persian academy name yields "" and the manager types their
 * own address. Guessing a transliteration would put a name they never chose in
 * their permanent URL.
 */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .slice(0, MAX_SLUG_LENGTH);
}

export function isValidSlug(slug: string): boolean {
  return new RegExp(
    `^[a-z0-9](?:[a-z0-9-]{0,${MAX_SLUG_LENGTH - 2}}[a-z0-9])?$`,
  ).test(slug);
}
