import { type SlotConfig } from '@/lib/slot-config';

export interface StaticCourse {
  thumbLabel?: string;
  tag?: string;
  title?: string;
  instructor?: string;
  duration?: string;
  rating?: string;
  ratingCount?: string;
  students?: string;
  level?: string;
  badge?: string;
  price?: string;
  lessons?: string;
  stars?: string;
}

export interface CourseGridBlockProps {
  id?: string;
  config?: {
    label?: string;
    title?: string;
    viewAllText?: string;
    pills?: string[];
    courses?: StaticCourse[];
    style?: 'default' | 'code' | 'creative';
    /** code: sticky topic tab strip rendered above the grid. */
    topics?: string[];
    slots?: SlotConfig[];
    text?: Record<string, string>;
  };
}

// Decorative gradient thumbnails — built only from theme tokens, cycled per card.
export const THUMB_GRADIENTS = [
  'bg-[linear-gradient(135deg,var(--theme-primary),color-mix(in_srgb,var(--theme-primary)_35%,var(--theme-secondary)))]',
  'bg-[linear-gradient(135deg,var(--theme-accent),color-mix(in_srgb,var(--theme-accent)_55%,var(--theme-primary)))]',
  'bg-[linear-gradient(135deg,var(--theme-secondary),color-mix(in_srgb,var(--theme-secondary)_45%,var(--theme-accent)))]',
];
