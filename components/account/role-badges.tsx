'use client';

import { BadgeCheck } from 'lucide-react';

import { roleLabel } from '@/lib/account-labels';
import type { ViewerRole } from '@/lib/courses/staff-access';
import { useTranslation } from '@/lib/i18n/hooks';

interface RoleBadgesProps {
  roles: readonly ViewerRole[];
  verified?: boolean;
}

export function RoleBadges({ roles, verified = false }: RoleBadgesProps) {
  const { t } = useTranslation();
  if (!roles.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {roles.map((role) => (
        <span
          key={role}
          className="inline-flex w-fit items-center gap-1 rounded-full bg-(--theme-primary)/15 px-2.5 py-1 text-xs font-semibold text-(--theme-primary-ink)"
        >
          {verified ? (
            <BadgeCheck className="size-3.5 shrink-0" aria-label={t('account.verified')} />
          ) : null}
          {roleLabel(role, t)}
        </span>
      ))}
    </div>
  );
}
