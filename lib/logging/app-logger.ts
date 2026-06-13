import { createLogger } from './logger';

/** edusphere (public website) structured logger. Import this at call sites, not createLogger. */
export const logger = createLogger({ app: 'website' });
