import "server-only";

import { getAcademyBySlug, getCurrentAcademy } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import type { LanguageCode } from "@/lib/i18n/config";

export interface CurrencyConfig {
  currency?: string;
  currency_symbol?: string;
  currency_position?: "before" | "after";
  country_code?: string;
  language?: string;
}

interface AcademyBrief {
  name: string;
  language?: string | null;
  country_code?: string | null;
}

type SignedInUser = {
  currentAcademy?: (CurrencyConfig & { name?: string }) | null;
} | null;

/**
 * Every storefront page needs the same three things — which academy this
 * request belongs to, which language to render in, and how to print money.
 * A signed-in user's own academy wins because it already carries the currency
 * the checkout will actually charge in.
 */
export async function resolveAcademyForRequest(
  user: SignedInUser,
  slug: string | null,
): Promise<{
  academy: AcademyBrief | null;
  language: LanguageCode;
  currencyConfig: CurrencyConfig | null;
}> {
  let academy = await getCurrentAcademy().catch(() => null);
  if (!academy && slug) {
    academy = await getAcademyBySlug(slug).catch(() => null);
  }

  const language = getAcademyLanguage(
    academy?.language ?? null,
    academy?.country_code ?? null,
  );

  const currencyConfig: CurrencyConfig | null =
    user?.currentAcademy ??
    (academy
      ? {
          currency: academy.currency,
          currency_symbol: academy.currency_symbol,
          currency_position: academy.currency_position,
          country_code: academy.country_code ?? undefined,
          language: academy.language ?? undefined,
        }
      : null);

  return {
    academy: academy ? { name: academy.name } : null,
    language,
    currencyConfig,
  };
}
