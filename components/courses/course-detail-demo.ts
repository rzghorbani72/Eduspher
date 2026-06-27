/**
 * Authored demo content for the course detail tabs (overview / curriculum /
 * instructor). UI labels live in the i18n bundles; localized "content" lives
 * here so the layout can be previewed before real records exist.
 */

export type LessonKind = "video" | "quiz" | "text" | "live";
export type LessonBadge = "preview" | "locked" | "live_now" | "free" | "recorded";
export type LessonAction = "play" | "lock" | "join" | "remind" | "record";

export interface CurriculumLesson {
  id: number;
  title: string;
  kind: LessonKind;
  badge?: LessonBadge;
  action: LessonAction;
  meta?: string;
  duration: string;
}

export interface CurriculumSeason {
  id: number;
  title: string;
  summary: string;
  lessons: CurriculumLesson[];
}

const CURRICULUM_FA: CurriculumSeason[] = [
  {
    id: 1,
    title: "شروع و تعیین سطح",
    summary: "۴ درس · ۳۲۰ دقیقه",
    lessons: [
      { id: 11, title: "خوش‌آمدگویی و نقشهٔ راه دوره", kind: "video", badge: "preview", action: "play", duration: "۵:۲۰" },
      { id: 12, title: "آزمون تعیین سطح", kind: "quiz", action: "play", duration: "۱۰ دقیقه" },
      { id: 13, title: "چطور بیشترین بهره را ببری", kind: "text", badge: "locked", action: "lock", duration: "۶ دقیقه" },
      { id: 14, title: "واژگان پایه برای شروع", kind: "video", badge: "locked", action: "lock", duration: "۱۱:۰۰" },
    ],
  },
  {
    id: 2,
    title: "کلاس‌های زندهٔ هفتگی",
    summary: "جلسات تعاملی",
    lessons: [
      { id: 21, title: "Free Talk: معرفی خودت", kind: "live", badge: "live_now", action: "join", meta: "لینک ورود فعال است — همین حالا بپیوند", duration: "۴۵ دقیقه" },
      { id: 22, title: "Small Talk روزمره", kind: "live", badge: "free", action: "remind", meta: "شروع تا ۰۰:۳۸:۱۷", duration: "۶۰ دقیقه" },
      { id: 23, title: "گرامر کاربردی در مکالمه", kind: "live", badge: "locked", action: "lock", meta: "باز می‌شود تا ۱ روز و ۰ ساعت", duration: "۶۰ دقیقه" },
      { id: 24, title: "نقش‌بازی: رستوران و سفر", kind: "live", badge: "locked", action: "lock", meta: "باز می‌شود تا ۳ روز و ۲۲ ساعت", duration: "۶۰ دقیقه" },
      { id: 25, title: "تمرین تلفظ و لهجه", kind: "live", badge: "recorded", action: "record", meta: "ویدیوی ضبط‌شده در دسترس است", duration: "۴۵ دقیقه" },
    ],
  },
  {
    id: 3,
    title: "تمرین و مرور",
    summary: "۶ درس · ۲ ساعت",
    lessons: [
      { id: 31, title: "تمرین شنیداری شمارهٔ ۱", kind: "video", badge: "locked", action: "lock", duration: "۱۴:۰۰" },
      { id: 32, title: "کارت‌های واژگان تعاملی", kind: "quiz", badge: "locked", action: "lock", duration: "۱۵ دقیقه" },
      { id: 33, title: "جمع‌بندی و گام بعدی", kind: "video", badge: "locked", action: "lock", duration: "۸:۳۰" },
    ],
  },
];

const CURRICULUM_EN: CurriculumSeason[] = [
  {
    id: 1,
    title: "Getting started & placement",
    summary: "4 lessons · 320 min",
    lessons: [
      { id: 11, title: "Welcome & course roadmap", kind: "video", badge: "preview", action: "play", duration: "5:20" },
      { id: 12, title: "Placement test", kind: "quiz", action: "play", duration: "10 min" },
      { id: 13, title: "How to get the most out of it", kind: "text", badge: "locked", action: "lock", duration: "6 min" },
      { id: 14, title: "Core vocabulary to start", kind: "video", badge: "locked", action: "lock", duration: "11:00" },
    ],
  },
  {
    id: 2,
    title: "Weekly live classes",
    summary: "Interactive sessions",
    lessons: [
      { id: 21, title: "Free Talk: introduce yourself", kind: "live", badge: "live_now", action: "join", meta: "Join link is active — jump in now", duration: "45 min" },
      { id: 22, title: "Everyday Small Talk", kind: "live", badge: "free", action: "remind", meta: "Starts in 00:38:17", duration: "60 min" },
      { id: 23, title: "Practical grammar in conversation", kind: "live", badge: "locked", action: "lock", meta: "Opens in 1 day 0 hours", duration: "60 min" },
      { id: 24, title: "Role-play: restaurant & travel", kind: "live", badge: "locked", action: "lock", meta: "Opens in 3 days 22 hours", duration: "60 min" },
      { id: 25, title: "Pronunciation & accent practice", kind: "live", badge: "recorded", action: "record", meta: "Recorded video available", duration: "45 min" },
    ],
  },
  {
    id: 3,
    title: "Practice & review",
    summary: "6 lessons · 2 hours",
    lessons: [
      { id: 31, title: "Listening practice #1", kind: "video", badge: "locked", action: "lock", duration: "14:00" },
      { id: 32, title: "Interactive vocab cards", kind: "quiz", badge: "locked", action: "lock", duration: "15 min" },
      { id: 33, title: "Wrap-up & next steps", kind: "video", badge: "locked", action: "lock", duration: "8:30" },
    ],
  },
];

export const getDemoCurriculum = (language: string): CurriculumSeason[] =>
  language === "fa" ? CURRICULUM_FA : CURRICULUM_EN;

export const getAboutDemo = (language: string): string =>
  language === "fa"
    ? "این دوره ترکیبی از کلاس‌های زندهٔ هفتگی و محتوای ضبط‌شده است. در هر جلسهٔ زنده روی یک موقعیت واقعی مکالمه تمرکز می‌کنیم، نقش‌بازی می‌کنیم و بازخورد زندهٔ تلفظ می‌گیریم. بین جلسات هم با درس‌های ویدیویی و تمرین‌های تعاملی پیش می‌روی."
    : "This course blends weekly live classes with recorded content. Each live session focuses on a real conversation scenario, with role-play and live pronunciation feedback. Between sessions you progress through video lessons and interactive exercises.";

export const getLearnPoints = (language: string): string[] =>
  language === "fa"
    ? [
        "روان صحبت‌کردن در موقعیت‌های روزمره",
        "بهبود تلفظ با بازخورد زنده",
        "گرامر کاربردی به‌جای حفظ قواعد",
        "واژگان پرکاربرد مکالمه",
        "مدیریت گفتگو و رفع لکنت",
        "آمادگی برای موقعیت‌های سفر و کار",
      ]
    : [
        "Speak fluently in everyday situations",
        "Improve pronunciation with live feedback",
        "Practical grammar instead of memorising rules",
        "High-frequency conversational vocabulary",
        "Manage conversations and reduce hesitation",
        "Readiness for travel and work situations",
      ];

export interface InstructorDemo {
  name: string;
  role: string;
  bio: string;
  rating: string;
  students: string;
  courses: string;
}

export const getInstructorDemo = (language: string): InstructorDemo =>
  language === "fa"
    ? {
        name: "آرش معتمدی",
        role: "مدرس زبان انگلیسی · مدرک TESOL",
        bio: "بیش از ۱۲ سال سابقهٔ تدریس مکالمه و آمادگی آیلتس. آرش رویکرد «یادگیری از طریق گفتگو» را دنبال می‌کند و تمرکزش روی روان‌شدن واقعی هنرجوها در موقعیت‌های روزمره است.",
        rating: "۴.۹",
        students: "+۸,۴۰۰",
        courses: "۶",
      }
    : {
        name: "Arash Moetamedi",
        role: "English teacher · TESOL certified",
        bio: "Over 12 years teaching conversation and IELTS prep. Arash follows a 'learning through conversation' approach, focused on real fluency in everyday situations.",
        rating: "4.9",
        students: "+8,400",
        courses: "6",
      };
