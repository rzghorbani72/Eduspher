'use client';

import Link from '@/components/ui/link';
import { AccountMenuDropdown } from '@/components/layout/account-menu-dropdown';
import { useAuthContext } from '@/components/providers/auth-provider';

type HeaderAccountSlotProps = {
  initialAuthenticated: boolean;
  displayName: string;
  avatarUrl: string | null;
  loginHref: string;
  loginText: string;
  accountFallbackLabel: string;
  deepTone?: boolean;
  /** Flat list for the mobile disclosure menu. */
  inline?: boolean;
  className?: string;
};

/**
 * Gallery headers are server-rendered; after login the RSC payload can still
 * say "logged out" while the browser already has a jwt. Prefer AuthContext
 * (recovered from cookies on the client) over the stale SSR flag.
 */
export function HeaderAccountSlot({
  initialAuthenticated,
  displayName,
  avatarUrl,
  loginHref,
  loginText,
  accountFallbackLabel,
  deepTone = false,
  inline = false,
  className,
}: HeaderAccountSlotProps) {
  const auth = useAuthContext();
  const signedIn = auth.isAuthenticated || initialAuthenticated;
  const label = (auth.displayName || displayName || accountFallbackLabel).trim();
  const avatar = auth.avatarUrl || avatarUrl;

  if (signedIn) {
    return (
      <AccountMenuDropdown
        displayName={label}
        avatarUrl={avatar}
        deepTone={deepTone}
        inline={inline}
        className={className}
      />
    );
  }

  return (
    <Link
      href={loginHref}
      className={className ?? 'text-[14.5px] font-medium opacity-80 hover:opacity-100'}
    >
      <span data-editable="loginText">{loginText}</span>
    </Link>
  );
}
