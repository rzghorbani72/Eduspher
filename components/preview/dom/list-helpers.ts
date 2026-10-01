import { setAtPath } from './toolbar-and-paths';

/**
 * A repeated field's key is a path — `items.2.title`, `chips.0`, `rows.1.cells.3`.
 * The whole array (still the template default until now) rides on its container
 * as JSON, so one edited cell is saved as the complete array and every sibling
 * item and non-text field survives. The snapshot is written back so consecutive
 * edits compound before the next rebuild.
 */
export function buildListUpdate(
  el: HTMLElement,
  fieldKey: string,
  value: string | number,
): { listKey: string; items: unknown[] } | null {
  const [listKey, ...path] = fieldKey.split('.');
  if (path.length === 0) return null;

  const container = el.closest<HTMLElement>(`[data-editable-list="${listKey}"]`);
  const snapshot = container?.dataset.editableListValue;
  if (!snapshot) return null;

  let items: unknown;
  try {
    items = JSON.parse(snapshot);
  } catch {
    return null;
  }
  if (!Array.isArray(items)) return null;

  const next = setAtPath(items, path, value);
  if (!Array.isArray(next)) return null;

  container!.dataset.editableListValue = JSON.stringify(next);
  return { listKey, items: next };
}

/**
 * A progress bar has no text to type into, so it is set by clicking the track:
 * the click position along it becomes the percentage. The fill grows from the
 * inline start, so in RTL the ratio is measured from the right edge.
 */
export function rangeRatioFromClick(track: HTMLElement, clientX: number): number {
  const rect = track.getBoundingClientRect();
  if (rect.width === 0) return 0;
  const rtl = getComputedStyle(track).direction === 'rtl';
  const ratio = rtl ? (rect.right - clientX) / rect.width : (clientX - rect.left) / rect.width;
  return Math.round(Math.min(1, Math.max(0, ratio)) * 100);
}
