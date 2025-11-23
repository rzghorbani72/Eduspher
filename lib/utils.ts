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
  }
) => {
  const {
    currency = "USD",
    currency_symbol,
    currency_position = "after",
    divideBy = 1,
  } = options || {};

  const numericValue = value / divideBy;

  // If custom symbol is provided, format manually
  if (currency_symbol) {
    const formattedNumber = new Intl.NumberFormat("en-US", {
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericValue);

    return currency_position === "before"
      ? `${currency_symbol}${formattedNumber}`
      : `${formattedNumber} ${currency_symbol}`;
  }

  // Use Intl.NumberFormat for standard currencies
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    notation: "compact",
    maximumFractionDigits: 2,
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
  } | null,
  divideBy?: number
) => {
  if (!school) {
    return formatCurrency(value, { divideBy: divideBy || 1 });
  }

  // For Toman (IRR), typically no division needed as it's already in the base unit
  const defaultDivideBy = school.currency === "IRR" ? 1 : 100;

  return formatCurrency(value, {
    currency: school.currency || "USD",
    currency_symbol: school.currency_symbol,
    currency_position: school.currency_position || "after",
    divideBy: divideBy ?? defaultDivideBy,
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

