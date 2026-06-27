/**
 * Demo data for the course detail page so managers can preview the full layout
 * (enrollment methods + student reviews) even before real records exist.
 * UI labels live in the i18n bundles; only authored "content" lives here.
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
    key: "subscription",
    icon: "card",
    titleKey: "courses.methodSubscription",
    descKey: "courses.methodSubscriptionDesc",
    badgeKey: "courses.badgeAnnualDiscount",
    badgeTone: "save",
    priceFactor: 0.12,
    interval: "month",
    featureKeys: ["courses.featAllLessons", "courses.featNewContent", "courses.featCancelAnytime"],
    ctaKey: "courses.ctaSubscribe",
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

export interface CourseReview {
  id: number;
  name: string;
  initial: string;
  timeAgo: string;
  rating: number;
  text: string;
}

const REVIEWS_FA: CourseReview[] = [
  {
    id: 1,
    name: "سارا احمدی",
    initial: "س",
    timeAgo: "۲ هفته پیش",
    rating: 5,
    text: "کلاس‌های زنده واقعاً فوق‌العاده‌اند. بعد از دو ماه واقعاً راحت‌تر صحبت می‌کنم و استرسم کمتر شده.",
  },
  {
    id: 2,
    name: "پویا رضایی",
    initial: "پ",
    timeAgo: "۱ ماه پیش",
    rating: 5,
    text: "بهترین بخش ماجرا بازخورد زندهٔ آرش روی تلفظه. درس‌های ضبط‌شده هم برای مرور عالی‌اند.",
  },
  {
    id: 3,
    name: "مینا کریمی",
    initial: "م",
    timeAgo: "۱ ماه پیش",
    rating: 4,
    text: "محتوا خیلی منظمه. کاش جلسات زندهٔ بیشتری در هفته بود، ولی در کل ارزشش را داشت.",
  },
  {
    id: 4,
    name: "حسام نوری",
    initial: "ح",
    timeAgo: "۲ ماه پیش",
    rating: 5,
    text: "تمرین نقش‌بازی‌ها واقعاً کاربردی‌اند. حس می‌کنم برای سفر و موقعیت‌های واقعی آماده شدم.",
  },
];

const REVIEWS_EN: CourseReview[] = [
  {
    id: 1,
    name: "Sara Ahmadi",
    initial: "S",
    timeAgo: "2 weeks ago",
    rating: 5,
    text: "The live classes are genuinely outstanding. After two months I speak far more comfortably and feel much less anxious.",
  },
  {
    id: 2,
    name: "Pouya Rezaei",
    initial: "P",
    timeAgo: "1 month ago",
    rating: 5,
    text: "The best part is Arash's live feedback on pronunciation. The recorded lessons are great for review too.",
  },
  {
    id: 3,
    name: "Mina Karimi",
    initial: "M",
    timeAgo: "1 month ago",
    rating: 4,
    text: "The content is very well organised. I wish there were more live sessions per week, but it was worth it overall.",
  },
  {
    id: 4,
    name: "Hesam Nouri",
    initial: "H",
    timeAgo: "2 months ago",
    rating: 5,
    text: "The role-play drills are really practical. I feel ready for travel and real-world situations.",
  },
];

export const getDemoReviews = (language: string): CourseReview[] =>
  language === "fa" ? REVIEWS_FA : REVIEWS_EN;

export const DEMO_RATING = 4.9;
export const DEMO_REVIEW_COUNT = 312;
