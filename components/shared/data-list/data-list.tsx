import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Above this count a card grid becomes unreadable, so the list turns into a table. */
export const CARD_VIEW_MAX_ITEMS = 4;

type ColumnAlign = "start" | "center" | "end";

export interface DataColumn<T> {
  id: string;
  header: ReactNode;
  cell: (item: T) => ReactNode;
  align?: ColumnAlign;
  /** Applied to both the header cell and every body cell of this column. */
  className?: string;
}

interface DataListProps<T> {
  items: readonly T[];
  /** Omit when `alwaysCards` is set — the table is then never rendered. */
  columns?: readonly DataColumn<T>[];
  rowKey: (item: T) => string;
  /** Card renderer for short lists. Omit to always render the table. */
  renderCard?: (item: T) => ReactNode;
  /** Keep the card grid at any item count instead of falling back to the table. */
  alwaysCards?: boolean;
  cardGridClassName?: string;
  emptyState?: ReactNode;
}

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

/**
 * Mirrors the panel's list rule so both apps read the same way: a handful of
 * records are easier to scan as cards, more than that as a table.
 *
 * No "use client" — this renders inside server pages. Rows carry links in their
 * cells rather than an onRowClick handler.
 */
export function DataList<T>({
  items,
  columns = [],
  rowKey,
  renderCard,
  alwaysCards = false,
  cardGridClassName,
  emptyState,
}: DataListProps<T>) {
  if (items.length === 0) {
    return emptyState ? <>{emptyState}</> : null;
  }

  const showCards = Boolean(renderCard) && (alwaysCards || items.length <= CARD_VIEW_MAX_ITEMS);

  if (renderCard && showCards) {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", cardGridClassName)}>
        {items.map((item) => (
          <div key={rowKey(item)}>{renderCard(item)}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface">
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  "px-4 py-3 text-xs font-medium text-muted",
                  ALIGN_CLASS[column.align ?? "start"],
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={rowKey(item)} className="border-t border-theme hover:bg-surface/60">
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    "px-4 py-3 align-middle",
                    ALIGN_CLASS[column.align ?? "start"],
                    column.className,
                  )}
                >
                  {column.cell(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
