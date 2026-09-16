'use client';

import { type KeyboardEvent, useEffect, useRef } from 'react';
import { Paperclip, Send, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const CONTROL = 'h-11 w-11 shrink-0 px-0';
const MIN_H = 44;
const MAX_H = 128;

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
}

function fitComposer(el: HTMLTextAreaElement): void {
  el.style.height = `${MIN_H}px`;
  el.style.height = `${Math.min(Math.max(el.scrollHeight, MIN_H), MAX_H)}px`;
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
      {file ? (
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
        <input
          ref={fileInput}
          type="file"
          hidden
          accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
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
          className={cn(
            'max-h-32 min-h-11 flex-1 resize-none overflow-y-auto rounded-xl py-2.5 leading-6',
          )}
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
