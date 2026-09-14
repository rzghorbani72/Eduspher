'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';

import { AccountSection } from '@/components/account/account-section';
import { StatusPill } from '@/components/account/status-pill';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  getSupportTicket,
  rateSupportTicket,
  replySupportTicket,
  type TicketDetail,
} from '@/lib/api/client';
import { AttachmentInput } from './attachment-input';
import { formatSystemEvent, ticketStatusTone } from './support-format';
import { TicketMessageItem } from './ticket-message-item';

interface Props {
  ticketId: string;
  onBack: () => void;
}

export function TicketThread({ ticketId, onBack }: Props) {
  const { t } = useTranslation();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [body, setBody] = useState('');
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    getSupportTicket(ticketId)
      .then(setTicket)
      .catch(() => setError(t('support.error')));
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const sendReply = async () => {
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await replySupportTicket(ticketId, {
        body,
        image_ids: imageIds.length ? imageIds : undefined,
      });
      setBody('');
      setImageIds([]);
      await load();
    } catch {
      setError(t('support.error'));
    } finally {
      setBusy(false);
    }
  };

  const submitRating = async () => {
    if (!score) return;
    setBusy(true);
    try {
      await rateSupportTicket(ticketId, {
        score,
        comment: comment || undefined,
      });
      await load();
    } catch {
      setError(t('support.error'));
    } finally {
      setBusy(false);
    }
  };

  if (!ticket) {
    return (
      <AccountSection>
        <p className="text-muted text-sm">{t('support.loading')}</p>
      </AccountSection>
    );
  }

  const canRate =
    ticket.capabilities.isAuthor && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED');

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="text-muted inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-(--theme-primary-ink)"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
        {t('support.backToList')}
      </button>

      <AccountSection
        title={ticket.subject}
        description={
          ticket.AssignedTo
            ? `${t('support.assignedTo')}: ${ticket.AssignedTo.display_name}`
            : undefined
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill
              label={t(`support.statuses.${ticket.status}`)}
              tone={ticketStatusTone(ticket.status)}
            />
            <StatusPill label={t(`support.categories.${ticket.category}`)} tone="neutral" />
          </div>
        }
      >
        <ul className="space-y-3">
          {ticket.Message.map((m) => (
            <TicketMessageItem
              key={m.id}
              ticketId={ticketId}
              message={m}
              authorIsMe={m.author_id === ticket.CreatedBy?.id}
              systemText={formatSystemEvent(m, t)}
            />
          ))}
        </ul>

        {ticket.status !== 'CLOSED' ? (
          <div className="border-theme bg-surface/50 mt-5 space-y-3 rounded-2xl border p-4">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={5000}
              placeholder={t('support.replyPlaceholder')}
            />
            <AttachmentInput imageIds={imageIds} onChange={setImageIds} />
            <Button onClick={sendReply} loading={busy} disabled={busy || !body.trim()} size="sm">
              {t('support.send')}
            </Button>
          </div>
        ) : null}

        {canRate && !ticket.Rating ? (
          <div className="border-theme bg-surface/50 mt-5 space-y-3 rounded-2xl border p-4">
            <p className="text-sm font-medium text-(--theme-foreground)">
              {t('support.rateTitle')}
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setScore(n)}
                  aria-label={`${n}`}
                  className="rounded-lg p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-6 ${n <= score ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder={t('support.ratePlaceholder')}
            />
            <Button onClick={submitRating} loading={busy} disabled={busy || !score} size="sm">
              {t('support.submitRating')}
            </Button>
          </div>
        ) : null}

        {ticket.Rating ? (
          <p className="mt-4 text-sm text-emerald-600">{t('support.thanks')}</p>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      </AccountSection>
    </div>
  );
}
