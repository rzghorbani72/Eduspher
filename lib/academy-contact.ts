import type { AcademyContactChannel, AcademyContactLink } from "@/lib/api/server";

/** Channels a visitor reads rather than clicks through to a profile. */
const DIRECT_CHANNELS: ReadonlySet<AcademyContactChannel> = new Set([
  "phone",
  "email",
  "address",
]);

/** Profile URL built from a bare handle, per channel. */
const HANDLE_BASE_URL: Readonly<
  Partial<Record<AcademyContactChannel, string>>
> = {
  instagram: "https://instagram.com/",
  telegram: "https://t.me/",
  linkedin: "https://linkedin.com/in/",
  youtube: "https://youtube.com/@",
  twitter: "https://x.com/",
  aparat: "https://aparat.com/",
  eitaa: "https://eitaa.com/",
};

export const isSocialChannel = (type: AcademyContactChannel): boolean =>
  !DIRECT_CHANNELS.has(type);

const digitsOnly = (value: string): string => value.replace(/[^\d+]/g, "");

/**
 * The href a channel opens. Managers paste whatever they have — a full URL, an
 * `@handle`, or a bare number — so each form is normalised here instead of
 * being validated away in the panel, where a rejected paste just loses the
 * contact detail.
 *
 * Returns `null` for values that are text, not destinations (a postal address),
 * so the caller renders them unlinked.
 */
export const buildContactHref = (link: AcademyContactLink): string | null => {
  const value = link.value.trim();
  if (!value) return null;

  switch (link.type) {
    case "phone":
      return `tel:${digitsOnly(value)}`;
    case "email":
      return `mailto:${value}`;
    case "address":
      return null;
    case "whatsapp":
      return value.startsWith("http")
        ? value
        : `https://wa.me/${digitsOnly(value).replace(/^\+/, "")}`;
    case "website":
      return value.startsWith("http") ? value : `https://${value}`;
    default: {
      if (value.startsWith("http")) return value;
      const base = HANDLE_BASE_URL[link.type];
      return base ? `${base}${value.replace(/^@/, "")}` : null;
    }
  }
};

/** What the visitor sees: the handle, never the machine-readable URL. */
export const formatContactValue = (link: AcademyContactLink): string => {
  const value = link.value.trim();
  if (!value.startsWith("http")) return value;
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/\/$/, "");
    return path && path !== "/" ? `${url.hostname}${path}` : url.hostname;
  } catch {
    return value;
  }
};
