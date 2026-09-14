'use client';

import { useTransition, type MouseEvent } from 'react';
import { CreditCard, GraduationCap, LogOut, UserRound } from 'lucide-react';

import Link from '@/components/ui/link';
import { AccountAvatar } from '@/components/layout/account-avatar';
import { useStorePath } from '@/components/providers/store-provider';
import { useAuthContext } from '@/components/providers/auth-provider';
import { signOut } from '@/lib/sign-out';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

type AccountMenuDropdownProps = {
  displayName: string;
  avatarUrl: string | null;
  /** Matches the header tone so the panel stays readable on deep bars. */
  deepTone?: boolean;
  /**
   * Flat list for an already-open mobile drawer — avoids nesting another
   * disclosure inside the hamburger menu.
   */
  inline?: boolean;
  className?: string;
};

function closeDetails(event: MouseEvent<HTMLElement>) {
  const details = event.currentTarget.closest('details');
  if (details) details.open = false;
}

/** Profile chip + dropdown: my courses, payments, profile, logout. */
export function AccountMenuDropdown({
  displayName,
  avatarUrl,
  deepTone = false,
  inline = false,
  className,
}: AccountMenuDropdownProps) {
  const { t } = useTranslation();
  const buildPath = useStorePath();
  const { setAuthenticated } = useAuthContext();
  const [pending, startTransition] = useTransition();

  const label = displayName.trim() || t('account.profile');

  const handleLogout = () => {
    startTransition(async () => {
      setAuthenticated(false);
      await signOut(buildPath('/'));
    });
  };

  const items = [
    {
      href: buildPath('/account/courses'),
      label: t('account.myCourses'),
      icon: GraduationCap,
    },
    {
      href: buildPath('/account/transactions'),
      label: t('account.transactions'),
      icon: CreditCard,
    },
    {
      href: buildPath('/account/profile'),
      label: t('account.profile'),
      icon: UserRound,
    },
  ] as const;

  const itemClass = cn(
    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    deepTone
      ? 'text-(--theme-on-deep) hover:bg-white hover:text-zinc-900'
      : 'text-(--theme-foreground) hover:bg-(--theme-surface-alt)',
  );

  const menu = (
    <>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link href={item.href} onClick={closeDetails} className={itemClass}>
                <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className={cn('my-1.5 h-px', deepTone ? 'bg-current/15' : 'bg-theme')} aria-hidden />
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-sm font-medium transition-colors disabled:opacity-60',
          deepTone
            ? 'text-red-300 hover:bg-white hover:text-red-700'
            : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40',
        )}
      >
        <LogOut className="size-4 shrink-0" aria-hidden />
        {pending ? t('common.loading') : t('auth.logout')}
      </button>
    </>
  );

  if (inline) {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="mb-1 flex items-center gap-2 px-3 py-2">
          <AccountAvatar name={label} avatarUrl={avatarUrl} size={28} />
          <span className="truncate text-sm font-semibold">{label}</span>
        </div>
        {menu}
      </div>
    );
  }

  return (
    <details className={cn('relative', className)}>
      <summary
        className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-current/20 py-1 ps-1 pe-3 text-[14.5px] font-medium hover:opacity-90 [&::-webkit-details-marker]:hidden"
        aria-label={label}
      >
        <AccountAvatar name={label} avatarUrl={avatarUrl} />
        <span className="max-w-40 truncate">{label}</span>
      </summary>

      <div
        className={cn(
          'absolute end-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-xl border p-1.5',
          deepTone
            ? 'border-current/18 bg-(--theme-deep) text-(--theme-on-deep)'
            : 'border-theme bg-(--theme-surface) text-(--theme-foreground)',
        )}
      >
        {menu}
      </div>
    </details>
  );
}
