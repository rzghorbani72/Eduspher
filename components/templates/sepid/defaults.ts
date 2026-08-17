/**
 * Sepid default copy.
 *
 * Presets ship structure; this file ships the words. Anything a manager edits
 * in AdminPanel lands in the block's `config` and wins over these values, so
 * this is the "first view" text, never a hardcoded string in a component.
 */

export const SEPID_DEFAULTS = {
  hero: {
    title: 'آکادمی شما،',
    titleEm: 'ساده‌تر',
    titleEnd: 'از همیشه.',
    subtitle: 'دوره‌ها، کلاس‌های زنده و پیشرفت دانشجویان، همه در یک صفحه.',
    ctaText: 'شروع کنید',
    ctaSecondary: 'مشاهدهٔ دموی زنده',
    photoCaption: 'پیش‌نمایش صفحهٔ آکادمی شما',
  },
} as const;
