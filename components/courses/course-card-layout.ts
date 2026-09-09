/**
 * One size for every course card: catalogue, home, related, and "my courses".
 * Grids use auto-fill so a single card stays ~310px instead of stretching or
 * collapsing into a skinny third-column.
 */
export const COURSE_CARD_MIN_WIDTH_PX = 310;

export const COURSE_CARD_GRID_CLASS =
  "grid gap-6 grid-cols-[repeat(auto-fill,minmax(min(100%,310px),1fr))]";

export const COURSE_CARD_THUMB_CLASS = "relative aspect-[4/3] h-auto overflow-hidden";
