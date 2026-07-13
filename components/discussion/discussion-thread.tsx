'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import {
  getDiscussionThread,
  postDiscussionMessage,
  type DiscussionMessage,
} from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

interface DiscussionThreadProps {
  /** Provide exactly one parent. */
  attemptId?: string;
  submissionId?: string;
  /** Existing thread id (skips the first lazy create); optional. */
  threadId?: string;
  currentProfileId?: string;
}

/**
 * Reusable contextual discussion thread. Attaches to a quiz attempt OR an
 * assignment submission. No real-time, no DMs — permanent learning-record
 * history. Message bodies are rendered as plain text (React escapes them),
 * so a `<script>` payload can never execute.
 */
export function DiscussionThread({ attemptId, submissionId, threadId, currentProfileId }: DiscussionThreadProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeThreadId = useRef<string | undefined>(threadId);

  const load = useCallback(async () => {
    if (!activeThreadId.current) return;
    try {
      const data = await getDiscussionThread(activeThreadId.current);
      setMessages(data.messages);
    } catch {
      /* thread may not exist until the first message — ignore */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const send = async () => {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      const msg = await postDiscussionMessage(
        attemptId ? { attempt_id: attemptId } : { submission_id: submissionId },
        text,
      );
      activeThreadId.current = msg.thread_id;
      setBody('');
      await load();
      if (!activeThreadId.current) setMessages((prev) => [...prev, msg]);
    } catch {
      setError(t('learning.messageSendFailed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MessageSquare className="h-4 w-4" />
        <span>{t('learning.discussion')}</span>
      </div>

      <div className="space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('learning.noMessages')}</p>
        )}
        {messages.map((m) => {
          const mine = currentProfileId && m.Author?.id === currentProfileId;
          return (
            <div key={m.id} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
              <div className={cn('max-w-[85%] rounded-lg px-3 py-2 text-sm', mine ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <p className="mb-1 text-xs opacity-70">{m.Author?.display_name ?? t('account.unknown')}</p>
                <p className="whitespace-pre-wrap wrap-break-word">{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('learning.writeMessage')}
          aria-label={t('learning.writeMessage')}
          rows={2}
          maxLength={5000}
          className="flex-1"
        />
        <Button
          onClick={send}
          disabled={sending || !body.trim()}
          size="sm"
          aria-label={t('learning.sendMessage')}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
