/**
 * Raushan default copy.
 *
 * Presets ship structure; this file ships the words. Anything a manager edits
 * in AdminPanel lands in the block's `config` and wins over these values, so
 * this is the "first view" text, never a hardcoded string in a component.
 */

export const RAUSHAN_DEFAULTS = {
  hero: {
    tag: 'آکادمی آنلاین',
    title: 'یادگیری،',
    titleEm: 'بدون',
    titleEnd: 'دردسر.',
    subtitle:
      'همهٔ دوره‌ها، کلاس‌های زنده و پیشرفت دانشجویان در یک فضای ساده. شروع کنید بدون نیاز به دانش فنی.',
    ctaText: 'شروع رایگان',
    ctaSecondary: 'مشاهدهٔ دوره‌ها',
    note: 'مورد اعتماد صدها آموزشگاه در سراسر کشور',
    photoCaption: 'نمایی از پنل مدیریت آکادمی',
  },
} as const;
