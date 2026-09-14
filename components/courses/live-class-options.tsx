"use client";

import type { PublicTutoringGroup } from "@/lib/api/server";
import {
  CLASS_SIZE_LABEL,
  type ClassSize,
  classSizeOf,
  groupAnchorId,
  sortBySize,
} from "@/lib/courses/live-course";
import { useTranslation } from "@/lib/i18n/hooks";
import { formatNumber } from "@/lib/utils";

interface LiveClassOptionsProps {
  groups: PublicTutoringGroup[];
}

interface SizeRow {
  size: ClassSize;
  count: number;
  firstGroupId: string;
}

/** One chip per class size, so ten classes still fit in one line. */
const groupBySize = (groups: PublicTutoringGroup[]): SizeRow[] => {
  const rows = new Map<ClassSize, SizeRow>();
  for (const group of sortBySize(groups)) {
    const size = classSizeOf(group.capacity);
    const row = rows.get(size);
    if (row) row.count += 1;
    else rows.set(size, { size, count: 1, firstGroupId: group.id });
  }
  return [...rows.values()];
};

export function LiveClassOptions({ groups }: LiveClassOptionsProps) {
  const { t, language } = useTranslation();

  return (
    <ul className="flex flex-wrap gap-1.5">
      {groupBySize(groups).map((row) => (
        <li key={row.size}>
          <a
            href={`#${groupAnchorId(row.firstGroupId)}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-theme bg-surface px-3 py-1 text-xs font-semibold text-(--theme-foreground) transition-colors hover:border-(--theme-primary)"
          >
            {t(CLASS_SIZE_LABEL[row.size])}
            <span className="cd-price text-muted">
              {formatNumber(row.count, language)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
