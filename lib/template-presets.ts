import { UIBlockConfig } from "./theme-config";

export type TemplatePreset = string;

export interface TemplatePresetInfo {
  id: string;
  name: string;
  description: string;
  preview?: string;
  blocks: UIBlockConfig[];
}

export const TEMPLATE_PRESETS: Record<string, TemplatePresetInfo> = {
  flow: {
    id: "flow",
    name: "منتوما فلو",
    description: "قالب یادگیری مسیرمحور با طراحی مینیمال و کارت پیشرفت دوره",
    blocks: [
      {
        id: "header",
        type: "header",
        order: 0,
        isVisible: true,
        config: { sticky: true, showNavigation: true },
      },
      {
        id: "hero",
        type: "hero",
        order: 1,
        isVisible: true,
        config: { style: "flow" },
      },
      { id: "marquee", type: "marquee", order: 2, isVisible: true, config: {} },
      {
        id: "features-why",
        type: "features",
        order: 3,
        isVisible: true,
        config: { style: "flow-cards" },
      },
      {
        id: "courses",
        type: "course-grid",
        order: 4,
        isVisible: true,
        config: {},
      },
      {
        id: "features-stats",
        type: "features",
        order: 5,
        isVisible: true,
        config: { style: "flow-stats" },
      },
      {
        id: "testimonials",
        type: "testimonials",
        order: 6,
        isVisible: true,
        config: { style: "flow" },
      },
      { id: "pricing", type: "pricing", order: 7, isVisible: true, config: {} },
      { id: "cta", type: "cta", order: 8, isVisible: true, config: {} },
      {
        id: "footer",
        type: "footer",
        order: 9,
        isVisible: true,
        config: { showSocialLinks: true, showNewsletter: false, columns: 4 },
      },
    ],
  },
  code: {
    id: "code",
    name: "کدیار",
    description: "قالب آموزش برنامه‌نویسی حرفه‌ای با طراحی آبی و حالت تاریک",
    blocks: [
      {
        id: "header",
        type: "header",
        order: 0,
        isVisible: true,
        config: { sticky: true, showNavigation: true, style: "code" },
      },
      {
        id: "hero",
        type: "hero",
        order: 1,
        isVisible: true,
        config: { style: "code" },
      },
      {
        id: "courses",
        type: "course-grid",
        order: 2,
        isVisible: true,
        config: { style: "code" },
      },
      {
        id: "features-stats",
        type: "features",
        order: 3,
        isVisible: true,
        config: {
          style: "stats",
          stats: [
            { value: "۵۰۰+", label: "دوره تخصصی" },
            { value: "۱۲۰K", label: "دانش‌آموز فعال" },
            { value: "۸۵", label: "مدرس حرفه‌ای" },
            { value: "۴.۸★", label: "میانگین امتیاز" },
          ],
        },
      },
      {
        id: "features-instructors",
        type: "features",
        order: 4,
        isVisible: true,
        config: {
          style: "instructors",
          title: "از متخصصان واقعی صنعت یاد بگیر",
          subtitle:
            "مدرسان ما حرفه‌ای‌های فعال در شرکت‌های بزرگ هستند که تجربه عملی را با آموزش ساده ترکیب کرده‌اند.",
          gridColumns: 3,
        },
      },
      {
        id: "membership",
        type: "membership",
        order: 5,
        isVisible: true,
        config: {},
      },
      {
        id: "testimonials",
        type: "testimonials",
        order: 6,
        isVisible: true,
        config: {
          style: "code",
          label: "نظرات دانش‌آموزان",
          title: "آنچه هم‌دوره‌ای‌ها می‌گویند",
          items: [
            {
              quote:
                "«دوره JavaScript کدیار کامل‌ترین چیزی بود که دیدم. پس از اتمام دوره توانستم اولین کارم را پیدا کنم. روش تدریس عالی و مثال‌ها کاملاً کاربردی بود.»",
              name: "امیرحسین رضایی",
              role: "Front-end Developer",
              initials: "ام",
            },
            {
              quote:
                "«پس از سال‌ها جستجو برای یک منبع آموزشی فارسی با کیفیت، بالاخره کدیار را پیدا کردم. دوره Docker را که تمام کردم، کاملاً اعتماد به نفس داشتم.»",
              name: "زهرا موسوی",
              role: "DevOps Engineer",
              initials: "ز",
            },
            {
              quote:
                "«اشتراک ماهانه کدیار بهترین سرمایه‌گذاری شغلی‌ام بود. توی یک سال سه دوره کامل کردم و حقوقم دو برابر شد.»",
              name: "محمد طاهری",
              role: "Full-stack Developer",
              initials: "م",
            },
          ],
        },
      },
      {
        id: "footer",
        type: "footer",
        order: 7,
        isVisible: true,
        config: {
          showSocialLinks: true,
          showNewsletter: false,
          columns: 4,
        },
      },
    ],
  },
  creative: {
    id: "creative",
    name: "استودیوی خلاق",
    description:
      "قالب استودیوی خلاق با طراحی سبز و حالت تاریک برای جامعه‌های هنری",
    blocks: [
      {
        id: "header",
        type: "header",
        order: 0,
        isVisible: true,
        config: { sticky: true, showNavigation: true, style: "creative" },
      },
      {
        id: "hero",
        type: "hero",
        order: 1,
        isVisible: true,
        config: { style: "creative" },
      },
      {
        id: "categories",
        type: "categories",
        order: 2,
        isVisible: true,
        config: {},
      },
      {
        id: "courses",
        type: "course-grid",
        order: 3,
        isVisible: true,
        config: { style: "creative" },
      },
      {
        id: "projects",
        type: "projects",
        order: 4,
        isVisible: true,
        config: {},
      },
      {
        id: "pillars",
        type: "features",
        order: 5,
        isVisible: true,
        config: { style: "creative-pillars" },
      },
      {
        id: "teachers",
        type: "features",
        order: 6,
        isVisible: true,
        config: { style: "creative-teachers" },
      },
      {
        id: "testimonials",
        type: "testimonials",
        order: 7,
        isVisible: true,
        config: { style: "creative" },
      },
      {
        id: "cta",
        type: "cta",
        order: 8,
        isVisible: true,
        config: { style: "creative" },
      },
      {
        id: "footer",
        type: "footer",
        order: 9,
        isVisible: true,
        config: { style: "creative" },
      },
    ],
  },
};

export function getTemplatePreset(presetId: string): TemplatePresetInfo | null {
  return TEMPLATE_PRESETS[presetId] ?? null;
}

export function getAllTemplatePresets(): TemplatePresetInfo[] {
  return Object.values(TEMPLATE_PRESETS);
}
