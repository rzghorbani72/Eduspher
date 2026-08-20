import { ShieldCheck } from "lucide-react";

import { getTrustBadge } from "@/lib/api/trust-badge";
import { ReportAbuseDialog } from "./report-abuse-dialog";
import { EnamadSeal } from "./enamad-seal";

/**
 * Identity disclosure for a public academy site.
 *
 * This is NOT an endorsement of the academy: it states who legally operates the
 * site and that it runs on Mentoma, which is what lets a visitor know who they
 * are dealing with — and what Iran's E-Commerce Act expects a seller to publish.
 * The eNamad seal, when present, is rendered separately and never merged into
 * this, because the two mean different things and only eNamad is a state seal.
 *
 * Server component on purpose: this text should be in the HTML for crawlers and
 * for anyone reading the page without JS.
 */
export async function PlatformTrustBadge({
  slug,
  academyId,
}: {
  slug: string;
  academyId?: string | null;
}) {
  const badge = await getTrustBadge(slug);
  if (!badge) return null;

  const operator = badge.legal_entity_name ?? badge.academy_name;

  return (
    <section
      aria-label="اطلاعات هویتی آکادمی"
      className="border-t border-current/10 pt-4 text-[12px] leading-[1.9] opacity-70"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          این سایت روی بستر <strong>منتوما</strong> اجرا می‌شود.
        </span>
        <span>
          بهره‌بردار: <strong>{operator}</strong>
        </span>
        {badge.national_id_masked ? (
          <span>شناسه: {badge.national_id_masked}</span>
        ) : null}
      </div>

      {badge.contact_address || badge.contact_phone ? (
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {badge.contact_address ? <span>{badge.contact_address}</span> : null}
          {badge.contact_phone ? <span>{badge.contact_phone}</span> : null}
        </div>
      ) : null}

      {badge.enamad_seal_id && badge.enamad_code ? (
        <div className="mt-3">
          <EnamadSeal sealId={badge.enamad_seal_id} code={badge.enamad_code} />
        </div>
      ) : badge.enamad_code ? (
        <div className="mt-1">
          <span>نماد اعتماد الکترونیکی: {badge.enamad_code}</span>
        </div>
      ) : null}

      {!badge.identity_verified ? (
        <div className="mt-1 opacity-80">
          هویت بهره‌بردار این آکادمی در حال بررسی است.
        </div>
      ) : null}

      <div className="mt-1">
        <ReportAbuseDialog academyId={academyId} />
        {" · "}
        <a className="underline" href="mailto:info@mentoma.ir">
          info@mentoma.ir
        </a>
      </div>
    </section>
  );
}
