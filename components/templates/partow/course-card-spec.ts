import type { CourseCardSpec } from '../_shared/course-card';
import styles from './partow.module.css';

/**
 * Partow's course-card look, read by every page that lists courses (home,
 * catalogue, detail). Kept in its own file so the courses section can import it
 * without pulling in `index.tsx`, which imports the section back.
 *
 * Rouzan spends its colour budget on flat tints; Partow is the card-led
 * variant, so an empty thumbnail carries a brand gradient instead of a wash.
 */
export const PARTOW_COURSE_CARD: CourseCardSpec = {
  thumbTones: [styles.g1, styles.g2, styles.g3, styles.g4],
  thumbClassName: 'relative aspect-[4/3] overflow-hidden',
  footer: 'rating',
};
