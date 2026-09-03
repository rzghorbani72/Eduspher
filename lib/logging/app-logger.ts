import { createLogger } from './logger';
import { LOG_CATALOG } from './log-catalog';

/** Website-wide structured logger. Import this at call sites, not createLogger. */
export const logger = createLogger({ app: 'website', catalog: LOG_CATALOG });
