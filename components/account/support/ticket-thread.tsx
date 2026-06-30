"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n/hooks";
import {
  getSupportTicket,
  rateSupportTicket,
  replySupportTicket,
  type TicketDetail,
  type TicketMessageView,
} from "@/lib/api/client";
import { AttachmentInput } from "./attachment-input";
import { attachmentUrl, formatSystemEvent, statusBadgeVariant } from "./support-format";

interface Props {
  ticketId: string;
  onBack: () => void;
}

export function TicketThread({ ticketId, onBack }: Props) {
  const { t } = useTranslation();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [body, setBody] = useState("");
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = () => getSupportTicket(ticketId).then(setTicket).catch(() => setError(t("support.error")));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const sendReply = async () => {
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await replySupportTicket(ticketId, { body, image_ids: imageIds.length ? imageIds : undefined });
      setBody("");
      setImageIds([]);
      await load();
    } catch {
      setError(t("support.error"));
    } finally {
      setBusy(false);
    }
  };

  const submitRating = async () => {
    if (!score) return;
    setBusy(true);
    try {
      await rateSupportTicket(ticketId, { score, comment: comment || undefined });
      await load();
    } catch {
      setError(t("support.error"));
    } finally {
      setBusy(false);
    }
  };

  if (!ticket) return <p className="p-6 text-sm text-muted">{t("support.loading")}</p>;

  const canRate = ticket.capabilities.isAuthor && (ticket.status === "RESOLVED" || ticket.status === "CLOSED");

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("support.backToList")}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">{ticket.subject}</h2>
        <div className="flex items-center gap-2">
          <Badge variant={statusBadgeVariant(ticket.status)}>{t(`support.statuses.${ticket.status}`)}</Badge>
          <Badge variant="outline">{t(`support.categories.${ticket.category}`)}</Badge>
        </div>
      </div>
      {ticket.AssignedTo && (
        <p className="text-xs text-muted">
          {t("support.assignedTo")}: {ticket.AssignedTo.display_name}
        </p>
      )}

      <ul className="space-y-3">
        {ticket.Message.map((m) => (
          <MessageItem key={m.id} message={m} authorIsMe={m.author_id === ticket.CreatedBy?.id} systemText={formatSystemEvent(m, t)} />
        ))}
      </ul>

      {ticket.status !== "CLOSED" && (
        <div className="space-y-2 rounded-lg border border-theme p-3">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={5000} placeholder={t("support.replyPlaceholder")} />
          <AttachmentInput imageIds={imageIds} onChange={setImageIds} />
          <Button onClick={sendReply} loading={busy} disabled={busy || !body.trim()} size="sm">
            {t("support.send")}
          </Button>
        </div>
      )}

      {canRate && !ticket.Rating && (
        <div className="space-y-2 rounded-lg border border-theme p-3">
          <p className="text-sm font-medium text-foreground">{t("support.rateTitle")}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setScore(n)} aria-label={`${n}`}>
                <Star className={`h-6 w-6 ${n <= score ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
              </button>
            ))}
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder={t("support.ratePlaceholder")} />
          <Button onClick={submitRating} loading={busy} disabled={busy || !score} size="sm">
            {t("support.submitRating")}
          </Button>
        </div>
      )}
      {ticket.Rating && <p className="text-sm text-emerald-600">{t("support.thanks")}</p>}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function MessageItem({ message, authorIsMe, systemText }: { message: TicketMessageView; authorIsMe: boolean; systemText: string }) {
  if (message.kind === "SYSTEM_EVENT") {
    return <li className="flex items-center justify-center gap-1 text-center text-xs text-muted">{systemText}</li>;
  }
  return (
    <li className={`max-w-[85%] rounded-lg p-3 text-sm ${authorIsMe ? "ml-auto bg-primary-subtle" : "bg-surface"}`}>
      <div className="mb-1 flex items-center gap-2 text-xs text-muted">
        <span className="font-medium text-foreground">{message.Author?.display_name ?? "—"}</span>
        <span>{new Date(message.created_at).toLocaleString()}</span>
        {message.kind === "INTERNAL_NOTE" && (
          <span className="rounded bg-amber-100 px-1 text-amber-700">internal</span>
        )}
      </div>
      <p className="whitespace-pre-wrap break-words text-foreground">{message.body}</p>
      {message.Attachment.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {message.Attachment.map((a) => (
            <a key={a.id} href={attachmentUrl(a.image_id)} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachmentUrl(a.image_id)} alt="" className="h-20 w-20 rounded border border-theme object-cover" />
            </a>
          ))}
        </div>
      )}
    </li>
  );
}
