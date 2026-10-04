'use client';

import { ChevronDown, MessageSquare } from 'lucide-react';

import { DiscussionBubble } from '@/components/discussion/discussion-bubble';
import { OutgoingBubble } from '@/components/discussion/outgoing-bubble';
import type { OutgoingMessage } from '@/components/discussion/use-discussion-outbox';
import { EmptyState } from '@/components/ui/empty-state';
import { chatDayKey, formatChatDay, isSameAuthorBurst } from '@/lib/discussion/chat-time';
import type { DiscussionMessage } from '@/lib/api/client';
import { useStickToBottom } from '@/hooks/use-stick-to-bottom';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

interface DiscussionMessagePaneProps {
  messages: DiscussionMessage[];
  outbox: OutgoingMessage[];
  onRetry: (localId: string) => void;
  onDiscard: (localId: string) => void;
  currentProfileId?: string;
  emptyDescription: string;
  jumpLabel: string;
}

export function DiscussionMessagePane({
  messages,
  outbox,
  onRetry,
  onDiscard,
  currentProfileId,
  emptyDescription,
  jumpLabel,
}: DiscussionMessagePaneProps) {
  const { t, language } = useTranslation();
  const { ref, onScroll, away, jumpToLatest } = useStickToBottom(messages.length + outbox.length);

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={onScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className={cn(
          'max-h-[700px] min-h-40 space-y-2 overflow-y-auto overscroll-contain pe-1',
          away && 'pb-12',
        )}
      >
        {messages.length === 0 && outbox.length === 0 ? (
          <EmptyState
            compact
            icon={<MessageSquare className="size-6" aria-hidden="true" />}
            title={t('learning.noMessages')}
            description={emptyDescription}
            className="py-12"
          />
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1];
            const newDay =
              !previous || chatDayKey(previous.created_at) !== chatDayKey(message.created_at);
            const mine = Boolean(currentProfileId && message.Author?.id === currentProfileId);
            return (
              <div key={message.id} className="space-y-2">
                {newDay ? (
                  <p className="text-muted py-2 text-center text-[11px] font-medium">
                    {formatChatDay(message.created_at, language)}
                  </p>
                ) : null}
                <DiscussionBubble
                  message={message}
                  mine={mine}
                  showMeta={!isSameAuthorBurst(previous, message)}
                  unknownLabel={t('account.unknown')}
                  gradeLabel={t('courses.teacherChatGrade')}
                  language={language}
                />
              </div>
            );
          })
        )}
        {outbox.map((item) => (
          <OutgoingBubble
            key={item.localId}
            message={item}
            onRetry={onRetry}
            onDiscard={onDiscard}
          />
        ))}
      </div>
      {away ? (
        <button
          type="button"
          onClick={jumpToLatest}
          className="absolute inset-x-0 bottom-2 z-10 mx-auto inline-flex w-fit items-center gap-1 rounded-full bg-(--theme-primary) px-3 py-1.5 text-xs font-semibold text-(--theme-on-primary) shadow-md"
        >
          <ChevronDown className="size-3.5" aria-hidden="true" />
          {jumpLabel}
        </button>
      ) : null}
    </div>
  );
}
