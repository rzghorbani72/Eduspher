import type { AccountIdentity } from "@/lib/api/client";

/**
 * The one rule that turns an identifier-first lookup into the next screen, so
 * "unknown account" always means signup and never a password box the visitor
 * cannot pass.
 *
 * Mirrored in AdminPanel (`lib/auth-identify.ts`) — keep both copies
 * semantically identical.
 */
export type IdentifyOutcome =
  | "register"
  | "password"
  | "otp"
  | "blocked"
  /** Real account, wrong door: a member of some academy, but not of this one. */
  | "member_elsewhere"
  /** Staff panel only: banned or deactivated panel account. */
  | "panel_blocked";

export function nextStepFor(identity: AccountIdentity): IdentifyOutcome {
  if (!identity.exists) {
    if (identity.panel_blocked) return "panel_blocked";
    return identity.member_elsewhere ? "member_elsewhere" : "register";
  }
  if (identity.can_use_password) return "password";
  if (identity.can_use_otp) return "otp";
  return "blocked";
}
