export type CourseTabKey = 'overview' | 'instructor' | 'reviews';

export const isCourseTabKey = (value: string | undefined): value is CourseTabKey =>
  value === 'overview' || value === 'instructor' || value === 'reviews';
