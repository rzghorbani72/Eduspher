'use client';

import type { ReactNode } from 'react';

import { FileRow, MessageAttachment } from '@/components/discussion/message-attachment';
import { initialsOf } from '@/lib/learning/live-schedule';
import { formatChatTime } from '@/lib/discussion/chat-time';
import type { DiscussionMessage } from '@/lib/api/client';
import { cn, formatNumber } from '@/lib/utils';

interface DiscussionBubbleProps {
  message: DiscussionMessage;
  mine: boolean;
  showMeta: boolean;
  unknownLabel: string;
  gradeLabel: string;
  language: string;
  /** Not sent yet: the file's name, shown in the same row a sent file uses. */
  pendingFileName?: string;
  /** Replaces the sent time while the message is on its way. */
  status?: ReactNode;
}

export function DiscussionBubble({
  message,
  mine,
  showMeta,
  unknownLabel,
  gradeLabel,
  language,
  pendingFileName,
  status,
}: DiscussionBubbleProps) {
  const name = message.Author?.display_name ?? unknownLabel;
  return (
    <div className={cn('flex items-end gap-2', mine ? 'justify-end' : 'justify-start')}>
      {!mine ? (
        <span
          className={cn(
            'grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold',
            showMeta ? 'bg-(--theme-primary)/15 text-(--theme-primary)' : 'invisible',
          )}
          aria-hidden="true"
        >
          {initialsOf(name)}
        </span>
      ) : null}
      <div
        className={cn(
          'max-w-[min(85%,28rem)] px-3 py-2 text-sm',
          mine
            ? 'rounded-2xl rounded-ee-md bg-(--theme-primary) text-(--theme-on-primary)'
            : 'bg-surface rounded-2xl rounded-es-md text-(--theme-foreground)',
        )}
      >
        {showMeta && !mine ? (
          <p className="mb-0.5 text-[11px] font-semibold opacity-80">{name}</p>
        ) : null}
        {message.body ? (
          <p className="wrap-break-word whitespace-pre-wrap">{message.body}</p>
        ) : null}
        {message.Document ? <MessageAttachment attachment={message.Document} mine={mine} /> : null}
        {pendingFileName ? <FileRow name={pendingFileName} mine={mine} /> : null}
        {message.score != null ? (
          <p className="mt-1 text-xs font-bold">
            {gradeLabel.replace('{score}', formatNumber(message.score, language))}
          </p>
        ) : null}
        <p className={cn('mt-1 text-[10px] opacity-70', mine ? 'text-end' : 'text-start')}>
          {status ?? formatChatTime(message.created_at, language)}
        </p>
      </div>
    </div>
  );
}
