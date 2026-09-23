'use client';

import { Check, Copy, ExternalLink, Link2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';

interface MeetLinkBarProps {
  meetingUrl: string;
  /** When true, remind that Mentoma chat stays on this page. */
  showChatHubHint?: boolean;
}

/**
 * Copy / open Meet under the live stage so students can pop out video
 * while keeping Mentoma as the chat hub.
 */
export function MeetLinkBar({ meetingUrl, showChatHubHint = true }: MeetLinkBarProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      toast.success(t('live.linkCopied'), { toastId: 'meet-link-copied', autoClose: 2000 });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('live.linkCopyFailed'), { toastId: 'meet-link-copy-failed' });
    }
  };

  return (
    <div
      className="border-theme bg-card space-y-2 rounded-2xl border p-3"
      data-testid="meet-link-bar"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted flex min-w-0 flex-1 items-center gap-2 text-xs">
          <Link2 className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate font-medium text-(--theme-foreground)">
            {t('live.meetLinkLabel')}
          </span>
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
          {copied ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          {t('live.copyMeetLink')}
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
            {t('live.openVideoNewTab')}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </Button>
      </div>
      {showChatHubHint ? (
        <p className="text-muted text-[11px] leading-relaxed">{t('live.chatHubHint')}</p>
      ) : null}
    </div>
  );
}
