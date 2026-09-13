"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Paperclip, Send, X } from "lucide-react";
import { MessageAttachment } from "@/components/discussion/message-attachment";
import {
  findDiscussionThread,
  getDiscussionThread,
  postDiscussionMessage,
  uploadDiscussionAttachment,
  type DiscussionMessage,
  type DiscussionParent,
} from "@/lib/api/client";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn } from "@/lib/utils";

interface DiscussionThreadProps {
  /** Provide exactly one parent. */
  attemptId?: string;
  submissionId?: string;
  /** A class-wide chat, or a student alone with their teacher. */
  groupId?: string;
  engagementId?: string;
  /** One meeting of a live class. */
  sessionId?: string;
  /** Existing thread id (skips the first lazy create); optional. */
  threadId?: string;
  currentProfileId?: string;
  /** Heading shown above the messages. Defaults to "discussion". */
  title?: string;
  placeholder?: string;
}

/**
 * Reusable contextual discussion thread. Attaches to a quiz attempt OR an
 * assignment submission. No real-time, no DMs — permanent learning-record
 * history. Message bodies are rendered as plain text (React escapes them),
 * so a `<script>` payload can never execute.
 */
export function DiscussionThread({
  attemptId,
  submissionId,
  groupId,
  engagementId,
  sessionId,
  threadId,
  currentProfileId,
  title,
  placeholder,
}: DiscussionThreadProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const activeThreadId = useRef<string | undefined>(threadId);

  const parent: DiscussionParent = attemptId
    ? { attempt_id: attemptId }
    : submissionId
      ? { submission_id: submissionId }
      : groupId
        ? { tutoring_group_id: groupId }
        : sessionId
          ? { tutoring_session_id: sessionId }
          : { engagement_id: engagementId };

  const parentKey = JSON.stringify(parent);

  const load = useCallback(async () => {
    try {
      // Look the thread up by its parent: a class chat has to render before
      // anyone has written in it, and a thread only exists after the first post.
      if (activeThreadId.current) {
        const data = await getDiscussionThread(activeThreadId.current);
        setMessages(data.messages);
        return;
      }
      const found = await findDiscussionThread(JSON.parse(parentKey));
      activeThreadId.current = found.thread?.id;
      setMessages(found.messages);
    } catch {
      /* an empty chat is a valid state — leave the box ready to write in */
    }
  }, [parentKey]);

  useEffect(() => {
    activeThreadId.current = threadId;
    void load();
  }, [load, threadId]);

  const send = async () => {
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
          setError(t("live.attachmentUploadFailed"));
          return;
        }
      }
      const msg = await postDiscussionMessage(parent, text, documentId);
      activeThreadId.current = msg.thread_id;
      setBody("");
      setFile(null);
      await load();
      if (!activeThreadId.current) setMessages((prev) => [...prev, msg]);
    } catch {
      setError(t("learning.messageSendFailed"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MessageSquare className="h-4 w-4" />
        <span>{title ?? t("learning.discussion")}</span>
      </div>

      <div className="space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t("learning.noMessages")}
          </p>
        )}
        {messages.map((m) => {
          const mine = currentProfileId && m.Author?.id === currentProfileId;
          return (
            <div
              key={m.id}
              className={cn(
                "flex flex-col",
                mine ? "items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  mine ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                <p className="mb-1 text-xs opacity-70">
                  {m.Author?.display_name ?? t("account.unknown")}
                </p>
                {m.body ? (
                  <p className="whitespace-pre-wrap wrap-break-word">
                    {m.body}
                  </p>
                ) : null}
                {m.Document ? (
                  <MessageAttachment
                    attachment={m.Document}
                    mine={Boolean(mine)}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {file ? (
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs">
          <Paperclip className="size-3.5" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => setFile(null)}
            aria-label={t("live.removeAttachment")}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <input
          ref={fileInput}
          type="file"
          hidden
          accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInput.current?.click()}
          disabled={sending}
          aria-label={t("live.attachFile")}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder ?? t("learning.writeMessage")}
          aria-label={placeholder ?? t("learning.writeMessage")}
          rows={2}
          maxLength={5000}
          className="flex-1"
        />
        <Button
          onClick={send}
          disabled={sending || (!body.trim() && !file)}
          size="sm"
          aria-label={t("learning.sendMessage")}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
