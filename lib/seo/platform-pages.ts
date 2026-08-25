import { env } from "@/lib/env";

export type PlatformPageSeo = {
  title: string;
  description: string;
};

const IR_PLATFORM_PAGES: Record<string, PlatformPageSeo> = {
  "/": {
    title: "منتوما | پلتفرم ساخت وبسایت آموزشی",
    description:
      "وب‌سایت آموزشی خودت را بدون کدنویسی بساز: قالب سفارشی با برند خودت، دورهٔ ضبط‌شده و کلاس زنده تکی یا گروهی، فروش و مدیریت دانشجو در یک پنل. ۱۴ روز رایگان.",
  },
  "/about": {
    title: "درباره منتوما — پلتفرم ساخت وبسایت آموزشی",
    description:
      "منتوما پلتفرم ساخت وبسایت آموزشی است؛ از یک مدرس تا آموزشگاه چندمعلمه، بدون کدنویسی و بدون توسعه‌دهنده.",
  },
  "/contact": {
    title: "تماس با منتوما",
    description: "با تیم منتوما در ارتباط باش — پشتیبانی، فروش و همکاری.",
  },
  "/academies": {
    title: "نمونه وبسایت‌های آموزشی ساخته‌شده با منتوما",
    description:
      "وب‌سایت‌های آموزشی واقعی که روی منتوما ساخته شده‌اند — جستجو کن و سایت هرکدام را ببین.",
  },
  "/pricing": {
    title: "قیمت‌ها و پلن‌ها | منتوما",
    description:
      "۱۴ روز رایگان و بدون کارت بانکی، بعد پلن استارتر، رشد یا بیزینس. بدون کارمزد از فروش دوره‌ها؛ فروش عمومی در همهٔ پلن‌ها نامحدود است.",
  },
  "/articles": {
    title: "وبلاگ منتوما — آموزش ساخت وبسایت آموزشی",
    description:
      "راهنماها و تجربه‌های ساخت و رشد کسب‌وکار آموزشی آنلاین: ساخت سایت، فروش دوره، کلاس زنده و مدیریت دانشجو.",
  },
  "/privacy": {
    title: "حریم خصوصی | منتوما",
    description:
      "سیاست حریم خصوصی منتوما — چه داده‌ای جمع می‌شود و چطور استفاده می‌شود.",
  },
  "/terms": {
    title: "قوانین و مقررات | منتوما",
    description: "شرایط استفاده از منتوما برای مدیران، مدرس‌ها و دانشجویان.",
  },
  "/refund": {
    title: "سیاست بازگشت وجه | منتوما",
    description: "قوانین بازگشت وجه و لغو اشتراک در منتوما.",
  },
};

const COM_PLATFORM_PAGES: Record<string, PlatformPageSeo> = {
  "/": {
    title: "Build Your Teaching Website | Mentoma",
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
    description:
      "Get in touch with the Mentoma team for support, sales, and partnerships.",
  },
  "/academies": {
    title: "Academies on Mentoma",
    description:
      "Browse and search the academies running on Mentoma — open any academy's own site.",
  },
  "/pricing": {
    title: "Pricing",
    description:
      "Transparent subscription plans for academies — a 14-day free trial, no commission on enrollments, clear storage limits.",
  },
  "/articles": {
    title: "Mentoma Blog",
    description:
      "Guides on building and growing an online teaching business: your website, course sales, live classes, and student management.",
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
    description:
      "Refund and cancellation policy for Mentoma subscriptions and purchases.",
  },
};

export const PLATFORM_SITEMAP_PATHS = [
  "/",
  "/about",
  "/contact",
  "/academies",
  "/pricing",
  "/privacy",
  "/terms",
  "/refund",
  "/articles",
] as const;

export function getPlatformPageSeo(pathname: string): PlatformPageSeo | null {
  const normalized =
    pathname === "" ? "/" : pathname.replace(/\/+$/, "") || "/";
  const pages = env.appRegion === "IR" ? IR_PLATFORM_PAGES : COM_PLATFORM_PAGES;
  return pages[normalized] ?? null;
}
