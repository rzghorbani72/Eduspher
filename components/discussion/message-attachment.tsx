'use client';

import { FileText } from 'lucide-react';

import type { DiscussionAttachment } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

const isImage = (mime: string | null) => Boolean(mime?.startsWith('image/'));

/** A file handed over in a chat message: images inline, anything else as a row. */
export function MessageAttachment({
  attachment,
  mine,
}: {
  attachment: DiscussionAttachment;
  mine: boolean;
}) {
  const { t } = useTranslation();
  if (!attachment.publicUrl) return null;

  if (isImage(attachment.mime_type)) {
    return (
      <a
        href={attachment.publicUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 block overflow-hidden rounded-md"
        aria-label={t('live.openAttachment')}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.publicUrl}
          alt={attachment.title}
          className="max-h-60 w-auto max-w-full object-contain"
        />
      </a>
    );
  }

  return <FileRow name={attachment.title} href={attachment.publicUrl} mine={mine} />;
}

const FILE_ROW_CLASS =
  'mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-inherit underline-offset-2 hover:text-inherit';

/** The file line of a bubble; without `href` it is the not-yet-uploaded copy, same size. */
export function FileRow({ name, href, mine }: { name: string; href?: string; mine: boolean }) {
  const className = cn(FILE_ROW_CLASS, mine ? 'bg-white/15' : 'bg-black/5 dark:bg-white/10');
  const content = (
    <>
      <FileText className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">{name}</span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={cn(className, 'hover:underline')}>
      {content}
    </a>
  ) : (
    <span className={className}>{content}</span>
  );
}
