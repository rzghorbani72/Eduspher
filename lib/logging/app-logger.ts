import { createLogger } from "./logger";

/** website-wide structured logger. Import this at call sites, not createLogger. */
export const logger = createLogger({ app: "website" });
