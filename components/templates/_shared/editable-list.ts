/**
 * Inline editing for repeated copy (feature cards, stats, table rows, chips).
 *
 * A scalar field is edited by key alone, but a repeated field lives inside an
 * array that may still be the template default — none of it is in `config` yet.
 * So the container carries the resolved array as JSON: when the manager edits
 * one cell, the preview bridge rewrites that cell inside the snapshot and saves
 * the whole array, keeping every sibling item and every non-text field intact.
 */
export function editableList(key: string, items: readonly unknown[]) {
  return {
    'data-editable-list': key,
    'data-editable-list-value': JSON.stringify(items),
  } as const;
}

/**
 * One cell inside that list, addressed by its path below the list key:
 *   editableItem('items', 2, 'title')     → items.2.title
 *   editableItem('chips', 0)              → chips.0        (list of strings)
 *   editableItem('rows', 1, 'cells', 3)   → rows.1.cells.3 (nested)
 */
export function editableItem(key: string, ...path: (string | number)[]) {
  return { 'data-editable': [key, ...path].join('.') } as const;
}
