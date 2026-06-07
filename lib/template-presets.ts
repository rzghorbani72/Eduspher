import { UIBlockConfig } from './theme-config';

export type TemplatePreset = string;

export interface TemplatePresetInfo {
  id: string;
  name: string;
  description: string;
  preview?: string;
  blocks: UIBlockConfig[];
}

export const TEMPLATE_PRESETS: Record<string, TemplatePresetInfo> = {
  kodiyar: {
    id: 'kodiyar',
    name: 'کدیار',
    description: 'قالب آموزش برنامه‌نویسی حرفه‌ای با طراحی تاریک و مدرن',
    blocks: [
      {
        id: 'header',
        type: 'header',
        order: 0,
        isVisible: true,
        config: { sticky: true, showNavigation: true },
      },
      {
        id: 'hero',
        type: 'hero',
        order: 1,
        isVisible: true,
        config: {
          style: 'dark-programmer',
          title: 'برنامه‌نویسی را از متخصص‌های واقعی یاد بگیر',
          subtitle:
            'دوره‌های جامع و پروژه‌محور برای توسعه‌دهندگان جدی. از مبتدی تا حرفه‌ای، مسیر یادگیری خود را انتخاب کن.',
          showCTA: true,
          ctaText: 'شروع یادگیری',
          ctaSecondary: 'مشاهده دوره‌ها',
          height: 'large',
        },
      },
      {
        id: 'courses',
        type: 'courses',
        order: 2,
        isVisible: true,
        config: {
          title: 'پرطرفدارترین دوره‌ها',
          subtitle: 'با بهترین دوره‌ها یادگیری را شروع کن',
          gridColumns: 3,
          limit: 6,
          layout: 'grid',
          showViewAll: true,
        },
      },
      {
        id: 'features-stats',
        type: 'features',
        order: 3,
        isVisible: true,
        config: {
          style: 'stats',
          stats: [
            { value: '۵۰۰+', label: 'دوره تخصصی' },
            { value: '۱۲۰K', label: 'دانش‌آموز فعال' },
            { value: '۸۵', label: 'مدرس حرفه‌ای' },
            { value: '۴.۸★', label: 'میانگین امتیاز' },
          ],
        },
      },
      {
        id: 'features-instructors',
        type: 'features',
        order: 4,
        isVisible: true,
        config: {
          style: 'instructors',
          title: 'از متخصصان واقعی صنعت یاد بگیر',
          subtitle: 'مدرسان برتر — حرفه‌ای‌های فعال در شرکت‌های بزرگ',
          gridColumns: 3,
        },
      },
      {
        id: 'testimonials',
        type: 'testimonials',
        order: 5,
        isVisible: true,
        config: {
          title: 'نظرات دانش‌آموزان',
          subtitle: 'آنچه هم‌دوره‌ای‌ها می‌گویند',
          layout: 'grid',
          style: 'default',
        },
      },
      {
        id: 'footer',
        type: 'footer',
        order: 6,
        isVisible: true,
        config: {
          showSocialLinks: true,
          showNewsletter: false,
          columns: 4,
        },
      },
    ],
  },
};

export function getTemplatePreset(presetId: string): TemplatePresetInfo | null {
  return TEMPLATE_PRESETS[presetId] ?? null;
}

export function getAllTemplatePresets(): TemplatePresetInfo[] {
  return Object.values(TEMPLATE_PRESETS);
}
