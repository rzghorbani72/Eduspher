/** Mirror of Backend `class-request-windows.ts`: the server stays the real gate. */
export type WeeklyWindow = { weekday: number; start_minute: number; end_minute: number };

export type WindowProblem = 'INVALID' | 'SELF_OVERLAP' | 'TEACHER_BUSY';

const DAY_MINUTES = 1440;

export const windowsOverlap = (a: WeeklyWindow, b: WeeklyWindow): boolean =>
  a.weekday === b.weekday && a.start_minute < b.end_minute && a.end_minute > b.start_minute;

/** Why the window at `index` can't be sent, or null when it is a free, valid time. */
export const windowProblemAt = (
  windows: readonly WeeklyWindow[],
  index: number,
  busy: readonly WeeklyWindow[],
): WindowProblem | null => {
  const window = windows[index];
  if (!window) return null;
  if (window.end_minute <= window.start_minute || window.end_minute > DAY_MINUTES) {
    return 'INVALID';
  }
  if (windows.some((other, i) => i !== index && windowsOverlap(window, other))) {
    return 'SELF_OVERLAP';
  }
  return busy.some((slot) => windowsOverlap(window, slot)) ? 'TEACHER_BUSY' : null;
};

export const WINDOW_PROBLEM_KEY: Record<WindowProblem, string> = {
  INVALID: 'courses.requestClassTimeInvalid',
  SELF_OVERLAP: 'courses.requestClassTimeOverlap',
  TEACHER_BUSY: 'courses.requestClassTeacherBusy',
};
