import { type SlideConfig } from '../hero-slideshow';
import { type MediaAspect, type MediaSize } from '../section-media';

export interface HeroBlockProps {
  id?: string;
  config?: {
    title?: string;
    subtitle?: string;
    showCTA?: boolean;
    ctaText?: string;
    ctaSecondary?: string;
    backgroundImage?: string | null;
    /** Background controls from the Style tab (gradient = theme default). */
    bgType?: 'gradient' | 'solid' | 'image';
    bgColor?: string;
    bgImage?: string | null;
    overlayOpacity?: number;
    illustration?: string | null;
    illustrationPreset?: string | null;
    overlay?: boolean;
    alignment?: 'left' | 'center' | 'right';
    height?: 'small' | 'medium' | 'large';
    speed?: 'slow' | 'normal' | 'fast';
    style?:
      | 'default'
      | 'expert'
      | 'creator-store'
      | 'social'
      | 'community'
      | 'studio'
      | 'creator'
      | 'expert-academy'
      | 'dark-programmer'
      | 'flow'
      | 'code'
      | 'creative';
    /** Creative hero: 2×2 mini class cards + 4 headline stats. */
    stats?: { value: string; label: string }[];
    miniCards?: { title: string; instructor: string }[];
    /** Flow hero: highlighted middle line of the heading + decorative progress card. */
    titleEm?: string;
    titleEnd?: string;
    tag?: string;
    trustCount?: string;
    /** Code hero: trust block secondary line (rating) + live badge. */
    ratingText?: string;
    ratingLabel?: string;
    trustLabel?: string;
    liveText?: string;
    featuredLabel?: string;
    featuredTitle?: string;
    card?: {
      tag?: string;
      title?: string;
      instructor?: string;
      progress?: number;
      progressText?: string;
      stats?: { label: string; value: string }[];
      duration?: string;
      price?: string;
      rating?: string;
      ratingCount?: string;
      enroll?: string;
    };
    gradient?: 'default' | 'purple';
    dark?: boolean;
    showExpertPhotos?: boolean;
    showProductCards?: boolean;
    mediaSize?: MediaSize;
    mediaAspect?: MediaAspect;
    /** Multiple slides for the hero carousel. When provided, overrides single title/subtitle. */
    slides?: SlideConfig[];
    /** When true, fill stat fields (learner/course counts) from real academy data. */
    useLiveData?: boolean;
  };
  storeContext?: {
    id: string | null;
    slug: string | null;
    isSubdomain?: boolean;
    name: string | null;
    stats?: { courseCount: number; studentCount: number } | null;
  };
  blockType?: 'hero' | 'slideshow';
}

export type HeroBg =
  | { kind: 'image'; url: string; overlay: number }
  | { kind: 'solid'; color: string }
  | { kind: 'gradient' };

export function speedToMs(speed?: string) {
  if (speed === 'slow') return 5000;
  if (speed === 'fast') return 1500;
  return 2800;
}

// ── Flow (منتوما) — course-progress hero card ──────────────────────────────

export const FLOW_AVATAR_TONES = [
  'bg-(--theme-primary) text-(--theme-on-primary)',
  'bg-(--theme-secondary) text-(--theme-on-secondary)',
  'bg-(--theme-accent) text-(--theme-on-accent)',
  'bg-(--theme-primary) text-(--theme-on-primary)',
  'bg-(--theme-accent) text-(--theme-on-accent)',
];
