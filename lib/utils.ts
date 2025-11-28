import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { env } from "@/lib/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (
  value: number,
  options?: {
    currency?: string;
    currency_symbol?: string;
    currency_position?: "before" | "after";
    divideBy?: number;
    locale?: string;
  }
) => {
  const {
    currency = "USD",
    currency_symbol,
    currency_position = "after",
    divideBy = 1,
    locale = "en-US",
  } = options || {};

  const numericValue = value / divideBy;

  // If custom symbol is provided, format manually with thousand separators
  if (currency_symbol) {
    // Use standard number formatting with thousand separators (no compact notation)
    const formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, // No decimals for whole numbers
      useGrouping: true, // Enable thousand separators
    }).format(numericValue);

    return currency_position === "before"
      ? `${currency_symbol}${formattedNumber}`
      : `${formattedNumber} ${currency_symbol}`;
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
 * Format currency using school's currency configuration
 * @param value - Amount in smallest currency unit
 * @param school - School object with currency configuration
 * @param divideBy - Divisor to convert from smallest unit (default: 1 for tomans, 100 for cents)
 * @returns Formatted currency string
 */
export const formatCurrencyWithSchool = (
  value: number,
  school?: {
    currency?: string;
    currency_symbol?: string;
    currency_position?: "before" | "after";
    country_code?: string;
  } | null,
  divideBy?: number
) => {
  if (!school) {
    return formatCurrency(value, { divideBy: divideBy || 1 });
  }

  // For Toman (IRR), typically no division needed as it's already in the base unit
  const defaultDivideBy = school.currency === "IRR" ? 1 : 100;

  // Determine locale based on country code for proper thousand separator
  // Some countries use dots (.), others use commas (,)
  // Default to en-US (commas) if not specified
  let locale = "en-US"; // Default: uses commas for thousands
  if (school.country_code) {
    // Countries that typically use dots for thousands: DE, IT, ES, FR, etc.
    const dotSeparatorCountries = ["DE", "IT", "ES", "FR", "NL", "BE", "AT", "CH", "PL", "CZ", "SK", "HU", "RO", "BG", "HR", "SI"];
    // Countries that use commas: US, UK, CA, AU, IN, IR, etc.
    const commaSeparatorCountries = ["US", "GB", "CA", "AU", "IN", "IR", "AE", "SA"];
    
    if (dotSeparatorCountries.includes(school.country_code.toUpperCase())) {
      locale = "de-DE"; // German locale uses dots for thousands
    } else if (commaSeparatorCountries.includes(school.country_code.toUpperCase())) {
      locale = "en-US"; // US locale uses commas for thousands
    } else {
      // Default to en-US for unknown countries
      locale = "en-US";
    }
  }

  return formatCurrency(value, {
    currency: school.currency || "USD",
    currency_symbol: school.currency_symbol,
    currency_position: school.currency_position || "after",
    divideBy: divideBy ?? defaultDivideBy,
    locale,
  });
};

export const truncate = (value: string, length = 150) =>
  value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;

export const buildOgImageUrl = (title: string, description?: string) =>
  `/api/og?title=${encodeURIComponent(title)}${
    description ? `&description=${encodeURIComponent(description)}` : ""
  }`;

export const resolveAssetUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${env.backendOrigin}${normalized}`;
};

export const buildSchoolPath = (slug: string | null, path: string): string => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!slug) {
    return normalized === "//" ? "/" : normalized;
  }
  if (normalized === "/") {
    return `/${slug}`;
  }
  return `/${slug}${normalized}`;
};

