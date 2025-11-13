import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { env } from "@/lib/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);

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

