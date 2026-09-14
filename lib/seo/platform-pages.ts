import { env } from '@/lib/env';

export type PlatformPageSeo = {
  title: string;
  description: string;
  keywords: string[];
  /** Short label Google may use for sitelinks under the brand result. */
  navLabel: string;
};

export type PlatformSitelinkCandidate = {
  id: string;
  label: string;
  description?: string;
  kind: 'page' | 'login';
  path?: string;
};

const IR_KEYWORDS_CORE = [
  'منتوما',
  'Mentoma',
  'ساخت وبسایت آموزشی',
  'پلتفرم آموزش آنلاین',
  'آکادمی آنلاین',
  'ساخت آکادمی',
  'سایت آموزشگاهی',
  'فروش دوره آنلاین',
  'کلاس آنلاین (زنده)',
  'بدون کدنویسی',
];

const COM_KEYWORDS_CORE = [
  'Mentoma',
  'academy platform',
  'online teaching website',
  'academy operating system',
  'course website builder',
  'live class platform',
];

/**
 * Homepage title mirrors Yektanet’s pattern: Brand | clear market claim.
 * Keep under ~60 chars so Google does not truncate mid-phrase.
 */
const IR_PLATFORM_PAGES: Record<string, PlatformPageSeo> = {
  '/': {
    title: 'منتوما | پلتفرم ساخت وبسایت آموزشی ایران',
    description:
      'منتوما پلتفرم ساخت وبسایت آموزشی برای آموزشگاه‌ها: قالب با برند خودت، دورهٔ ضبط‌شده و کلاس آنلاین (زنده) تکی یا گروهی، ثبت‌نام و پرداخت دانشجو در یک پنل. ۱۴ روز رایگان، بدون کارمزد از فروش.',
    keywords: IR_KEYWORDS_CORE,
    navLabel: 'صفحه اصلی',
  },
  '/about': {
    title: 'درباره منتوما | داستان پلتفرم ساخت وبسایت آموزشی',
    description:
      'منتوما را ساختیم تا مدیر آموزشگاه بدون کدنویسی، سایت آموزشی، مدرس‌ها، کلاس آنلاین (زنده) و فروش دوره را در یک سیستم اداره کند.',
    keywords: [...IR_KEYWORDS_CORE, 'درباره منتوما'],
    navLabel: 'درباره ما',
  },
  '/contact': {
    title: 'تماس با منتوما | پشتیبانی و فروش',
    description:
      'با تیم منتوما در ارتباط باش — پشتیبانی محصول، مشاوره فروش پلن، و همکاری با آموزشگاه‌ها.',
    keywords: [...IR_KEYWORDS_CORE, 'تماس با منتوما', 'پشتیبانی منتوما'],
    navLabel: 'تماس با ما',
  },
  '/academies': {
    title: 'نمونه آکادمی‌های منتوما | وبسایت‌های آموزشی واقعی',
    description:
      'نمونه‌های واقعی وبسایت آموزشی ساخته‌شده با منتوما را ببین — هر آکادمی سایت و برند خودش را دارد.',
    keywords: [...IR_KEYWORDS_CORE, 'نمونه آکادمی', 'دمو منتوما'],
    navLabel: 'نمونه آکادمی‌ها',
  },
  '/pricing': {
    title: 'تعرفه و پلن‌های منتوما | قیمت اشتراک آموزشگاه',
    description:
      'تعرفه منتوما: ۱۴ روز رایگان بدون کارت بانکی، بعد پلن استارتر، رشد یا بیزینس. بدون کارمزد از فروش دوره‌ها؛ فروش عمومی در همهٔ پلن‌ها نامحدود است.',
    keywords: [
      ...IR_KEYWORDS_CORE,
      'قیمت منتوما',
      'تعرفه منتوما',
      'پلن منتوما',
      'اشتراک آکادمی آنلاین',
    ],
    navLabel: 'تعرفه و پلن‌ها',
  },
  '/blog': {
    title: 'وبلاگ منتوما | آموزش ساخت و رشد آکادمی آنلاین',
    description:
      'راهنماهای منتوما برای ساخت وبسایت آموزشی، فروش دوره، کلاس آنلاین (زنده) و مدیریت دانشجو — از راه‌اندازی تا رشد.',
    keywords: [...IR_KEYWORDS_CORE, 'وبلاگ منتوما', 'آموزش ساخت آکادمی'],
    navLabel: 'وبلاگ',
  },
  '/privacy': {
    title: 'حریم خصوصی منتوما',
    description:
      'سیاست حریم خصوصی منتوما — چه داده‌ای جمع می‌شود و چطور برای ارائهٔ سرویس استفاده می‌شود.',
    keywords: ['حریم خصوصی منتوما', 'منتوما'],
    navLabel: 'حریم خصوصی',
  },
  '/terms': {
    title: 'قوانین و مقررات منتوما',
    description: 'شرایط استفاده از پلتفرم منتوما برای مدیران آکادمی، مدرس‌ها و دانشجویان.',
    keywords: ['قوانین منتوما', 'منتوما'],
    navLabel: 'قوانین',
  },
  '/refund': {
    title: 'سیاست بازگشت وجه منتوما',
    description: 'قوانین بازگشت وجه و لغو اشتراک پلن‌های منتوما.',
    keywords: ['بازگشت وجه منتوما', 'منتوما'],
    navLabel: 'بازگشت وجه',
  },
};

const COM_PLATFORM_PAGES: Record<string, PlatformPageSeo> = {
  '/': {
    title: 'Mentoma | Academy Website Platform for Teaching Businesses',
    description:
      'Mentoma is an Academy Operating System for managers: branded site, recorded courses, live classes, enrollment, and payments — with a 14-day free trial and no commission on sales.',
    keywords: COM_KEYWORDS_CORE,
    navLabel: 'Home',
  },
  '/about': {
    title: 'About Mentoma | Academy Operating System',
    description:
      'Mentoma helps academy managers run enrollment, teachers, live classes, and payments without building software from scratch.',
    keywords: [...COM_KEYWORDS_CORE, 'about Mentoma'],
    navLabel: 'About',
  },
  '/contact': {
    title: 'Contact Mentoma | Support & Sales',
    description:
      'Reach the Mentoma team for product support, plan questions, and academy partnerships.',
    keywords: [...COM_KEYWORDS_CORE, 'contact Mentoma'],
    navLabel: 'Contact',
  },
  '/academies': {
    title: 'Academies on Mentoma | Live Examples',
    description:
      'Browse real academies running on Mentoma — each with its own branded teaching site.',
    keywords: [...COM_KEYWORDS_CORE, 'Mentoma demos'],
    navLabel: 'Examples',
  },
  '/pricing': {
    title: 'Mentoma Pricing | Plans & Free Trial',
    description:
      'Mentoma subscription plans with a 14-day free trial, no commission on enrollments, and clear storage limits.',
    keywords: [...COM_KEYWORDS_CORE, 'Mentoma pricing', 'Mentoma plans'],
    navLabel: 'Pricing',
  },
  '/blog': {
    title: 'Mentoma Blog | Grow Your Online Academy',
    description:
      'Guides on building and growing an online teaching business: your website, course sales, live classes, and student ops.',
    keywords: [...COM_KEYWORDS_CORE, 'Mentoma blog'],
    navLabel: 'Blog',
  },
  '/privacy': {
    title: 'Mentoma Privacy Policy',
    description: 'How Mentoma collects and uses data to run the academy platform.',
    keywords: ['Mentoma privacy'],
    navLabel: 'Privacy',
  },
  '/terms': {
    title: 'Mentoma Terms of Service',
    description: 'Terms of use for the Mentoma academy platform.',
    keywords: ['Mentoma terms'],
    navLabel: 'Terms',
  },
  '/refund': {
    title: 'Mentoma Refund Policy',
    description: 'Refund and cancellation policy for Mentoma subscriptions and purchases.',
    keywords: ['Mentoma refund'],
    navLabel: 'Refunds',
  },
};

/** Yektanet-style brand sitelink candidates (order = preference). */
export const PLATFORM_SITELINK_CANDIDATES_IR: PlatformSitelinkCandidate[] = [
  {
    id: 'pricing',
    kind: 'page',
    path: '/pricing',
    label: 'تعرفه و پلن‌های منتوما',
    description: '۱۴ روز رایگان و پلن‌های استارتر، رشد و بیزینس — بدون کارمزد فروش.',
  },
  {
    id: 'contact',
    kind: 'page',
    path: '/contact',
    label: 'تماس با ما',
    description: 'پشتیبانی محصول، مشاوره فروش و همکاری با آموزشگاه‌ها.',
  },
  {
    id: 'login',
    kind: 'login',
    label: 'ورود به منتوما',
    description: 'ورود به پنل مدیریت آکادمی منتوما.',
  },
  {
    id: 'academies',
    kind: 'page',
    path: '/academies',
    label: 'نمونه آکادمی‌ها',
    description: 'وبسایت‌های آموزشی واقعی ساخته‌شده با منتوما را ببین.',
  },
  {
    id: 'about',
    kind: 'page',
    path: '/about',
    label: 'درباره منتوما',
    description: 'داستان منتوما و ماموریت ما برای آموزشگاه‌ها.',
  },
];

export const PLATFORM_SITELINK_CANDIDATES_COM: PlatformSitelinkCandidate[] = [
  {
    id: 'pricing',
    kind: 'page',
    path: '/pricing',
    label: 'Pricing & plans',
    description: '14-day free trial and clear subscription plans.',
  },
  {
    id: 'contact',
    kind: 'page',
    path: '/contact',
    label: 'Contact us',
    description: 'Support, sales, and academy partnerships.',
  },
  {
    id: 'login',
    kind: 'login',
    label: 'Log in to Mentoma',
    description: 'Sign in to your Mentoma academy panel.',
  },
  {
    id: 'academies',
    kind: 'page',
    path: '/academies',
    label: 'Example academies',
    description: 'Browse live academies running on Mentoma.',
  },
  {
    id: 'about',
    kind: 'page',
    path: '/about',
    label: 'About Mentoma',
    description: 'Why we built an Academy Operating System.',
  },
];

export const PLATFORM_SITELINK_CANDIDATES =
  env.appRegion === 'IR' ? PLATFORM_SITELINK_CANDIDATES_IR : PLATFORM_SITELINK_CANDIDATES_COM;

/** @deprecated Prefer PLATFORM_SITELINK_CANDIDATES — kept for sitemap callers. */
export const PLATFORM_SITELINK_PATHS = [
  '/pricing',
  '/academies',
  '/about',
  '/contact',
  '/blog',
] as const;

export const PLATFORM_SITEMAP_PATHS = [
  '/',
  '/about',
  '/contact',
  '/academies',
  '/pricing',
  '/privacy',
  '/terms',
  '/refund',
  '/blog',
] as const;

const SITEMAP_PRIORITY: Record<string, number> = {
  '/': 1,
  '/pricing': 0.9,
  '/academies': 0.85,
  '/about': 0.8,
  '/contact': 0.8,
  '/blog': 0.7,
  '/privacy': 0.3,
  '/terms': 0.3,
  '/refund': 0.3,
};

export function getSitemapPriority(path: string): number {
  return SITEMAP_PRIORITY[path] ?? 0.5;
}

export function getPlatformPageSeo(pathname: string): PlatformPageSeo | null {
  const normalized = pathname === '' ? '/' : pathname.replace(/\/+$/, '') || '/';
  const pages = env.appRegion === 'IR' ? IR_PLATFORM_PAGES : COM_PLATFORM_PAGES;
  return pages[normalized] ?? null;
}
