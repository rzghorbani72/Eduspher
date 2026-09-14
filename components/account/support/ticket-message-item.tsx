'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { formatDate } from '@/lib/utils';
import type { TicketMessageView } from '@/lib/api/client';
import { attachmentUrl } from './support-format';

export function TicketMessageItem({
  ticketId,
  message,
  authorIsMe,
  systemText,
}: {
  ticketId: string;
  message: TicketMessageView;
  authorIsMe: boolean;
  systemText: string;
}) {
  const { t, language } = useTranslation();

  if (message.kind === 'SYSTEM_EVENT') {
    return (
      <li className="text-muted flex items-center justify-center gap-1 py-1 text-center text-xs">
        {systemText}
      </li>
    );
  }

  return (
    <li
      className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
        authorIsMe
          ? 'ms-auto bg-(--theme-primary)/10 text-(--theme-foreground)'
          : 'bg-surface text-(--theme-foreground)'
      }`}
    >
      <div className="text-muted mb-1.5 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium text-(--theme-foreground)">
          {message.Author?.display_name ?? '—'}
        </span>
        <span>{formatDate(message.created_at, language, true)}</span>
        {message.kind === 'INTERNAL_NOTE' ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            {t('support.internalNote')}
          </span>
        ) : null}
      </div>
      <p className="wrap-break-word whitespace-pre-wrap">{message.body}</p>
      {message.Attachment.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {message.Attachment.map((a) => (
            <a key={a.id} href={attachmentUrl(ticketId, a.id)} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachmentUrl(ticketId, a.id)}
                alt=""
                className="border-theme size-20 rounded-xl border object-cover"
              />
            </a>
          ))}
        </div>
      ) : null}
    </li>
  );
}
