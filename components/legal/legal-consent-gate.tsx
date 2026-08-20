"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import Link from "@/components/ui/link";
import { useStorePath } from "@/components/providers/store-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryKeys } from "@/lib/query/keys";
import {
  LEGAL_CONSENT_REQUIRED_EVENT,
  acceptPlatformLegalDocuments,
  getLegalAcceptanceDiff,
  getLegalAcceptanceStatus,
  logout,
  type LegalDocumentDiff,
  type LegalPendingDocument,
} from "@/lib/api/client";
import { logger } from "@/lib/logging/app-logger";
import { useTranslation } from "@/lib/i18n/hooks";

const DOCUMENT_LINKS: Record<string, string> = {
  TERMS: "/terms",
  PRIVACY: "/privacy",
};

/**
 * `LegalConsentGuard` on the backend 403s every authenticated request with
 * LEGAL_CONSENT_REQUIRED once a new terms/privacy version is published. Without
 * this gate a student is locked out of the whole site with no way back in, so
 * the gate is the only in-app path to recover: read what changed, accept, reload.
 */
export function LegalConsentGate({ children }: { children?: ReactNode }) {
  const { t, language } = useTranslation();
  const buildPath = useStorePath();
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: pending, refresh: refreshPending } = useApiQuery<
    LegalPendingDocument[]
  >({
    queryKey: queryKeys.legalConsent(),
    queryFn: async (signal) =>
      (await getLegalAcceptanceStatus({ signal }))?.pending ?? [],
  });

  // Any 403 from the API means a new version landed since this page loaded.
  useEffect(() => {
    const onRequired = () => {
      void refreshPending();
    };
    window.addEventListener(LEGAL_CONSENT_REQUIRED_EVENT, onRequired);
    return () =>
      window.removeEventListener(LEGAL_CONSENT_REQUIRED_EVENT, onRequired);
  }, [refreshPending]);

  // The diff is a nice-to-have: a failure here must never block acceptance.
  const { data: diffs } = useApiQuery<LegalDocumentDiff[]>({
    queryKey: [...queryKeys.legalConsent(), "diff"],
    queryFn: async (signal) => (await getLegalAcceptanceDiff({ signal })) ?? [],
    enabled: Boolean(pending?.length),
  });

  async function handleAccept() {
    setSubmitting(true);
    setError(null);
    try {
      await acceptPlatformLegalDocuments(language);
      logger.ok("legal", "consent_accepted", {
        document_count: pending?.length ?? 0,
      });
      window.location.reload();
    } catch (err) {
      logger.error("legal", "consent_accept_failed", {
        document_count: pending?.length ?? 0,
      });
      setError(err instanceof Error ? err.message : t("common.error"));
      setSubmitting(false);
    }
  }

  async function handleDecline() {
    setSigningOut(true);
    await logout().catch(() => undefined);
    window.location.href = buildPath("/auth/login");
  }

  if (!pending?.length) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-consent-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <div className="w-full max-w-2xl space-y-5 rounded-2xl border border-theme bg-card p-6 shadow-2xl">
          <div className="space-y-1">
            <h2
              id="legal-consent-title"
              className="text-xl font-bold text-(--theme-foreground)"
            >
              {t("legal.reacceptTitle")}
            </h2>
            <p className="text-sm text-muted">{t("legal.reacceptSubtitle")}</p>
          </div>

          <ul className="max-h-[45vh] space-y-3 overflow-y-auto text-sm">
            {pending.map((doc) => {
              const diff = diffs?.find((entry) => entry.type === doc.type);
              const fullDocHref = DOCUMENT_LINKS[doc.type];
              return (
                <li
                  key={doc.type}
                  className="rounded-lg border border-theme px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-medium text-(--theme-foreground)">
                        {doc.title}
                      </span>
                      <span className="ms-2 text-muted">
                        ({t("legal.version")} {doc.version})
                      </span>
                    </div>
                    {fullDocHref ? (
                      <Link
                        href={fullDocHref}
                        className="shrink-0 text-xs text-(--theme-primary) underline"
                      >
                        {t("legal.viewFullDocument")}
                      </Link>
                    ) : null}
                  </div>
                  {diff?.diff?.length ? (
                    <ul className="mt-2 space-y-1 text-xs">
                      {diff.diff.slice(0, 12).map((line, index) => (
                        <li
                          key={`${doc.type}-${index}`}
                          className={
                            line.added
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 line-through dark:text-red-400"
                          }
                        >
                          <span aria-hidden="true">
                            {line.added ? "+ " : "− "}
                          </span>
                          {line.value}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={submitting || signingOut}
              onClick={handleDecline}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-theme text-sm font-medium text-muted transition-colors hover:bg-surface disabled:opacity-60"
            >
              {signingOut ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("legal.declineAndSignOut")}
            </button>
            <button
              type="button"
              disabled={submitting || signingOut}
              onClick={handleAccept}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-(--theme-primary) text-sm font-semibold text-(--theme-on-primary) transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("legal.acceptAndContinue")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
