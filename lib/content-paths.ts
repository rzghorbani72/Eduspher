/** Next may leave Unicode route params percent-encoded; decode before lookup. */
export function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(decodePathSegment(value));
}

/** Public catalog and classroom paths. Encode so Persian slugs stay valid. */
export function coursePath(slug: string): string {
  return `/courses/${encodePathSegment(slug)}`;
}

export function learnPath(courseSlug: string, lessonSlug?: string): string {
  const course = `/learn/${encodePathSegment(courseSlug)}`;
  return lessonSlug ? `${course}/${encodePathSegment(lessonSlug)}` : course;
}

/** Live group classroom for a course (same family as recorded learn). */
export function liveClassPath(courseSlug: string): string {
  return `${learnPath(courseSlug)}/live`;
}
