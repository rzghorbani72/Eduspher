import { getAcademyContext } from "@/lib/store-context";

import { getCurrentUser } from "@/lib/api/server";
import { resolveAcademyForRequest } from "@/lib/courses/academy-context";
import { t } from "@/lib/i18n/server-translations";
import { buildAcademyPath } from "@/lib/utils";
import { PaymentResult } from "@/components/payment/payment-result";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * Every way a payment can end without money moving lands here. The reason is
 * translated into one plain sentence — the bank's own codes mean nothing to a
 * student, and a failed payment must never look like a broken page.
 */
const REASON_KEY: Record<string, string> = {
  cancelled: "payment.reasonCancelled",
  payment_failed: "payment.reasonDeclined",
  verification_failed: "payment.reasonNotVerified",
  invalid_callback: "payment.reasonInvalidCallback",
  server_error: "payment.reasonServerError",
};

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const reason = first(params.reason) ?? "payment_failed";

  const storeContext = await getAcademyContext();
  const buildPath = (path: string) =>
    buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  const user = await getCurrentUser().catch(() => null);
  const { language } = await resolveAcademyForRequest(user, storeContext.slug);
  const translate = (key: string) => t(key, language);

  return (
    <PaymentResult
      variant="failure"
      title={translate("payment.failure")}
      message={translate(REASON_KEY[reason] ?? "payment.reasonDeclined")}
      rows={[]}
      actions={[
        { href: buildPath("/courses"), label: translate("payment.tryAgain") },
        {
          href: buildPath("/account/support"),
          label: translate("payment.contactSupport"),
          variant: "secondary",
        },
      ]}
      footer={translate("payment.noMoneyTaken")}
    />
  );
}
