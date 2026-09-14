import type { CourseAccessType } from '@/lib/api/account-types';

/** i18n keys for how the student got into a course. */
export const ACCESS_TYPE_I18N: Record<CourseAccessType, string> = {
  STAFF_GRANT: 'courses.accessTypeSTAFF_GRANT',
  ONE_TIME: 'courses.accessTypeONE_TIME',
  BUNDLE: 'courses.accessTypeBUNDLE',
  SUBSCRIPTION: 'courses.accessTypeSUBSCRIPTION',
  TUTORING: 'courses.accessTypeTUTORING',
};

export function accessTypeLabelKey(type: CourseAccessType | undefined): string {
  return ACCESS_TYPE_I18N[type ?? 'ONE_TIME'];
}
