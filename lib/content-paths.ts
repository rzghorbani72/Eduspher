/** Public catalog and classroom paths. Encode so Persian slugs stay valid. */

export function coursePath(slug: string): string {
  return `/courses/${encodeURIComponent(slug)}`;
}

export function learnPath(courseSlug: string, lessonSlug?: string): string {
  const course = `/learn/${encodeURIComponent(courseSlug)}`;
  return lessonSlug ? `${course}/${encodeURIComponent(lessonSlug)}` : course;
}
