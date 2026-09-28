import { ClipboardList, HelpCircle, LockKeyhole } from 'lucide-react';

import { cn } from '@/lib/utils';
import { WORK_LABEL_KEY, type CourseWork } from './course-work';

interface CourseWorkItemsProps {
  work: CourseWork[];
  /** Opens once the last lesson before it is open to this student. */
  locked: boolean;
  onOpen: (work: CourseWork) => void;
  t: (key: string) => string;
}

/** Rows after a season's (or the course's) lessons; they open a dialog, not a lesson page. */
export function CourseWorkItems({ work, locked, onOpen, t }: CourseWorkItemsProps) {
  if (work.length === 0) return null;
  return (
    <ul>
      {work.map((item) => {
        const Icon = item.type === 'quiz' ? HelpCircle : ClipboardList;
        return (
          <li key={`${item.type}-${item.parent.id}`}>
            <button
              type="button"
              disabled={locked}
              onClick={() => onOpen(item)}
              className={cn(
                'border-theme flex w-full items-center gap-3 border-b bg-(--theme-primary)/5 py-[13px] ps-[22px] pe-[22px] text-start transition-colors',
                locked ? 'cursor-not-allowed opacity-70' : 'hover:bg-(--theme-primary)/10',
              )}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-(--theme-primary)/15 text-(--theme-primary-ink)">
                {locked ? <LockKeyhole className="size-3" /> : <Icon className="size-3.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-foreground block text-[13px] leading-[1.65] font-semibold">
                  {item.title}
                </span>
                <span className="text-muted mt-1 block text-[11px]">
                  {t(WORK_LABEL_KEY[item.parent.kind][item.type])}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
