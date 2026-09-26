'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { DiscussionComposer } from '@/components/discussion/discussion-composer';
import { DiscussionMessagePane } from '@/components/discussion/discussion-message-pane';
import {
  findDiscussionThread,
  getDiscussionThread,
  postDiscussionMessage,
  subscribeDiscussionEvents,
  uploadDiscussionAttachment,
  type DiscussionMessage,
  type DiscussionParent,
} from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/hooks';

const POLL_MS = 8_000;
const SSE_BACKUP_POLL_MS = 30_000;

interface DiscussionThreadProps {
  attemptId?: string;
  submissionId?: string;
  groupId?: string;
  engagementId?: string;
  sessionId?: string;
  lessonId?: string;
  threadId?: string;
  currentProfileId?: string;
  placeholder?: string;
  emptyDescription?: string;
  /** Live ClassChat: SSE with poll fallback. Offline Q&A keeps poll only. */
  realtime?: boolean;
  composerHint?: string;
  allowAttachments?: boolean;
}

export function DiscussionThread({
  attemptId,
  submissionId,
  groupId,
  engagementId,
  sessionId,
  lessonId,
  threadId,
  currentProfileId,
  placeholder,
  emptyDescription,
  realtime = false,
  composerHint,
  allowAttachments,
}: DiscussionThreadProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveThreadId, setLiveThreadId] = useState<string | undefined>(threadId);
  const activeThreadId = useRef<string | undefined>(threadId);

  const parent: DiscussionParent = attemptId
    ? { attempt_id: attemptId }
    : submissionId
      ? { submission_id: submissionId }
      : groupId
        ? { tutoring_group_id: groupId }
        : sessionId
          ? { tutoring_session_id: sessionId }
          : lessonId
            ? { lesson_id: lessonId }
            : { engagement_id: engagementId };

  const parentKey = JSON.stringify(parent);
  const parentRef = useRef(parent);
  parentRef.current = parent;

  const load = useCallback(async () => {
    try {
      if (activeThreadId.current) {
        const data = await getDiscussionThread(activeThreadId.current);
        setMessages(data.messages);
        return;
      }
      const found = await findDiscussionThread(JSON.parse(parentKey) as DiscussionParent);
      activeThreadId.current = found.thread?.id;
      if (found.thread?.id) setLiveThreadId(found.thread.id);
      setMessages(found.messages);
    } catch {
      /* empty chat is valid until the first post */
    }
  }, [parentKey]);

  useEffect(() => {
    activeThreadId.current = threadId;
    setLiveThreadId(threadId);
    void load();
  }, [load, threadId]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      void load();
    };

    if (realtime && liveThreadId) {
      const stop = subscribeDiscussionEvents(liveThreadId, () => {
        void load();
      });
      const backup = window.setInterval(tick, SSE_BACKUP_POLL_MS);
      document.addEventListener('visibilitychange', tick);
      return () => {
        stop();
        window.clearInterval(backup);
        document.removeEventListener('visibilitychange', tick);
      };
    }

    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [load, realtime, liveThreadId]);

  const send = useCallback(async () => {
    const text = body.trim();
    if (!text && !file) return;
    setSending(true);
    setError(null);
    try {
      let documentId: string | undefined;
      if (file) {
        try {
          documentId = (await uploadDiscussionAttachment(file)).id;
        } catch {
          setError(t('live.attachmentUploadFailed'));
          return;
        }
      }
      const msg = await postDiscussionMessage(parentRef.current, text, documentId);
      activeThreadId.current = msg.thread_id;
      setLiveThreadId(msg.thread_id);
      setBody('');
      setFile(null);
      await load();
      if (!activeThreadId.current) setMessages((prev) => [...prev, msg]);
    } catch {
      setError(t('learning.messageSendFailed'));
    } finally {
      setSending(false);
    }
  }, [body, file, load, t]);

  return (
    <div className="space-y-3" data-testid={lessonId ? 'lesson-qa-thread' : 'discussion-thread'}>
      <DiscussionMessagePane
        messages={messages}
        currentProfileId={currentProfileId}
        emptyDescription={emptyDescription ?? t('learning.noMessages')}
        jumpLabel={t('live.chatJumpLatest')}
      />
      <DiscussionComposer
        body={body}
        onBodyChange={setBody}
        file={file}
        onPickFile={setFile}
        sending={sending}
        placeholder={placeholder ?? t('learning.writeMessage')}
        attachLabel={t('live.attachFile')}
        removeLabel={t('live.removeAttachment')}
        sendLabel={t('learning.sendMessage')}
        hint={composerHint ?? t('live.chatComposerHint')}
        onSend={() => void send()}
        allowAttachments={allowAttachments}
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
