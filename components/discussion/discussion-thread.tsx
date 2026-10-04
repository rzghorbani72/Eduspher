'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { DiscussionComposer } from '@/components/discussion/discussion-composer';
import { DiscussionMessagePane } from '@/components/discussion/discussion-message-pane';
import { useDiscussionOutbox } from '@/components/discussion/use-discussion-outbox';
import {
  findDiscussionThread,
  getDiscussionThread,
  postDiscussionMessage,
  subscribeDiscussionEvents,
  uploadDiscussionAttachment,
  uploadDiscussionZip,
  type DiscussionMessage,
  type DiscussionParent,
} from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/hooks';

const POLL_MS = 8_000;
const ZIP_ACCEPT = '.zip,application/zip,application/x-zip-compressed';
const SSE_BACKUP_POLL_MS = 30_000;

interface DiscussionThreadProps {
  attemptId?: string;
  submissionId?: string;
  groupId?: string;
  engagementId?: string;
  sessionId?: string;
  lessonId?: string;
  courseId?: string;
  threadId?: string;
  currentProfileId?: string;
  placeholder?: string;
  emptyDescription?: string;
  /** Live ClassChat: SSE with poll fallback. Offline Q&A keeps poll only. */
  realtime?: boolean;
  composerHint?: string;
  allowAttachments?: boolean;
  /** Teacher chat: only .zip files may be attached. */
  zipOnly?: boolean;
}

export function DiscussionThread({
  attemptId,
  submissionId,
  groupId,
  engagementId,
  sessionId,
  lessonId,
  courseId,
  threadId,
  currentProfileId,
  placeholder,
  emptyDescription,
  realtime = false,
  composerHint,
  allowAttachments,
  zipOnly = false,
}: DiscussionThreadProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [body, setBody] = useState('');
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
            : courseId
              ? { course_id: courseId }
              : { engagement_id: engagementId };

  const parentKey = JSON.stringify(parent);

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

  const pickFile = (next: File | null) => {
    if (next && zipOnly && !/\.zip$/i.test(next.name)) {
      setError(t('courses.teacherChatZipOnly'));
      return;
    }
    setError(null);
    setFile(next);
  };

  const deliver = useCallback(
    async (text: string, attached: File | null) => {
      let documentId: string | undefined;
      if (attached) {
        const upload = zipOnly ? uploadDiscussionZip : uploadDiscussionAttachment;
        documentId = (await upload(attached)).id;
      }
      const target = JSON.parse(parentKey) as DiscussionParent;
      const msg = await postDiscussionMessage(target, text, documentId);
      return msg;
    },
    [parentKey, zipOnly],
  );
  const onDelivered = useCallback(
    (msg: DiscussionMessage) => {
      activeThreadId.current = msg.thread_id;
      setLiveThreadId(msg.thread_id);
      setMessages((prev) => (prev.some((row) => row.id === msg.id) ? prev : [...prev, msg]));
      void load();
    },
    [load],
  );
  const { outbox, enqueue, retry, discard } = useDiscussionOutbox(deliver, onDelivered);

  const send = () => {
    const text = body.trim();
    if (!text && !file) return;
    enqueue(text, file);
    setBody('');
    setFile(null);
    setError(null);
  };

  return (
    <div className="space-y-3" data-testid={lessonId ? 'lesson-qa-thread' : 'discussion-thread'}>
      <DiscussionMessagePane
        messages={messages}
        outbox={outbox}
        onRetry={retry}
        onDiscard={discard}
        currentProfileId={currentProfileId}
        emptyDescription={emptyDescription ?? t('learning.noMessages')}
        jumpLabel={t('live.chatJumpLatest')}
      />
      <DiscussionComposer
        body={body}
        onBodyChange={setBody}
        file={file}
        onPickFile={pickFile}
        sending={false}
        placeholder={placeholder ?? t('learning.writeMessage')}
        attachLabel={t('live.attachFile')}
        removeLabel={t('live.removeAttachment')}
        sendLabel={t('learning.sendMessage')}
        hint={composerHint ?? t('live.chatComposerHint')}
        onSend={send}
        allowAttachments={allowAttachments}
        accept={zipOnly ? ZIP_ACCEPT : undefined}
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
