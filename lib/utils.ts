import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { env } from "@/lib/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Currency symbol mapping for localization
 * Maps currency codes to their localized symbols based on language
 */
const CURRENCY_SYMBOLS: Record<string, Record<string, string>> = {
  IRR: {
    fa: "تومان",
    ar: "تومان",
    en: "Toman",
    tr: "Toman",
  },
  USD: {
    fa: "دلار",
    ar: "دولار",
    en: "$",
    tr: "Dolar",
  },
  EUR: {
    fa: "یورو",
    ar: "يورو",
    en: "€",
    tr: "Euro",
  },
};

/**
 * Price unit mapping for different languages
 * Returns the appropriate price unit/symbol based on language
 */
const PRICE_UNITS: Record<string, string> = {
  fa: "تومان", // Farsi/Persian - Toman
  ar: "دولار", // Arabic - Dollar (or could be دينار for some countries)
  tr: "₺", // Turkish - Turkish Lira symbol
  en: "$", // English - Dollar sign
};

/**
 * Get price unit based on language
 * @param language - Language code (e.g., 'fa', 'en', 'tr', 'ar')
 * @returns Price unit string for the given language
 */
export const getPriceUnit = (language: string = "en"): string => {
  return PRICE_UNITS[language] || PRICE_UNITS["en"];
};

/**
 * Get localized currency symbol
 * @param currency - Currency code (e.g., 'IRR', 'USD')
 * @param language - Language code (e.g., 'fa', 'en')
 * @param fallbackSymbol - Fallback symbol if not found
 */
export const getLocalizedCurrencySymbol = (
  currency: string,
  language: string = "en",
  fallbackSymbol?: string,
): string => {
  const currencySymbols = CURRENCY_SYMBOLS[currency?.toUpperCase()];
  if (currencySymbols) {
    return (
      currencySymbols[language] ||
      currencySymbols["en"] ||
      fallbackSymbol ||
      currency
    );
  }
  return fallbackSymbol || currency;
};

export const formatCurrency = (
  value: number,
  options?: {
    currency?: string;
    currency_symbol?: string;
    currency_position?: "before" | "after";
    divideBy?: number;
    locale?: string;
    language?: string; // Language for localized currency symbol
  },
) => {
  const {
    currency = "USD",
    currency_symbol,
    currency_position = "after",
    divideBy = 1,
    locale = "en-US",
    language,
  } = options || {};

  const numericValue = value / divideBy;

  // Determine the symbol to use
  // Priority: 1. Localized symbol for IRR, 2. Custom symbol, 3. Language-based price unit, 4. Default
  let symbol = currency_symbol;

  // For IRR (Iranian Rial/Toman), always use localized symbol
  if (currency?.toUpperCase() === "IRR") {
    const lang =
      language ||
      (locale.startsWith("fa") ? "fa" : locale.startsWith("ar") ? "ar" : "en");
    symbol = getLocalizedCurrencySymbol("IRR", lang, currency_symbol);
  }

  // If no symbol provided and we have a language, use getPriceUnit for language-specific price unit
  if (!symbol && language) {
    symbol = getPriceUnit(language);
  }

  // If custom symbol is provided or we have a localized symbol, format manually
  if (symbol) {
    // Use standard number formatting with thousand separators (no compact notation)
    const formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, // No decimals for whole numbers
      useGrouping: true, // Enable thousand separators
    }).format(numericValue);

    return currency_position === "before"
      ? `${symbol}${formattedNumber}`
      : `${formattedNumber} ${symbol}`;
  }

  // Use Intl.NumberFormat for standard currencies with thousand separators
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true, // Enable thousand separators
  }).format(numericValue);
};

/**
 * Format currency using the academy's currency configuration.
 */
export const formatCurrencyWithAcademy = (
  value: number,
  academy?: {
    currency?: string;
    currency_symbol?: string;
    currency_position?: "before" | "after";
    country_code?: string;
    language?: string;
  } | null,
  divideBy?: number,
  language?: string,
) => {
  if (!academy) {
    return formatCurrency(value, { divideBy: divideBy || 1 });
  }

  // Every price in this system is stored in the major unit (Toman, euro), so a
  // missing currency must never silently divide the figure by 100.
  const defaultDivideBy = 1;

  // Determine locale based on country code for proper thousand separator
  // Some countries use dots (.), others use commas (,)
  // Default to en-US (commas) if not specified
  let locale = "en-US"; // Default: uses commas for thousands
  if (academy.country_code) {
    // Countries that typically use dots for thousands: DE, IT, ES, FR, etc.
    const dotSeparatorCountries = [
      "DE",
      "IT",
      "ES",
      "FR",
      "NL",
      "BE",
      "AT",
      "CH",
      "PL",
      "CZ",
      "SK",
      "HU",
      "RO",
      "BG",
      "HR",
      "SI",
    ];
    // Countries that use commas: US, UK, CA, AU, IN, IR, etc.
    const commaSeparatorCountries = [
      "US",
      "GB",
      "CA",
      "AU",
      "IN",
      "IR",
      "AE",
      "SA",
    ];

    if (dotSeparatorCountries.includes(academy.country_code.toUpperCase())) {
      locale = "de-DE"; // German locale uses dots for thousands
    } else if (
      commaSeparatorCountries.includes(academy.country_code.toUpperCase())
    ) {
      locale = "en-US"; // US locale uses commas for thousands
    } else {
      // Default to en-US for unknown countries
      locale = "en-US";
    }
  }

  // Determine language for currency symbol localization
  // Priority: 1. Explicit language param, 2. Academy language, 3. Derive from country code
  let lang = language || academy.language;
  if (!lang && academy.country_code) {
    // Map country codes to languages
    const countryToLanguage: Record<string, string> = {
      IR: "fa", // Iran -> Persian
      AF: "fa", // Afghanistan -> Persian/Dari
      TJ: "fa", // Tajikistan -> Persian/Tajik
      SA: "ar", // Saudi Arabia -> Arabic
      AE: "ar", // UAE -> Arabic
      EG: "ar", // Egypt -> Arabic
      IQ: "ar", // Iraq -> Arabic
      TR: "tr", // Turkey -> Turkish
      US: "en",
      GB: "en",
      CA: "en",
      AU: "en",
    };
    lang = countryToLanguage[academy.country_code.toUpperCase()] || "en";
  }

  return formatCurrency(value, {
    currency: academy.currency || "USD",
    currency_symbol: academy.currency_symbol,
    currency_position: academy.currency_position || "after",
    divideBy: divideBy ?? defaultDivideBy,
    locale,
    language: lang,
  });
};

const PERSIAN_DIGITS = [
  "۰",
  "۱",
  "۲",
  "۳",
  "۴",
  "۵",
  "۶",
  "۷",
  "۸",
  "۹",
] as const;

/**
 * Convert Latin digits (0-9) to Persian digits when the language is `fa`.
 * Keeps separators (commas, dots) untouched so "2,900,000" -> "۲,۹۰۰,۰۰۰".
 */
export const toPersianDigits = (
  value: string | number,
  language?: string,
): string => {
  const text = String(value);
  if (language !== "fa") return text;
  return text.replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
};

/**
 * A grouped, localised number for display: 1234 -> "۱,۲۳۴" in `fa`.
 * Grouping is done with the en-US separator so a count and a price printed next
 * to each other look the same.
 */
export const formatNumber = (value: number, language?: string): string =>
  toPersianDigits(value.toLocaleString("en-US"), language);

/** A percentage with the sign the locale actually uses: 42 -> "۴۲٪". */
export const formatPercent = (value: number, language?: string): string =>
  language === "fa" ? `${toPersianDigits(value, language)}٪` : `${value}%`;

/**
 * Phone numbers and other Latin-first identifiers keep their own direction. In
 * an RTL paragraph a bare "+98…" renders as "98…+", so the value is wrapped in
 * the Unicode isolate characters that pin it back to LTR.
 */
export const formatLtrValue = (value: string, language?: string): string =>
  language === "fa" ? `\u2066${toPersianDigits(value, language)}\u2069` : value;

const toEnglishDigits = (value: string): string =>
  value
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48));

/** E.164 or raw digits → spaced national Iranian mobile (۰۹۱۲ ۰۰۰ ۰۰۰۰). */
export const formatPhoneDisplay = (
  raw: string,
  language?: string,
): string => {
  if (!raw) return "—";

  let digits = toEnglishDigits(raw).replace(/\D/g, "");
  if (digits.startsWith("0098")) digits = digits.slice(4);
  else if (digits.startsWith("98")) digits = digits.slice(2);

  let national = digits;
  if (digits.length === 10 && digits.startsWith("9")) {
    national = `0${digits}`;
  }

  let formatted = national;
  if (national.length === 11 && national.startsWith("09")) {
    formatted = `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7)}`;
  } else {
    formatted = national.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  }

  return formatLtrValue(formatted, language ?? "fa");
};

/**
 * Dates in the account area are rendered on the server, so they must not depend
 * on the viewer's locale. `fa` gets the Persian calendar the academy actually
 * uses; everything else gets the ISO-ish medium form.
 */
export const formatDate = (
  value: string | Date | null | undefined,
  language = "fa",
  withTime = false,
): string => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const locale = language === "fa" ? "fa-IR" : language;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    ...(withTime
      ? { timeStyle: "short" as const, hourCycle: "h23" as const }
      : {}),
  }).format(date);
};

export const truncate = (value: string, length = 150) =>
  value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;

export const resolveAssetUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${env.backendOrigin}${normalized}`;
};

// Builds a subdomain URL for an academy: http://siah.localhost:5000 or https://siah.mentoma.com
export const buildAcademySubdomainUrl = (
  slug: string,
  appUrl: string,
): string => {
  try {
    const { protocol, host } = new URL(appUrl);
    return `${protocol}//${slug}.${host}`;
  } catch {
    return `http://${slug}.localhost:5000`;
  }
};

export const buildAcademyPath = (slug: string | null, path: string): string => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!slug) {
    return normalized === "//" ? "/" : normalized;
  }
  if (normalized === "/") {
    return `/${slug}`;
  }
  return `/${slug}${normalized}`;
};

/** Stable index from a cuid, so the same record always gets the same variant. */
export const hashToIndex = (value: string, buckets: number): number => {
  if (buckets <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1_000_000_007;
  }
  return hash % buckets;
};
