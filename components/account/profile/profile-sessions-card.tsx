'use client';

import { AccountSection } from '@/components/account/account-section';
import { ActiveSessions } from '@/components/account/active-sessions';

export function ProfileSessionsCard() {
  return (
    <AccountSection>
      <ActiveSessions />
    </AccountSection>
  );
}
