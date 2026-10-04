'use client';

import { type KeyboardEvent, useEffect, useRef } from 'react';
import { Paperclip, Send, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const CONTROL = 'h-11 w-11 shrink-0 px-0';
const MIN_H = 44;
const MAX_H = 160;
const MEDIA_ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp,application/pdf,.jpg,.jpeg,.png,.gif,.webp,.pdf';

interface DiscussionComposerProps {
  body: string;
  onBodyChange: (value: string) => void;
  file: File | null;
  onPickFile: (file: File | null) => void;
  sending: boolean;
  placeholder: string;
  attachLabel: string;
  removeLabel: string;
  sendLabel: string;
  hint: string;
  onSend: () => void;
  allowAttachments?: boolean;
  accept?: string;
}

// scrollHeight excludes the border, so add it back or the box stays 2px short and scrolls.
function fitComposer(el: HTMLTextAreaElement): void {
  el.style.height = `${MIN_H}px`;
  const needed = el.scrollHeight + el.offsetHeight - el.clientHeight;
  el.style.height = `${Math.min(Math.max(needed, MIN_H), MAX_H)}px`;
  el.style.overflowY = needed > MAX_H ? 'auto' : 'hidden';
}

export function DiscussionComposer({
  body,
  onBodyChange,
  file,
  onPickFile,
  sending,
  placeholder,
  attachLabel,
  removeLabel,
  sendLabel,
  hint,
  onSend,
  allowAttachments = true,
  accept = MEDIA_ACCEPT,
}: DiscussionComposerProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !sending && Boolean(body.trim() || file);

  useEffect(() => {
    if (fieldRef.current) fitComposer(fieldRef.current);
  }, [body]);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    if (canSend) onSend();
  };

  return (
    <div className="space-y-2">
      {allowAttachments && file ? (
        <div className="bg-surface flex h-11 items-center gap-2 rounded-xl px-3 text-xs text-(--theme-foreground)">
          <Paperclip className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => onPickFile(null)}
            aria-label={removeLabel}
            className="text-muted hover:text-(--theme-foreground)"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        {allowAttachments ? (
          <>
            <input
              ref={fileInput}
              type="file"
              hidden
              accept={accept}
              onChange={(event) => onPickFile(event.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => fileInput.current?.click()}
              disabled={sending}
              aria-label={attachLabel}
              className={CONTROL}
            >
              <Paperclip className="size-4" />
            </Button>
          </>
        ) : null}
        <Textarea
          ref={fieldRef}
          value={body}
          onChange={(event) => onBodyChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-describedby="chat-composer-hint"
          rows={1}
          maxLength={5000}
          className="max-h-40 min-h-11 flex-1 resize-none overflow-hidden rounded-xl py-2.5 leading-6"
        />
        <Button
          type="button"
          size="md"
          onClick={onSend}
          disabled={!canSend}
          aria-label={sendLabel}
          aria-keyshortcuts="Enter"
          className={CONTROL}
        >
          <Send className="size-4" />
        </Button>
      </div>
      <p id="chat-composer-hint" className="text-muted px-1 text-[11px]">
        {hint}
      </p>
    </div>
  );
}
