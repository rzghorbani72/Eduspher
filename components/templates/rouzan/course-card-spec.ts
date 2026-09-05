import type { CourseCardSpec } from '../_shared/course-card';
import styles from './rouzan.module.css';

/**
 * Rouzan's course-card look, read by every page that lists courses (home,
 * catalogue, detail). Kept in its own file so the courses section can import it
 * without pulling in `index.tsx`, which imports the section back.
 *
 * Flat tints, no gradients: the page's whole colour budget is spent on one
 * vivid brand colour, so thumbnails stay quiet.
 */
export const ROUZAN_COURSE_CARD: CourseCardSpec = {
  thumbTones: [styles.tA, styles.tB, styles.tC, styles.tD],
  thumbClassName: 'relative aspect-video overflow-hidden',
  footer: 'rating',
};
