/**
 * Query keys for the public site. Learner-facing data is scoped by the
 * enrollment or lesson it belongs to, which the backend already tenant-checks;
 * keys are centralised here so invalidation never has to guess a string.
 */
type KeyPart = string | number | boolean | null | undefined;

const key = (...parts: KeyPart[]): readonly KeyPart[] => parts;

export const queryKeys = {
  lessonProgress: (enrollmentId: string, lessonId: string) =>
    key('lesson-progress', enrollmentId, lessonId),

  notifications: () => key('notifications'),

  legalConsent: () => key('legal-consent'),

  assignments: (parentKind: string, parentId: string) => key('assignments', parentKind, parentId),

  liveLesson: (lessonId: string) => key('live-lesson', lessonId),
} as const;
