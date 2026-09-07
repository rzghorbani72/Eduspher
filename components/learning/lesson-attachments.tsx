"use client";

import { Download } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";

export interface LessonFile {
  url: string;
  title: string;
  /** Shown in the square type badge; derived from the file name. */
  kind: string;
}

/** "…/notes.pdf" -> "PDF". Falls back to a generic label. */
export function fileKindOf(url: string, fallback: string): string {
  const name = url.split("?")[0]?.split("/").pop() ?? "";
  const extension = name.includes(".") ? name.split(".").pop() : "";
  if (!extension || extension.length > 4) return fallback;
  return extension.toUpperCase();
}

/** The lesson's downloadable files: one row each, no invented metadata. */
export function LessonAttachments({ files }: { files: LessonFile[] }) {
  const { t } = useTranslation();

  return (
    <ul className="divide-y divide-theme">
      {files.map((file) => (
        <li key={file.url} className="flex items-center gap-3 py-3.5">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-alt text-[10px] font-black text-(--theme-primary-ink)"
            aria-hidden="true"
          >
            {file.kind}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold">
              {file.title}
            </span>
            <span className="block text-[11px] text-muted">
              {file.kind}
            </span>
          </span>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("learning.downloadFile").replace(
              "{name}",
              file.title,
            )}
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-theme text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <Download className="size-4" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
