"use client";

import { useEffect, useState } from "react";
import { ChevronRight, LifeBuoy, MessageSquare, Plus } from "lucide-react";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { AccountSection } from "@/components/account/account-section";
import { StatusPill } from "@/components/account/status-pill";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useLocaleFormat } from "@/hooks/use-locale-digits";
import { useTranslation } from "@/lib/i18n/hooks";
import { listMySupportTickets, type TicketListItem } from "@/lib/api/client";
import { NewTicketForm } from "./new-ticket-form";
import { TicketThread } from "./ticket-thread";
import { ticketStatusTone } from "./support-format";

type View = { mode: "list" } | { mode: "new" } | { mode: "thread"; id: string };

export function SupportCenter() {
  const { t } = useTranslation();
  const format = useLocaleFormat();
  const [view, setView] = useState<View>({ mode: "list" });
  const [tickets, setTickets] = useState<TicketListItem[] | null>(null);

  const load = () =>
    listMySupportTickets()
      .then((r) => setTickets(r.items))
      .catch(() => setTickets([]));

  useEffect(() => {
    if (view.mode === "list") void load();
  }, [view.mode]);

  if (view.mode === "new") {
    return (
      <div className="space-y-6">
        <AccountPageHeader
          title={t("support.newTicket")}
          description={t("support.subtitle")}
          icon={LifeBuoy}
          actions={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setView({ mode: "list" })}
            >
              {t("support.cancel")}
            </Button>
          }
        />
        <AccountSection>
          <NewTicketForm
            onCreated={(ticket) => setView({ mode: "thread", id: ticket.id })}
            onCancel={() => setView({ mode: "list" })}
          />
        </AccountSection>
      </div>
    );
  }

  if (view.mode === "thread") {
    return (
      <TicketThread
        ticketId={view.id}
        onBack={() => setView({ mode: "list" })}
      />
    );
  }

  const hasTickets = tickets !== null && tickets.length > 0;
  const isEmpty = tickets !== null && tickets.length === 0;

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={t("support.title")}
        description={t("support.subtitle")}
        icon={LifeBuoy}
        actions={
          hasTickets ? (
            <Button size="sm" onClick={() => setView({ mode: "new" })}>
              <Plus className="size-4" />
              {t("support.newTicket")}
            </Button>
          ) : null
        }
      />

      {tickets === null ? (
        <AccountSection>
          <div className="space-y-3 py-2" aria-busy="true" aria-live="polite">
            <p className="text-sm text-muted">{t("support.loading")}</p>
            <div className="h-16 animate-pulse rounded-xl bg-surface" />
            <div className="h-16 animate-pulse rounded-xl bg-surface" />
          </div>
        </AccountSection>
      ) : null}

      {isEmpty ? (
        <EmptyState
          icon={<LifeBuoy className="size-7" aria-hidden="true" />}
          title={t("support.empty")}
          description={t("support.emptyDescription")}
          action={
            <Button onClick={() => setView({ mode: "new" })}>
              <Plus className="size-4" />
              {t("support.newTicket")}
            </Button>
          }
        />
      ) : null}

      {hasTickets ? (
        <AccountSection title={t("support.myTickets")}>
          <ul className="divide-y divide-(--theme-border)">
            {tickets.map((ti) => (
              <li key={ti.id}>
                <button
                  type="button"
                  onClick={() => setView({ mode: "thread", id: ti.id })}
                  className="group flex w-full items-center justify-between gap-3 py-3.5 text-start transition-colors first:pt-0 last:pb-0 hover:bg-transparent"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate font-medium text-(--theme-foreground) transition-colors group-hover:text-(--theme-primary-ink)">
                      {ti.subject}
                    </p>
                    <p className="text-xs text-muted">
                      {ti.AssignedTo
                        ? `${t("support.assignedTo")}: ${ti.AssignedTo.display_name}`
                        : t(`support.categories.${ti.category}`)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <MessageSquare className="size-3.5" aria-hidden="true" />
                      {format.number(ti._count.Message)}
                    </span>
                    <StatusPill
                      label={t(`support.statuses.${ti.status}`)}
                      tone={ticketStatusTone(ti.status)}
                    />
                    <ChevronRight
                      className="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100 rtl:rotate-180"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </AccountSection>
      ) : null}
    </div>
  );
}
