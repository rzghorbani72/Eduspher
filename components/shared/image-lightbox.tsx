'use client';

import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { useLocaleFormat } from '@/hooks/use-locale-digits';
import { useTranslation } from '@/lib/i18n/hooks';

interface ImageLightboxProps {
  urls: readonly string[];
  /** Which image is open; null keeps the viewer closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

/** Full-size image viewer on the native <dialog>: Esc, focus trap and top layer come free. */
export function ImageLightbox({ urls, index, onIndexChange }: ImageLightboxProps) {
  const { t } = useTranslation();
  const format = useLocaleFormat();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const total = urls.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index != null && !dialog.open) dialog.showModal();
    if (index == null && dialog.open) dialog.close();
  }, [index]);

  const step = (delta: number) => {
    if (index != null) onIndexChange((index + delta + total) % total);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={t('learning.imagePreview')}
      onClose={() => onIndexChange(null)}
      onClick={(event) => event.target === event.currentTarget && onIndexChange(null)}
      className="m-auto max-h-[92dvh] max-w-[min(92vw,56rem)] overflow-hidden rounded-2xl bg-transparent p-0 backdrop:bg-black/70"
    >
      {index != null ? (
        <div className="bg-card flex flex-col items-center gap-3 p-3">
          <button
            type="button"
            onClick={() => onIndexChange(null)}
            aria-label={t('learning.closePreview')}
            className="bg-surface-alt self-end rounded-full p-1.5"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urls[index]}
            alt=""
            className="max-h-[calc(92dvh-7rem)] w-auto max-w-full rounded-lg object-contain"
          />
          {total > 1 ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t('learning.previousImage')}
                className="bg-surface-alt rounded-full p-1.5"
              >
                <ChevronRight className="size-4 ltr:rotate-180" aria-hidden="true" />
              </button>
              <span className="text-muted text-sm">
                {t('learning.imageCounter')
                  .replace('{{current}}', format.number(index + 1))
                  .replace('{{total}}', format.number(total))}
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t('learning.nextImage')}
                className="bg-surface-alt rounded-full p-1.5"
              >
                <ChevronLeft className="size-4 ltr:rotate-180" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
