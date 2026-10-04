'use client';

import { useState, useTransition } from 'react';

import { AccountNavGroup } from '@/components/account/account-nav-group';
import { AccountNavItem } from '@/components/account/account-nav-item';
import { visibleAccountNavSections } from '@/components/account/account-nav-sections';
import { usePlatformFeatures } from '@/components/providers/platform-features-provider';
import { AnimatedHoverIcon } from '@/components/account/animated-hover-icon';
import { AppImage } from '@/components/ui/app-image';
import { HouseIcon } from '@animateicons/react/lucide/house-icon';
import { LogOutIcon } from '@animateicons/react/lucide/log-out-icon';
import { BadgeCheck } from 'lucide-react';

import Link from '@/components/ui/link';
import { useLocaleFormat } from '@/hooks/use-locale-digits';
import { RoleBadges } from '@/components/account/role-badges';
import { roleLabel } from '@/lib/account-labels';
import type { ViewerRole } from '@/lib/courses/staff-access';
import { useTranslation } from '@/lib/i18n/hooks';
import { signOut } from '@/lib/sign-out';

interface AccountSidebarProps {
  displayName: string;
  contact?: string | null;
  avatarUrl?: string | null;
  roleLabel?: string | null;
  roles: readonly ViewerRole[];
  isVerified?: boolean;
  academyName?: string | null;
  /** Bare route after the academy-slug rewrite, e.g. "/account/profile". */
  currentPath: string;
  /** Academy-aware "/account" prefix; every nav href is built from it. */
  basePath: string;
}

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function AccountSidebar({
  displayName,
  contact,
  avatarUrl,
  roleLabel: rawRole,
  roles,
  isVerified,
  academyName,
  currentPath,
  basePath,
}: AccountSidebarProps) {
  const { t } = useTranslation();
  const format = useLocaleFormat();
  const navSections = visibleAccountNavSections(usePlatformFeatures().certificates_enabled);
  const homePath = basePath.replace(/\/account$/, '') || '/';
  const role = roleLabel(rawRole, t);
  const [isPending, startTransition] = useTransition();
  const [homeHovered, setHomeHovered] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);

  const handleLogout = () => {
    startTransition(async () => {
      await signOut(homePath);
    });
  };

  return (
    <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-24">
      <div className="bg-card flex items-center gap-3 rounded-2xl p-4 text-start lg:flex-col lg:p-5 lg:text-center">
        {avatarUrl ? (
          <AppImage
            src={avatarUrl}
            alt={displayName}
            preset="avatar"
            width={64}
            height={64}
            sizes="64px"
            className="h-12 w-12 shrink-0 rounded-full object-cover lg:h-16 lg:w-16"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--theme-primary) text-xl font-bold text-(--theme-on-primary) lg:h-16 lg:w-16 lg:text-2xl">
            {initialsOf(displayName)}
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-1 lg:items-center lg:gap-1.5">
          <p className="font-semibold text-(--theme-foreground)">{displayName}</p>
          {contact ? (
            <p className="text-muted text-xs break-all" dir="ltr">
              {format.digits(contact)}
            </p>
          ) : null}
          {academyName ? <p className="text-muted hidden text-xs lg:block">{academyName}</p> : null}
          {roles.length > 1 ? (
            <RoleBadges roles={roles} verified={isVerified} />
          ) : role ? (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-(--theme-primary)/15 px-2.5 py-1 text-xs font-semibold text-(--theme-primary-ink) lg:mt-1">
              {isVerified ? (
                <BadgeCheck className="size-3.5 shrink-0" aria-label={t('account.verified')} />
              ) : null}
              {role}
            </span>
          ) : null}
        </div>
      </div>

      <nav>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
          {navSections.flatMap((section) =>
            section.items.map((item) => {
              const href = `${basePath}${item.segment}`;
              const isActive = currentPath.startsWith(`/account${item.segment}`);
              return (
                <AccountNavItem
                  key={item.segment}
                  href={href}
                  label={t(item.labelKey)}
                  icon={item.icon}
                  isActive={isActive}
                />
              );
            }),
          )}
        </div>
        <div className="hidden lg:flex lg:flex-col lg:gap-1">
          {navSections.map((section) => (
            <AccountNavGroup
              key={section.titleKey}
              section={section}
              title={t(section.titleKey)}
              currentPath={currentPath}
              basePath={basePath}
              translate={t}
            />
          ))}
        </div>
      </nav>

      <Link
        href={homePath}
        onMouseEnter={() => setHomeHovered(true)}
        onMouseLeave={() => setHomeHovered(false)}
        className="text-muted hover:text-foreground hidden items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-colors lg:flex"
      >
        <AnimatedHoverIcon icon={HouseIcon} playing={homeHovered} size={16} />
        {t('account.backToHome')}
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        onMouseEnter={() => setLogoutHovered(true)}
        onMouseLeave={() => setLogoutHovered(false)}
        className="text-destructive hover:bg-destructive/10 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 lg:gap-3"
      >
        <AnimatedHoverIcon icon={LogOutIcon} playing={!isPending && logoutHovered} size={16} />
        {isPending ? t('common.loading') : t('auth.logout')}
      </button>
    </aside>
  );
}
