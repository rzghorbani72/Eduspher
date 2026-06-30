"use client";

import { useEffect, useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useTranslation } from "@/lib/i18n/hooks";
import { listMySupportTickets, type TicketListItem } from "@/lib/api/client";
import { NewTicketForm } from "./new-ticket-form";
import { TicketThread } from "./ticket-thread";
import { statusBadgeVariant } from "./support-format";

type View = { mode: "list" } | { mode: "new" } | { mode: "thread"; id: string };

export function SupportCenter() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>({ mode: "list" });
  const [tickets, setTickets] = useState<TicketListItem[] | null>(null);

  const load = () => listMySupportTickets().then((r) => setTickets(r.items)).catch(() => setTickets([]));
  useEffect(() => {
    if (view.mode === "list") load();
  }, [view.mode]);

  if (view.mode === "new") {
    return (
      <NewTicketForm
        onCreated={(ticket) => setView({ mode: "thread", id: ticket.id })}
        onCancel={() => setView({ mode: "list" })}
      />
    );
  }

  if (view.mode === "thread") {
    return <TicketThread ticketId={view.id} onBack={() => setView({ mode: "list" })} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t("support.title")}</h2>
          <p className="text-sm text-muted">{t("support.subtitle")}</p>
        </div>
        <Button size="sm" onClick={() => setView({ mode: "new" })}>
          <Plus className="h-4 w-4" /> {t("support.newTicket")}
        </Button>
      </div>

      {tickets === null && <p className="text-sm text-muted">{t("support.loading")}</p>}

      {tickets !== null && tickets.length === 0 && (
        <EmptyState
          title={t("support.empty")}
          action={<Button onClick={() => setView({ mode: "new" })}>{t("support.newTicket")}</Button>}
        />
      )}

      <ul className="space-y-2">
        {tickets?.map((ti) => (
          <li key={ti.id}>
            <button
              type="button"
              onClick={() => setView({ mode: "thread", id: ti.id })}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-theme p-3 text-start hover:border-primary"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{ti.subject}</p>
                <p className="text-xs text-muted">
                  {ti.AssignedTo ? `${t("support.assignedTo")}: ${ti.AssignedTo.display_name}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-muted">
                  <MessageSquare className="h-3 w-3" />
                  {ti._count.Message}
                </span>
                <Badge variant={statusBadgeVariant(ti.status)}>{t(`support.statuses.${ti.status}`)}</Badge>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
