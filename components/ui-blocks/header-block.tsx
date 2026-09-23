'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CircleUser, Menu, X } from 'lucide-react';

import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { SiteHeaderShell } from '@/components/layout/site-header-shell';
import { cn } from '@/lib/utils';
import { useAcademyContext, useStorePath } from '@/components/providers/store-provider';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useTranslation } from '@/lib/i18n/hooks';

interface HeaderBlockProps {
  id?: string;
  config?: {
    showLogo?: boolean;
    showNavigation?: boolean;
    navigationStyle?: 'horizontal' | 'vertical';
    sticky?: boolean;
    transparent?: boolean;
    compact?: boolean;
    minimal?: boolean;
    style?: 'default' | 'code' | 'creative';
  };
  /** Editor preview: force the logged-out auth button (see BlocksRenderer). */
  previewMode?: boolean;
}

export function HeaderBlock({ id, config, previewMode = false }: HeaderBlockProps) {
  const sticky = config?.sticky !== false;
  const transparent = config?.transparent === true;
  const compact = config?.compact === true;
  const minimal = config?.minimal === true;
  const style = config?.style ?? 'default';

  if (style === 'code') {
    return <CodeHeader id={id} sticky={sticky} previewMode={previewMode} />;
  }

  if (style === 'creative') {
    return <CreativeHeader id={id} sticky={sticky} previewMode={previewMode} />;
  }

  // A plain wrapper, not a <header>: SiteHeaderShell renders the banner
  // landmark itself, and nesting two would announce the header twice.
  return (
    <div
      id={id || 'header'}
      className={cn(sticky && 'sticky top-0 z-50', transparent && 'absolute top-0 right-0 left-0')}
    >
      <div
        className={cn(
          'w-full border-b backdrop-blur-md transition-all',
          compact && 'py-2',
          (transparent || minimal) && 'border-none bg-transparent',
        )}
        style={
          !transparent && !minimal
            ? {
                backgroundColor: 'color-mix(in srgb, var(--theme-background) 88%, transparent)',
                borderColor: 'var(--theme-border-color)',
              }
            : undefined
        }
      >
        <SiteHeaderShell previewMode={previewMode} />
      </div>
    </div>
  );
}

// ── Creative — studio header with centered search + warm nav ─────────────────

function CreativeHeader({
  id,
  sticky,
  previewMode,
}: {
  id?: string;
  sticky: boolean;
  previewMode?: boolean;
}) {
  const router = useRouter();
  const { name: academyName } = useAcademyContext();
  const { isAuthenticated: signedIn } = useAuthContext();
  const isAuthenticated = previewMode ? false : signedIn;
  const buildPath = useStorePath();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '/courses', label: t('navigation.courses') },
    { href: '/about', label: t('navigation.aboutUs') },
    { href: '/pricing', label: t('footer.pricing') },
    { href: '/account/support?new=1', label: t('navigation.contactUs') },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
    router.push(buildPath(`/courses${params}`));
  };

  return (
    <header
      id={id || 'header'}
      className={cn(
        'z-50 w-full border-b border-(--theme-border-color) bg-(--theme-surface)/95 backdrop-blur-md transition-all',
        sticky && 'sticky top-0',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-5 px-4 sm:px-6">
        <Link
          href={buildPath('/')}
          className="shrink-0 text-xl font-black text-(--theme-foreground)"
        >
          {academyName}
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden h-10 max-w-sm flex-1 items-center gap-2 rounded-full border border-(--theme-border-strong) bg-transparent px-4 md:flex"
        >
          <Search className="h-4 w-4 text-(--theme-foreground)/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('courses.searchPlaceholder')}
            className="w-full bg-transparent! text-sm text-(--theme-foreground) outline-none placeholder:text-(--theme-foreground)/35"
          />
        </form>

        <nav className="mr-auto hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={buildPath(item.href)}
              className="rounded-lg px-3 py-1.5 text-sm font-bold text-(--theme-foreground)/65 transition-colors hover:bg-(--theme-surface-alt) hover:text-(--theme-foreground)"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          {isAuthenticated ? (
            <Link
              href={buildPath('/account')}
              className="hidden h-9 items-center gap-2 rounded-full border border-(--theme-border-strong) px-3 text-sm font-medium text-(--theme-foreground) md:inline-flex"
            >
              <CircleUser className="h-5 w-5 text-(--theme-primary)" />
              {t('account.myCourses')}
            </Link>
          ) : (
            <>
              <Link
                href={buildPath('/auth/login')}
                className="hidden rounded-full border border-(--theme-border-strong) px-4 py-2 text-sm font-bold text-(--theme-foreground) transition-colors hover:bg-(--theme-surface-alt) md:inline-block"
              >
                {t('auth.login')}
              </Link>
              <Link
                href={buildPath('/auth/register')}
                className="rounded-(--theme-border-radius) bg-(--theme-primary) px-4 py-2 text-sm font-extrabold text-(--theme-on-primary) transition-opacity hover:opacity-90"
              >
                {t('auth.startFree')}
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--theme-border-strong) text-(--theme-foreground) lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-(--theme-border-color) px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={buildPath(item.href)}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-(--theme-foreground)/70 hover:bg-(--theme-surface-alt) hover:text-(--theme-foreground)"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

// ── Code — programming-academy header with search + brand nav ────────────────

function CodeHeader({
  id,
  sticky,
  previewMode,
}: {
  id?: string;
  sticky: boolean;
  previewMode?: boolean;
}) {
  const router = useRouter();
  const { name: academyName } = useAcademyContext();
  const { isAuthenticated: signedIn } = useAuthContext();
  const isAuthenticated = previewMode ? false : signedIn;
  const buildPath = useStorePath();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '/courses', label: t('navigation.courses') },
    { href: '/paths', label: t('navigation.roadmap') },
    { href: '/pricing', label: t('footer.pricing') },
    { href: '/about', label: t('navigation.aboutUs') },
    { href: '/account/support?new=1', label: t('navigation.contactUs') },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
    router.push(buildPath(`/courses${params}`));
  };

  return (
    <header
      id={id || 'header'}
      className={cn(
        'z-50 w-full border-b border-(--theme-border-color) bg-(--theme-background)/95 backdrop-blur-md transition-all',
        sticky && 'sticky top-0',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-5 px-4 sm:px-6">
        <Link href={buildPath('/')} className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--theme-primary) font-mono text-sm font-black tracking-tighter text-(--theme-on-primary)">
            {'</>'}
          </div>
          <span className="text-lg font-bold text-(--theme-foreground)">{academyName}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={buildPath(item.href)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-(--theme-foreground)/65 transition-colors hover:bg-(--theme-surface-alt) hover:text-(--theme-foreground)"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={handleSearch}
          className="hidden h-10 max-w-xs flex-1 items-center gap-2 rounded-(--theme-border-radius) border border-(--theme-border-strong) bg-transparent px-3.5 md:flex"
        >
          <Search className="h-4 w-4 text-(--theme-foreground)/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('courses.searchPlaceholder')}
            className="w-full bg-transparent! text-sm text-(--theme-foreground) outline-none placeholder:text-(--theme-foreground)/35"
          />
        </form>

        <div className="mr-auto flex shrink-0 items-center gap-2.5">
          {isAuthenticated ? (
            <Link
              href={buildPath('/account')}
              className="hidden h-9 items-center gap-2 rounded-full border border-(--theme-border-strong) px-3 text-sm font-medium text-(--theme-foreground) md:inline-flex"
            >
              <CircleUser className="h-5 w-5 text-(--theme-primary)" />
              {t('account.myCourses')}
            </Link>
          ) : (
            <>
              <Link
                href={buildPath('/auth/login')}
                className="hidden rounded-lg px-3.5 py-2 text-sm font-semibold text-(--theme-foreground)/65 transition-colors hover:bg-(--theme-surface-alt) hover:text-(--theme-foreground) md:inline-block"
              >
                {t('auth.login')}
              </Link>
              <Button
                asChild
                size="sm"
                className="rounded-(--theme-border-radius) bg-(--theme-primary) font-bold text-(--theme-on-primary) hover:opacity-90"
              >
                <Link href={buildPath('/auth/register')}>{t('auth.startFree')}</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--theme-border-strong) text-(--theme-foreground) lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-(--theme-border-color) px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={buildPath(item.href)}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-(--theme-foreground)/70 hover:bg-(--theme-surface-alt) hover:text-(--theme-foreground)"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
