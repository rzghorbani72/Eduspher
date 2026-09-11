import { SHAFAGH_DEFAULTS } from '../shafagh/defaults';

/** Pardeh is Shafagh with a video banner: same words, only the hero differs. */
export const PARDEH_DEFAULTS = {
  ...SHAFAGH_DEFAULTS,
  hero: {
    ...SHAFAGH_DEFAULTS.hero,
    kicker: 'آکادمی فیلم، عکاسی و رسانهٔ بصری',
    subtitle: 'از نور و ترکیب‌بندی تا تدوین و روایت تصویری: دوره‌های عملی با پروژهٔ واقعی و اکران پایان‌دوره.',
    videoCaption: 'ویدیوی بنر آکادمی اینجا نمایش داده می‌شود',
  },
} as const;
