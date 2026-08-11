"use client";

import { ActiveSessions } from "@/components/account/active-sessions";

export function ProfileSessionsCard() {
  return (
    <div className="rounded-xl border border-theme bg-card p-5 shadow-sm">
      <ActiveSessions />
    </div>
  );
}
