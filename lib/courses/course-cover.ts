import { hashToIndex } from "@/lib/utils";

export const COURSE_COVER_GRADIENTS = [
  "linear-gradient(135deg,#7c6cff,#4f8cff)",
  "linear-gradient(135deg,#ff7eb3,#ff6a5e)",
  "linear-gradient(135deg,#11998e,#38ef7d)",
  "linear-gradient(135deg,#fa8b34,#f5af19)",
  "linear-gradient(135deg,#4f8cff,#23d5ab)",
  "linear-gradient(135deg,#a64bf4,#6d5efc)",
  "linear-gradient(135deg,#f857a6,#ff5858)",
  "linear-gradient(135deg,#0ea5e9,#6366f1)",
] as const;

/** Muted accent pairs for the large course preview — matches the hero, not card chips. */
const PREVIEW_ACCENT_ORBS = [
  { left: "rgba(124, 108, 255, 0.42)", right: "rgba(79, 140, 255, 0.32)" },
  { left: "rgba(99, 102, 241, 0.38)", right: "rgba(56, 189, 248, 0.28)" },
  { left: "rgba(139, 92, 246, 0.38)", right: "rgba(167, 139, 250, 0.26)" },
  { left: "rgba(59, 130, 246, 0.36)", right: "rgba(14, 165, 233, 0.28)" },
  { left: "rgba(168, 85, 247, 0.34)", right: "rgba(236, 72, 153, 0.22)" },
  { left: "rgba(20, 184, 166, 0.32)", right: "rgba(59, 130, 246, 0.28)" },
] as const;

export const courseCoverGradient = (courseId: string): string =>
  COURSE_COVER_GRADIENTS[hashToIndex(courseId, COURSE_COVER_GRADIENTS.length)];

export const coursePreviewAccentOrbs = (
  courseId: string,
): { left: string; right: string } =>
  PREVIEW_ACCENT_ORBS[hashToIndex(courseId, PREVIEW_ACCENT_ORBS.length)];
