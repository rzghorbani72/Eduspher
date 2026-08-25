/**
 * Official Mentoma profiles for Organization `sameAs` and the landing footer.
 * Empty slots stay off the schema — Google prefers fewer true profiles over
 * dead URLs.
 */
export const PLATFORM_SOCIAL_PROFILES = [
  "https://www.instagram.com/mentoma_ir/",
] as const;

export const PLATFORM_FOOTER_SOCIALS = [
  {
    id: "instagram",
    label: "اینستاگرام",
    href: "https://www.instagram.com/mentoma_ir/",
  },
  { id: "telegram", label: "تلگرام", href: "" },
  { id: "linkedin", label: "لینکدین", href: "" },
] as const;
