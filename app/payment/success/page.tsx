import { getAcademyContext } from "@/lib/store-context";

import { getCurrentUser, getPaymentSummary } from "@/lib/api/server";
import { resolveAcademyForRequest } from "@/lib/courses/academy-context";
import { t } from "@/lib/i18n/server-translations";
import {
  buildAcademyPath,
  formatCurrencyWithAcademy,
  formatDate,
  toPersianDigits,
} from "@/lib/utils";
import { PaymentResult, type PaymentResultRow } from "@/components/payment/payment-result";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * Where the bank sends a buyer whose payment was verified. The payment is
 * already PAID by then — this page only reports it, it never grants access.
 */
export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const paymentId = first(params.payment_id) ?? first(params.paymentId);
  const bankRef = first(params.RefNum) ?? first(params.reference) ?? null;

  const storeContext = await getAcademyContext();
  const buildPath = (path: string) =>
    buildAcademyPath(storeContext.isSubdomain ? null : storeContext.slug, path);

  const [user, payment] = await Promise.all([
    getCurrentUser().catch(() => null),
    paymentId ? getPaymentSummary(paymentId) : Promise.resolve(null),
  ]);
  const { language, currencyConfig } = await resolveAcademyForRequest(
    user,
    storeContext.slug,
  );
  const translate = (key: string) => t(key, language);

  const rows: PaymentResultRow[] = [];
  const reference = payment?.gateway_id ?? bankRef;
  if (reference) {
    rows.push({ label: translate("payment.referenceId"), value: reference });
  }
  const paidAt = payment?.paid_at ?? payment?.created_at;
  if (paidAt) {
    rows.push({
      label: translate("payment.paymentDate"),
      value: formatDate(paidAt, language, true),
    });
  }

  return (
    <PaymentResult
      variant="success"
      title={translate("payment.successful")}
      message={translate("payment.processedSuccessfully")}
      itemTitle={payment?.Course?.title ?? null}
      amountLabel={
        payment
          ? toPersianDigits(
              formatCurrencyWithAcademy(
                payment.amount,
                currencyConfig,
                undefined,
                language,
              ),
              language,
            )
          : null
      }
      rows={rows}
      actions={[
        { href: buildPath("/account/courses"), label: translate("payment.goToMyCourses") },
        {
          href: buildPath("/courses"),
          label: translate("payment.browseMoreCourses"),
          variant: "secondary",
        },
      ]}
    />
  );
}
