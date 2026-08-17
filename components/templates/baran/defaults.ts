/**
 * Baran default copy.
 *
 * Presets ship structure; this file ships the words. Anything a manager edits
 * in AdminPanel lands in the block's `config` and wins over these values, so
 * this is the "first view" text, never a hardcoded string in a component.
 */

export const BARAN_DEFAULTS = {
  hero: {
    tag: 'دستیار هوشمند آکادمی',
    title: 'مدیریت آکادمی',
    titleEm: 'دیگر',
    titleEnd: 'پیچیده نیست.',
    subtitle: 'ثبت‌نام، کلاس‌های زنده و ارتباط با دانشجویان، همه در یک تجربهٔ ساده و آرام.',
    ctaText: 'رایگان شروع کنید',
    note: 'بدون نیاز به کارت بانکی',
    photoCaption: 'پیش‌نمایش صفحهٔ آکادمی شما',
  },
} as const;
