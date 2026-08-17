/**
 * Shabtab default copy.
 *
 * Presets ship structure; this file ships the words. Anything a manager edits
 * in AdminPanel lands in the block's `config` and wins over these values, so
 * this is the "first view" text, never a hardcoded string in a component.
 */

export const SHABTAB_DEFAULTS = {
  hero: {
    tag: 'نسل جدید آموزش آنلاین',
    title: 'آینده یادگیری،',
    titleEm: 'همین',
    titleEnd: 'امروز.',
    subtitle: 'یک فضای واحد برای دوره‌ها، کلاس‌های زنده و پیشرفت دانشجویان — طراحی‌شده برای رشد سریع آکادمی شما.',
    ctaText: 'شروع کنید',
    note: 'بدون نیاز به کارت اعتباری',
    photoCaption: 'نمایی از پیش‌نمایش دورهٔ شما',
  },
} as const;
