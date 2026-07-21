import { env } from "@/lib/env";

export type PlatformPageSeo = {
  title: string;
  description: string;
};

const IR_PLATFORM_PAGES: Record<string, PlatformPageSeo> = {
  "/": {
    title: "منتوما — سیستم‌عامل آکادمی",
    description:
      "پلتفرم مدیریت آکادمی آنلاین برای مدیران: ثبت‌نام، معلم‌ها، کلاس زنده و پرداخت — بدون کدنویسی.",
  },
  "/about": {
    title: "درباره منتوما",
    description:
      "منتوما سیستم‌عامل آکادمی است؛ برای مدیران آموزشی که عملیات، نه فقط محتوا، را مدیریت می‌کنند.",
  },
  "/contact": {
    title: "تماس با منتوما",
    description: "با تیم منتوما در ارتباط باشید — پشتیبانی، فروش و همکاری.",
  },
  "/pricing": {
    title: "قیمت‌ها",
    description:
      "پلن‌های شفاف برای آکادمی‌ها و منتورها — از استارتر تا رشد، با کمیسیون و ذخیره‌سازی مشخص.",
  },
  "/privacy": {
    title: "حریم خصوصی",
    description: "سیاست حریم خصوصی منتوما — نحوه جمع‌آوری و استفاده از داده‌ها.",
  },
  "/terms": {
    title: "قوانین و مقررات",
    description: "شرایط استفاده از پلتفرم منتوما برای مدیران آکادمی و دانشجویان.",
  },
  "/refund": {
    title: "سیاست بازگشت وجه",
    description: "قوانین بازگشت وجه و لغو اشتراک در منتوما.",
  },
};

const COM_PLATFORM_PAGES: Record<string, PlatformPageSeo> = {
  "/": {
    title: "Mentoma — Academy Operating System",
    description:
      "Multi-tenant academy platform for managers: enrollment, teachers, live classes, and payments.",
  },
  "/about": {
    title: "About Mentoma",
    description:
      "Mentoma is an Academy Operating System built for academy managers who run operations at scale.",
  },
  "/contact": {
    title: "Contact Mentoma",
    description: "Get in touch with the Mentoma team for support, sales, and partnerships.",
  },
  "/pricing": {
    title: "Pricing",
    description:
      "Transparent subscription plans for academies — one free month, no commission on enrollments, clear storage limits.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description: "Mentoma privacy policy — how we collect and use your data.",
  },
  "/terms": {
    title: "Terms of Service",
    description: "Terms of use for the Mentoma academy platform.",
  },
  "/refund": {
    title: "Refund Policy",
    description: "Refund and cancellation policy for Mentoma subscriptions and purchases.",
  },
};

export const PLATFORM_SITEMAP_PATHS = [
  "/",
  "/about",
  "/contact",
  "/pricing",
  "/privacy",
  "/terms",
  "/refund",
] as const;

export function getPlatformPageSeo(pathname: string): PlatformPageSeo | null {
  const normalized = pathname === "" ? "/" : pathname.replace(/\/+$/, "") || "/";
  const pages =
    env.appRegion === "IR" ? IR_PLATFORM_PAGES : COM_PLATFORM_PAGES;
  return pages[normalized] ?? null;
}
