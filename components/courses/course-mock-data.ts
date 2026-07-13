/**
 * Enrollment-method presets for the course detail sidebar. These are pricing
 * presentation options (one-time / subscription / live / package) derived from
 * the course base price, not backend records. UI labels live in the i18n bundles.
 */

export type MethodIcon = "box" | "card" | "video" | "bundle";
export type BadgeTone = "save" | "popular";

export interface EnrollmentMethod {
  key: string;
  icon: MethodIcon;
  titleKey: string;
  descKey: string;
  badgeKey?: string;
  badgeTone?: BadgeTone;
  /** multiplier applied to the course base price */
  priceFactor: number;
  /** multiplier for the struck-through "before" price */
  originalFactor?: number;
  interval: "once" | "month";
  featureKeys: string[];
  ctaKey: string;
  recommended?: boolean;
}

export const ENROLLMENT_METHODS: readonly EnrollmentMethod[] = [
  {
    key: "one_time",
    icon: "box",
    titleKey: "courses.methodOneTime",
    descKey: "courses.methodOneTimeDesc",
    priceFactor: 1,
    interval: "once",
    featureKeys: ["courses.featLifetime", "courses.featAllLessons", "courses.featCertificate"],
    ctaKey: "courses.ctaBuy",
  },
  {
    key: "live",
    icon: "video",
    titleKey: "courses.methodLive",
    descKey: "courses.methodLiveDesc",
    badgeKey: "courses.badgeSpecialOffer",
    badgeTone: "popular",
    priceFactor: 0.18,
    interval: "month",
    featureKeys: ["courses.featLiveWeekly", "courses.featDirectFeedback", "courses.featAllLessons"],
    ctaKey: "courses.ctaSubscribe",
  },
  {
    key: "package",
    icon: "bundle",
    titleKey: "courses.methodPackage",
    descKey: "courses.methodPackageDesc",
    badgeKey: "courses.badgeSave",
    badgeTone: "save",
    priceFactor: 1,
    originalFactor: 1.41,
    interval: "once",
    featureKeys: ["courses.featPackageCourses", "courses.featLifetimePackage", "courses.featCertEach"],
    ctaKey: "courses.ctaBuyPackage",
    recommended: true,
  },
] as const;
