import { PARTOW_CATALOG_DEFAULTS } from './defaults-catalog';

/**
 * Partow default copy — the centred, card-led personal site of a fullstack
 * programming teacher.
 *
 * Presets ship structure; this file ships the words. Anything a manager edits
 * in AdminPanel lands in the block's `config` and wins over these values.
 */

const NARRATIVE_DEFAULTS = {
  hero: {
    title: 'کد بزن مثل کسی که',
    titleEm: 'فردا استخدام',
    titleEnd: 'می‌شود',
    subtitle:
      'بدون آموزش‌های نصفه‌نیمه. دوره‌های ویدیویی فول‌استک، با پروژه‌های واقعی و تمرین‌هایی که خط‌به‌خط بازبینی می‌شوند.',
    ctaText: 'شروع یادگیری',
    ctaSecondary: 'پیش‌نمایش ۱۴ دقیقه‌ای',
    ratingValue: '۴٫۸ از ۵',
    ratingNote: 'میانگین ۱٬۲۴۰ نظر',
    trustStudents: '۴٬۸۳۰ دانشجوی ثبت‌نامی',
    trustRefund: '۷ روز مهلت انصراف',
    videoTab: 'intro-fullstack.mp4',
    videoNote: 'پیش‌نمایش رایگان · بدون ثبت‌نام',
    videoCaption: 'این دوره برای چه کسی است؟',
    videoCaptionSub: 'مدرس دوره · مهندس نرم‌افزار',
    videoDuration: '۱۴:۳۲',
    stats: [
      { value: '۲۱۶', label: 'ساعت ویدیوی منتشرشده' },
      { value: '۴۱', label: 'تمرین با بازبینی کد' },
      { value: '۱۹ ساعت', label: 'میانگین پاسخ به تمرین' },
      { value: 'مهر ۱۴۰۴', label: 'آخرین بازنگری فصل‌ها' },
    ],
  },

  marquee: {
    items: [
      'جاوااسکریپت مدرن',
      'ری‌اکت و نکست',
      'تایپ‌اسکریپت',
      'نود و پستگرس',
      'تست و یکپارچه‌سازی',
      'معماری فرانت‌اند',
      '۲۱۶ ساعت ویدیو',
    ],
  },

  features: {
    eyebrow: 'ساخت متفاوت',
    title: 'چه چیزی این دوره‌ها را متفاوت می‌کند',
    items: [
      {
        eyebrow: 'یک مسیر روشن، از اول تا آخر',
        title: 'دیگر ویدیوی پراکنده تماشا نمی‌کنی',
        body: 'ویدیوهای جسته‌گریخته کسی را استخدام‌شدنی نمی‌کنند. هر دوره ترتیب عمدی دارد: هر جلسه روی جلسهٔ قبل بنا می‌شود، پس چیزی از قلم نمی‌افتد.',
        figure: 'نقشهٔ راه دوره',
      },
      {
        eyebrow: 'چرا، نه فقط چه',
        title: 'واقعاً می‌فهمی چه خبر است',
        body: 'هر آموزشی می‌تواند بگوید چه تایپ کن. اینجا می‌گویم چرا کار می‌کند — تا وقتی به مسئله‌ای رسیدی که قبلاً ندیده‌ای، خودت بتوانی حلش کنی.',
        figure: 'توضیح خط‌به‌خط کد',
      },
      {
        eyebrow: 'پروژهٔ واقعی، نه اپ اسباب‌بازی',
        title: 'چیزی می‌سازی که نشان‌دادنی باشد',
        body: 'محصولی می‌نویسیم که احراز هویت، پرداخت، دیپلوی و مانیتورینگ دارد — همان‌طور که یک تیم حرفه‌ای می‌نویسد. آخرش چیزی در نمونه‌کارت داری که به آن افتخار کنی.',
        figure: 'پروژهٔ منتشرشده',
      },
    ],
  },

  cta: {
    title: 'تماشا را تمام کن. ساختن را شروع کن.',
    subtitle:
      'جلسهٔ اول هر دوره بلافاصله باز می‌شود. اگر سبک تدریس به تو نخورد، تا هفت روز کل مبلغ برمی‌گردد.',
    ctaText: 'ثبت‌نام و شروع',
    note: 'بیش از ۳٬۱۰۰ دانشجو تا امروز شروع کرده‌اند.',
  },

  footer: {
    about: 'دوره‌های ویدیویی برنامه‌نویسی فول‌استک، پروژه‌محور و به‌روز. تدریس به زبان ساده، بدون حاشیه.',
    legal: 'تمام حقوق محفوظ است.',
  },
} as const;

export const PARTOW_DEFAULTS = {
  ...NARRATIVE_DEFAULTS,
  ...PARTOW_CATALOG_DEFAULTS,
} as const;
