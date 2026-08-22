import { formatNumber } from "@/lib/utils";

type Translate = (key: string) => string;

/**
 * The backend speaks in enum values (`STUDENT`, `payping`). Those must never
 * reach the screen, so every raw value is mapped to a translation key here and
 * nowhere else — a value we do not know yet falls back to the raw string rather
 * than to an empty badge.
 */
const ROLE_KEY: Record<string, string> = {
  STUDENT: "account.roleStudent",
  TEACHER: "account.roleTeacher",
  MANAGER: "account.roleManager",
  ACADEMY_MANAGER: "account.roleManager",
  OWNER: "account.roleOwner",
  ADMIN: "account.roleAdmin",
  PLATFORM_OWNER: "account.roleAdmin",
  SUPPORT: "account.roleStaff",
  STAFF: "account.roleStaff",
};

const GATEWAY_KEY: Record<string, string> = {
  PAYPING: "account.gatewayPayping",
  ZARINPAL: "account.gatewayZarinpal",
  SAMAN: "account.gatewaySaman",
  SEP: "account.gatewaySaman",
  WALLET: "account.gatewayWallet",
  MANUAL: "account.gatewayManual",
  FREE: "account.gatewayFree",
};

const labelFrom = (
  map: Record<string, string>,
  value: string | null | undefined,
  t: Translate,
): string | null => {
  if (!value) return null;
  const key = map[value.trim().toUpperCase()];
  return key ? t(key) : value;
};

export const roleLabel = (role: string | null | undefined, t: Translate) =>
  labelFrom(ROLE_KEY, role, t);

export const gatewayLabel = (
  gateway: string | null | undefined,
  t: Translate,
) => labelFrom(GATEWAY_KEY, gateway, t) ?? "—";

/**
 * "8 / 10" flips to "10 / 8" inside an RTL line, so a score is always rendered
 * through the localised "x of y" sentence instead of a bare slash.
 */
export const scoreLabel = (
  score: number | null | undefined,
  maxScore: number | null | undefined,
  t: Translate,
  language: string,
): string =>
  t("account.scoreOutOf")
    .replace("{score}", score == null ? "—" : formatNumber(score, language))
    .replace(
      "{max}",
      maxScore == null ? "—" : formatNumber(maxScore, language),
    );
