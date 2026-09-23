import Link from '@/components/ui/link';
import { getAcademyBySlug, getCurrentAcademy, getCurrentUser } from '@/lib/api/server';
import { getAcademyContext } from '@/lib/store-context';
import { resolveAssetUrl } from '@/lib/utils';
import { sizedImageUrl } from '@/lib/images/sized-image-url';
import { AccountMenuDropdown } from '@/components/layout/account-menu-dropdown';
import { Container } from './section';
import { Button } from './primitives';
import { RemovableSlot } from './removable-slot';
import { list, text, type SectionConfig } from './types';
import { templateHref, type TemplateRoute } from './routes';
import { editableList, editableItem } from './editable-list';

export interface HeaderNavItem {
  label: string;
  route: TemplateRoute;
}

export interface HeaderDefaults {
  /** Small tracked line under the academy name. */
  tagline: string;
  ctaText: string;
  loginText: string;
  accountText: string;
  nav: readonly HeaderNavItem[];
}

/**
 * Presentation knobs that make each template's header pixel-accurate. Everything
 * here is layout/tone only — the behaviour (auth, nav, mobile disclosure) is
 * identical across templates so it lives in one place.
 */
export interface HeaderSpec {
  tone: 'page' | 'surface' | 'deep';
  /** Bar height in px, matching the source design. */
  height: number;
  navStyle: 'plain' | 'underline' | 'border' | 'pill';
  /** Per-template CSS-module class drawing the logo mark. Omitted = no mark. */
  markClassName?: string;
  /** Tavan draws a short accent rule along the bottom edge. */
  accentBar?: boolean;
  /** Parastoo/Tavan use a heavier bottom rule. */
  thickBorder?: boolean;
  /** Keyhan's translucent, blurred bar. */
  translucent?: boolean;
  /** Monospace tagline (Nokhbeh). */
  monoTagline?: boolean;
}

interface TemplateHeaderProps {
  id?: string;
  config?: SectionConfig;
  defaults: HeaderDefaults;
  spec: HeaderSpec;
  editMode?: boolean;
}

const TONE_CLASS = {
  page: 'bg-(--theme-background) text-(--theme-foreground)',
  surface: 'bg-(--theme-surface) text-(--theme-foreground)',
  deep: 'bg-(--theme-deep) text-(--theme-on-deep)',
} as const;

// `text-current` keeps every link on the header's own tone (page/surface use the
// foreground, deep uses on-deep). Without it the global `a { color: primary }`
// base rule wins and the nav renders in the brand colour on a light bar.
const NAV_LINK_CLASS = {
  plain: 'text-current px-3 py-2 text-[15px] font-medium opacity-80 hover:opacity-100',
  // The underline/border variants draw their rule on the link box itself, so
  // they need their own horizontal padding: the nav row's `gap-1` alone left
  // 4px between words and the items read as one run-on string.
  underline:
    'text-current mx-1.5 border-b-[1.5px] border-transparent py-1.5 text-[14.5px] font-medium hover:border-(--theme-primary) hover:text-(--theme-primary)',
  border:
    'text-current mx-1.5 border-b-2 border-transparent py-1.5 text-[15px] font-medium hover:border-(--theme-primary) hover:text-(--theme-primary)',
  pill: 'text-current rounded-full px-4 py-2 text-[15px] font-bold hover:bg-(--theme-surface-alt)',
} as const;

/**
 * One header for all seven templates.
 *
 * It is a server component: the signed-in state comes from `getCurrentUser()`
 * rather than a client provider, and the mobile menu is a native `<details>`
 * disclosure. That keeps the whole bar at zero client JS while still showing the
 * right account link — the legacy `SiteHeaderClient` stays untouched for
 * academies on older styles.
 */
export async function TemplateTopBar({
  id,
  config,
  defaults,
  spec,
  editMode = false,
}: TemplateHeaderProps) {
  const [currentAcademy, user, storeContext] = await Promise.all([
    getCurrentAcademy().catch(() => null),
    getCurrentUser().catch(() => null),
    getAcademyContext(),
  ]);
  // Visitors are anonymous, so /academies/current is empty for them — fall back
  // to the public record or the header renders unbranded for everyone signed out.
  const academy =
    currentAcademy ?? (storeContext.slug ? await getAcademyBySlug(storeContext.slug) : null);

  const brandName = text(config, 'brandName', academy?.name ?? 'آکادمی');
  // The academy's uploaded logo replaces the template's decorative mark; without
  // one the template mark stays, so no header ever renders an empty slot.
  const logoUrl = resolveAssetUrl(academy?.logo?.publicUrl);
  const tagline = text(config, 'tagline', defaults.tagline);
  const configuredNav = list<HeaderNavItem>(config, 'nav', defaults.nav);
  // Contact Us is platform-required: keep it even when a manager customized nav.
  const nav = configuredNav.some((item) => item.route === 'support')
    ? configuredNav
    : [...configuredNav, { label: 'تماس با ما', route: 'support' as const }];
  const isAuthenticated = Boolean(user);
  const accountLabel = user?.display_name?.trim() || defaults.accountText;
  const accountAvatarUrl = resolveAssetUrl(user?.avatar?.url);
  const loginText = text(config, 'loginText', defaults.loginText);

  const ctaSlot = (
    <RemovableSlot
      config={config}
      flagKey="showHeaderCta"
      editMode={editMode}
      className="inline-flex"
    >
      <Button
        tone="primary"
        size="sm"
        href={templateHref(storeContext, 'courses')}
        editableKey="ctaText"
      >
        {text(config, 'ctaText', defaults.ctaText)}
      </Button>
    </RemovableSlot>
  );

  const accountSlot = (
    <div className="hidden sm:inline-flex">
      {isAuthenticated ? (
        <AccountMenuDropdown
          displayName={accountLabel}
          avatarUrl={accountAvatarUrl}
          deepTone={spec.tone === 'deep'}
        />
      ) : (
        <Link
          href={templateHref(storeContext, 'login')}
          className="text-[14.5px] font-medium opacity-80 hover:opacity-100"
        >
          <span data-editable="loginText">{loginText}</span>
        </Link>
      )}
    </div>
  );

  const borderClass = spec.thickBorder
    ? 'border-b-2 border-(--theme-border-color)'
    : spec.tone === 'deep'
      ? 'border-b border-current/12'
      : 'border-b border-(--theme-border-color)';

  return (
    <header
      id={id || 'header'}
      className={`sticky top-0 z-50 ${
        spec.translucent
          ? 'bg-(--theme-background)/88 text-(--theme-foreground) backdrop-blur-md'
          : TONE_CLASS[spec.tone]
      } ${borderClass}`}
    >
      {spec.accentBar ? (
        <span
          aria-hidden="true"
          data-motion="hue"
          className="absolute start-0 -bottom-px h-[3px] w-[38%] bg-linear-to-r from-(--theme-primary) via-(--theme-accent) to-(--theme-primary)"
        />
      ) : null}

      <Container>
        <div className="flex items-center gap-6" style={{ minHeight: `${spec.height}px` }}>
          <Link
            href={templateHref(storeContext, 'home')}
            className="flex flex-none items-center gap-3"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sizedImageUrl(logoUrl, 320, 85) ?? logoUrl}
                alt={brandName}
                decoding="async"
                className="h-9 w-auto max-w-[160px] flex-none object-contain"
              />
            ) : spec.markClassName ? (
              <span aria-hidden="true" className={spec.markClassName} />
            ) : null}
            <span>
              <b
                data-editable="brandName"
                className="block text-[19px] leading-[1.2] font-bold tracking-[-0.02em] whitespace-nowrap"
              >
                {brandName}
              </b>
              <span
                data-editable="tagline"
                className={`block text-[10.5px] tracking-[0.22em] whitespace-nowrap ${
                  spec.tone === 'deep' ? 'text-current/60' : 'text-(--theme-muted)'
                } ${spec.monoTagline ? 'font-mono' : ''}`}
              >
                {tagline}
              </span>
            </span>
          </Link>

          <nav
            aria-label="ناوبری اصلی"
            className="hidden flex-1 items-center gap-1 lg:flex"
            {...editableList('nav', nav)}
          >
            {nav.map((item, index) => (
              <a
                key={item.route}
                href={templateHref(storeContext, item.route)}
                {...editableItem('nav', index, 'label')}
                className={NAV_LINK_CLASS[spec.navStyle]}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ms-auto flex flex-none items-center gap-3">
            {ctaSlot}
            {accountSlot}

            {/* CSS-only mobile menu: native disclosure, no JavaScript. */}
            <details className="relative lg:hidden">
              <summary
                aria-label="منو"
                className="grid size-10 cursor-pointer list-none place-items-center rounded-(--theme-border-radius) border border-current/25 [&::-webkit-details-marker]:hidden"
              >
                <span aria-hidden="true">☰</span>
              </summary>
              <div
                className={`absolute end-0 top-[calc(100%+8px)] z-50 w-56 rounded-(--theme-border-radius) border p-2 shadow-(--theme-shadow) ${
                  spec.tone === 'deep'
                    ? 'border-current/18 bg-(--theme-deep)'
                    : 'border-(--theme-border-color) bg-(--theme-surface)'
                }`}
              >
                {nav.map((item) => (
                  <a
                    key={item.route}
                    href={templateHref(storeContext, item.route)}
                    className="block rounded-(--theme-border-radius) px-3 py-2.5 text-[15px] font-medium hover:bg-(--theme-surface-alt)"
                  >
                    {item.label}
                  </a>
                ))}
                {isAuthenticated ? (
                  <div className="mt-1 border-t border-current/10 pt-1">
                    <AccountMenuDropdown
                      displayName={accountLabel}
                      avatarUrl={accountAvatarUrl}
                      deepTone={spec.tone === 'deep'}
                      inline
                    />
                  </div>
                ) : (
                  <a
                    href={templateHref(storeContext, 'login')}
                    className="flex items-center gap-2 rounded-(--theme-border-radius) px-3 py-2.5 text-[15px] font-medium hover:bg-(--theme-surface-alt)"
                  >
                    {loginText}
                  </a>
                )}
              </div>
            </details>
          </div>
        </div>
      </Container>
    </header>
  );
}

/**
 * Navigation is the same closed set of real pages on every template. In-page
 * anchors used to live here, and they broke the moment a manager hid the
 * section they pointed at.
 */
export const FULL_NAV: readonly HeaderNavItem[] = [
  { label: 'خانه', route: 'home' },
  { label: 'دوره‌ها', route: 'courses' },
  { label: 'بسته‌ها', route: 'bundles' },
  { label: 'وبلاگ', route: 'blog' },
  { label: 'تماس با ما', route: 'support' },
];

/** Kept as a separate export so templates can opt into a shorter bar. */
export const COMPACT_NAV: readonly HeaderNavItem[] = [
  { label: 'خانه', route: 'home' },
  { label: 'دوره‌ها', route: 'courses' },
  { label: 'بسته‌ها', route: 'bundles' },
  { label: 'تماس با ما', route: 'support' },
];

export function headerDefaults(overrides: Partial<HeaderDefaults> = {}): HeaderDefaults {
  return {
    tagline: '',
    ctaText: 'ثبت‌نام در دوره',
    loginText: 'ورود',
    accountText: 'حساب من',
    nav: FULL_NAV,
    ...overrides,
  };
}
