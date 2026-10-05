import { hashToIndex } from '@/lib/utils';

export const COURSE_COVER_GRADIENTS = [
  'linear-gradient(135deg,#7c6cff,#4f8cff)',
  'linear-gradient(135deg,#ff7eb3,#ff6a5e)',
  'linear-gradient(135deg,#11998e,#38ef7d)',
  'linear-gradient(135deg,#fa8b34,#f5af19)',
  'linear-gradient(135deg,#4f8cff,#23d5ab)',
  'linear-gradient(135deg,#a64bf4,#6d5efc)',
  'linear-gradient(135deg,#f857a6,#ff5858)',
  'linear-gradient(135deg,#0ea5e9,#6366f1)',
] as const;

const tint = (token: string, percent: number) =>
  `color-mix(in srgb, var(${token}) ${percent}%, transparent)`;

/** Soft template-colour pairs for the course preview, matching the light hero. */
const PREVIEW_ACCENT_ORBS = [
  { left: tint('--theme-primary', 40), right: tint('--theme-accent', 32) },
  { left: tint('--theme-secondary', 38), right: tint('--theme-primary', 30) },
  { left: tint('--theme-accent', 36), right: tint('--theme-secondary', 30) },
] as const;

export const courseCoverGradient = (courseId: string): string =>
  COURSE_COVER_GRADIENTS[hashToIndex(courseId, COURSE_COVER_GRADIENTS.length)];

export const coursePreviewAccentOrbs = (courseId: string): { left: string; right: string } =>
  PREVIEW_ACCENT_ORBS[hashToIndex(courseId, PREVIEW_ACCENT_ORBS.length)];
