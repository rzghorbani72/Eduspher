'use client';

import Link from 'next/link';

import { BrandLockup } from '@/components/brand/brand-lockup';

type Theme = 'light' | 'dark';

const SunIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
  </svg>
);

type Props = {
  theme: Theme;
  toggleTheme: () => void;
  adminRegisterUrl: string;
  activePage?: string;
};

export function AboutHeader({ theme, toggleTheme, adminRegisterUrl, activePage = 'about' }: Props) {
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60 }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '14px 22px' }}>
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            padding: '10px 14px 10px 12px',
            border: '1px solid var(--bd)',
            borderRadius: 999,
            background: 'var(--header-bg)',
            backdropFilter: 'blur(18px) saturate(160%)',
            WebkitBackdropFilter: 'blur(18px) saturate(160%)',
            boxShadow: 'var(--sh-sm)',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <BrandLockup />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href="/#features" className="mt-nav-link">
              امکانات
            </Link>
            <Link href="/#pricing" className="mt-nav-link">
              قیمت‌ها
            </Link>
            <Link href="/#examples" className="mt-nav-link">
              نمونه‌ها
            </Link>
            <Link href="/about" className={`mt-nav-link${activePage === 'about' ? 'active' : ''}`}>
              درباره ما
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="تغییر تم"
              className="mt-theme-btn"
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 40,
                height: 40,
                borderRadius: 999,
                border: '1px solid var(--bd)',
                background: 'var(--card)',
                color: 'var(--ink-2)',
                cursor: 'pointer',
                transition: 'color .2s, border-color .2s',
              }}
            >
              {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            </button>
            <a
              href={adminRegisterUrl}
              className="mt-cta-btn"
              style={{
                padding: '11px 19px',
                borderRadius: 999,
                textDecoration: 'none',
                color: 'var(--brand-ink)',
                fontWeight: 700,
                fontSize: 15,
                background: 'var(--grad)',
                boxShadow: '0 12px 26px -10px rgba(109,94,252,.7)',
                transition: 'transform .2s',
                display: 'inline-block',
              }}
            >
              ساخت آکادمی رایگان
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
