'use client';

import { Download } from 'lucide-react';

import { useTranslation } from '@/lib/i18n/hooks';

export interface LessonFile {
  url: string;
  title: string;
  /** Shown in the square type badge; derived from the file name. */
  kind: string;
}

/** "…/notes.pdf" -> "PDF". Falls back to a generic label. */
export function fileKindOf(url: string, fallback: string): string {
  const name = url.split('?')[0]?.split('/').pop() ?? '';
  const extension = name.includes('.') ? name.split('.').pop() : '';
  if (!extension || extension.length > 4) return fallback;
  return extension.toUpperCase();
}

/** The lesson's downloadable files: one row each, no invented metadata. */
export function LessonAttachments({ files }: { files: LessonFile[] }) {
  const { t } = useTranslation();

  return (
    <ul className="divide-theme divide-y">
      {files.map((file) => (
        <li key={file.url} className="flex items-center gap-3 py-3.5">
          <span
            className="bg-surface-alt grid size-9 shrink-0 place-items-center rounded-lg text-[10px] font-black text-(--theme-primary-ink)"
            aria-hidden="true"
          >
            {file.kind}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold">{file.title}</span>
            <span className="text-muted block text-[11px]">{file.kind}</span>
          </span>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('learning.downloadFile').replace('{name}', file.title)}
            className="border-theme text-muted hover:bg-surface hover:text-foreground grid size-9 shrink-0 place-items-center rounded-lg border transition-colors"
          >
            <Download className="size-4" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
