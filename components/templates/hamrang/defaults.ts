/**
 * Hamrang default copy.
 *
 * Presets ship structure; this file ships the words. Anything a manager edits
 * in AdminPanel lands in the block's `config` and wins over these values, so
 * this is the "first view" text, never a hardcoded string in a component.
 */

export const HAMRANG_DEFAULTS = {
  hero: {
    tag: 'ثبت‌نام باز است',
    title: 'یادگیری',
    titleEm: 'رنگی‌تر',
    titleEnd: 'از همیشه.',
    subtitle: 'دوره‌ها، کلاس‌های زنده و پیگیری پیشرفت دانشجویان، همه در یک آکادمی آنلاین شاد و ساده.',
    ctaText: 'ثبت‌نام کنید',
    ctaSecondary: 'مشاهدهٔ دوره‌ها',
    photoCaption: 'نمایی از دورهٔ شما',
  },
} as const;
