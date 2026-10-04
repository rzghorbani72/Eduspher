'use client';

import { Loader2 } from 'lucide-react';

import { DiscussionBubble } from '@/components/discussion/discussion-bubble';
import type { OutgoingMessage } from '@/components/discussion/use-discussion-outbox';
import { useTranslation } from '@/lib/i18n/hooks';

interface OutgoingBubbleProps {
  message: OutgoingMessage;
  onRetry: (localId: string) => void;
  onDiscard: (localId: string) => void;
}

/** A message on its way: the sent bubble itself, with a spinner where the time will be. */
export function OutgoingBubble({ message, onRetry, onDiscard }: OutgoingBubbleProps) {
  const { t, language } = useTranslation();
  const status =
    message.status === 'sending' ? (
      <Loader2
        className="inline size-3 animate-spin align-middle"
        role="status"
        aria-label={t(message.file ? 'live.chatUploading' : 'live.chatSending')}
      />
    ) : (
      <span className="inline-flex flex-wrap items-center gap-x-2 font-bold opacity-100">
        {t('live.chatSendFailed')}
        <button type="button" onClick={() => onRetry(message.localId)} className="underline">
          {t('live.chatRetry')}
        </button>
        <button type="button" onClick={() => onDiscard(message.localId)} className="underline">
          {t('live.chatDiscard')}
        </button>
      </span>
    );

  return (
    <div data-testid="outgoing-message" data-status={message.status}>
      <DiscussionBubble
        message={{
          id: message.localId,
          thread_id: '',
          body: message.body,
          created_at: message.created_at,
        }}
        mine
        showMeta={false}
        unknownLabel=""
        gradeLabel=""
        language={language}
        pendingFileName={message.file?.name}
        status={status}
      />
    </div>
  );
}
