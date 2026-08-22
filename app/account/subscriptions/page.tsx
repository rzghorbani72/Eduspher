import { Repeat } from "lucide-react";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { StatusPill, toneForStatus } from "@/components/account/status-pill";
import { SubscribeButton } from "@/components/account/subscriptions/subscribe-button";
import { DataPanel } from "@/components/shared/data-list/data-panel";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getAcademyPlansPublicByKind,
  getMySubscriptions,
} from "@/lib/api/account-server";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";
import {
  buildAcademyPath,
  formatCurrencyWithAcademy,
  formatDate,
  toPersianDigits,
} from "@/lib/utils";

const STATUS_KEY: Record<string, string> = {
  ACTIVE: "account.statusActive",
  EXPIRED: "account.statusExpired",
  CANCELLED: "account.statusCancelled",
  PENDING: "account.statusPending",
};

export default async function AccountSubscriptionsPage() {
  const academyContext = await getAcademyContext();

  const [subscriptions, plans, academy] = await Promise.all([
    getMySubscriptions(),
    getAcademyPlansPublicByKind("SUBSCRIPTION"),
    academyContext.slug
      ? getAcademyBySlug(academyContext.slug).catch(() => null)
      : null,
  ]);

  const loginHref = buildAcademyPath(
    academyContext.isSubdomain ? null : academyContext.slug,
    "/auth/login?redirect=/account/subscriptions",
  );
  const language = getAcademyLanguage(
    academy?.language ?? null,
    academy?.country_code ?? null,
  );
  const translate = (key: string) => t(key, language);
  const money = (value: number) =>
    toPersianDigits(formatCurrencyWithAcademy(value, academy), language);

  const activeIds = new Set(
    subscriptions
      .filter((row) => row.status === "ACTIVE")
      .map((row) => row.Plan.id),
  );

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={translate("account.subscriptions")}
        description={translate("account.subscriptionsDescription")}
        icon={Repeat}
      />

      <DataPanel title={translate("account.activeSubscription")}>
        {subscriptions.length === 0 ? (
          <EmptyState
            compact
            icon={<Repeat className="size-7" aria-hidden="true" />}
            title={translate("account.noSubscription")}
          />
        ) : (
          <ul className="space-y-3">
            {subscriptions.map((subscription) => (
              <li
                key={subscription.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-theme p-4"
              >
                <div>
                  <p className="font-medium text-(--theme-foreground)">
                    {subscription.Plan.name}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {subscription.expires_at
                      ? `${translate("account.expires")}: ${formatDate(subscription.expires_at, language)}`
                      : translate("courses.lifetimeAccess")}
                  </p>
                </div>
                <StatusPill
                  label={
                    STATUS_KEY[subscription.status]
                      ? translate(STATUS_KEY[subscription.status])
                      : subscription.status
                  }
                  tone={toneForStatus(subscription.status)}
                />
              </li>
            ))}
          </ul>
        )}
      </DataPanel>

      <DataPanel title={translate("account.availablePlans")}>
        {plans.length === 0 ? (
          <EmptyState compact title={translate("account.noPlans")} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col gap-3 rounded-xl border border-theme p-4"
              >
                <p className="font-semibold text-(--theme-foreground)">
                  {plan.name}
                </p>
                {plan.description ? (
                  <p className="text-sm text-muted">{plan.description}</p>
                ) : null}
                <p className="text-lg font-bold text-(--theme-primary-ink)">
                  {money(plan.price)}
                </p>
                <div className="mt-auto">
                  {activeIds.has(plan.id) ? (
                    <StatusPill
                      label={translate("account.statusActive")}
                      tone="success"
                    />
                  ) : (
                    <SubscribeButton
                      planId={plan.id}
                      amount={plan.price}
                      loginHref={loginHref}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DataPanel>
    </div>
  );
}
