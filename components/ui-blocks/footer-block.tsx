import { cn } from "@/lib/utils";
import Link from "next/link";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath } from "@/lib/utils";
import { env } from "@/lib/env";
import { Mail, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

interface FooterBlockProps {
  id?: string;
  config?: {
    showSocialLinks?: boolean;
    showNewsletter?: boolean;
    columns?: number;
    minimal?: boolean;
    compact?: boolean;
    showLegal?: boolean;
  };
}

const footerLinks = [
  {
    title: "Product",
    items: [
      { label: "Courses", href: "/courses" },
      { label: "Learning Paths", href: "/paths" },
      { label: "Pricing", href: "/pricing" },
      { label: "Scholarships", href: "/scholarships" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/articles" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help Center", href: "/support" },
      { label: "Contact", href: "/contact" },
      { label: "Status", href: "/status" },
      { label: "Terms", href: "/legal/terms" },
    ],
  },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
];

const footerStyle = { backgroundColor: 'var(--theme-surface-alt)', borderColor: 'var(--theme-border-color)', color: 'var(--theme-foreground)' };
const dividerStyle = { borderColor: 'var(--theme-border-color)' };

const LogoBadge = () => (
  <div
    className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
    style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)', boxShadow: 'color-mix(in srgb, var(--theme-primary) 40%, transparent) 0 4px 10px' }}
  >
    <span className="text-lg font-semibold">ES</span>
  </div>
);

const SocialLinks = ({ max }: { max?: number }) => (
  <div className="flex items-center gap-4">
    {(max ? socialLinks.slice(0, max) : socialLinks).map((social) => {
      const Icon = social.icon;
      return (
        <Link key={social.name} href={social.href} className="opacity-40 transition-all hover:opacity-100 hover:text-[var(--theme-primary)]" aria-label={social.name}>
          <Icon className="h-5 w-5" />
        </Link>
      );
    })}
  </div>
);

const Copyright = ({ name }: { name: string }) => (
  <p className="text-xs opacity-40">&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
);

export async function FooterBlock({ id, config }: FooterBlockProps) {
  const store = await getAcademyContext();
  const buildPath = (path: string) => buildAcademyPath(store.slug, path);

  const showSocialLinks = config?.showSocialLinks !== false;
  const showNewsletter = config?.showNewsletter !== false;
  const columns = config?.columns || 4;
  const minimal = config?.minimal === true;
  const compact = config?.compact === true;
  const showLegal = config?.showLegal === true;

  const displayLinks = minimal ? footerLinks.slice(0, 2) : footerLinks;
  const gridCols = minimal ? "sm:grid-cols-2" : `sm:grid-cols-${Math.min(columns, 3)}`;

  if (minimal) {
    return (
      <footer id={id || "footer"} className="border-t" style={footerStyle}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:justify-between md:items-center">
          <div className="flex items-center gap-3">
            <LogoBadge />
            <p className="text-lg font-semibold">{store.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm opacity-60">
            {displayLinks.flatMap((section) =>
              section.items.slice(0, 2).map((item) => (
                <Link key={item.href} href={buildPath(item.href)} className="transition-opacity hover:opacity-100 hover:text-[var(--theme-primary)]">
                  {item.label}
                </Link>
              ))
            )}
          </div>
          <Copyright name={store.name ?? ''} />
        </div>
      </footer>
    );
  }

  if (compact) {
    return (
      <footer id={id || "footer"} className="border-t" style={footerStyle}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 md:flex-row md:justify-between">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-3">
              <LogoBadge />
              <p className="text-lg font-semibold">{store.name}</p>
            </div>
            <p className="text-sm leading-relaxed opacity-55">{env.siteDescription}</p>
          </div>
          <div className={`grid flex-1 gap-4 ${gridCols}`}>
            {displayLinks.map((section) => (
              <div key={section.title} className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide">{section.title}</p>
                <ul className="space-y-2 text-sm opacity-55">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link className="transition-opacity hover:opacity-100 hover:text-[var(--theme-primary)]" href={buildPath(item.href)}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl border-t px-6 py-4" style={dividerStyle}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Copyright name={store.name ?? ''} />
            {showSocialLinks && <SocialLinks max={4} />}
          </div>
        </div>
      </footer>
    );
  }

  // Default footer
  return (
    <footer id={id || "footer"} className="border-t" style={footerStyle}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:justify-between md:gap-8">
        <div className="max-w-sm space-y-4">
          <div className="flex items-center gap-3">
            <LogoBadge />
            <p className="text-lg font-semibold">{store.name}</p>
          </div>
          <p className="text-sm leading-relaxed opacity-55">
            {env.siteDescription} Grow your skills with curated lessons, guided paths, and mentoring from experts.
          </p>
          {showSocialLinks && <SocialLinks />}
          {showNewsletter && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Subscribe to our newsletter</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20"
                  style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border-strong)', color: 'var(--theme-foreground)' }}
                />
                <button
                  type="submit"
                  className="rounded-lg px-4 py-2 text-sm font-semibold shadow-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' }}
                >
                  <Mail className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
        <div className={`grid flex-1 gap-6 ${gridCols}`}>
          {displayLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-wide">{section.title}</p>
              <ul className="space-y-3 text-sm opacity-55">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link className="transition-opacity hover:opacity-100 hover:text-[var(--theme-primary)]" href={buildPath(item.href)}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl border-t px-6 py-4" style={dividerStyle}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Copyright name={store.name ?? ''} />
          {showLegal && (
            <div className="flex flex-wrap items-center gap-4 text-xs opacity-55">
              <Link href={buildPath("/legal/terms")} className="hover:opacity-100 hover:text-[var(--theme-primary)]">Terms of Service</Link>
              <Link href={buildPath("/legal/privacy")} className="hover:opacity-100 hover:text-[var(--theme-primary)]">Privacy Policy</Link>
              <Link href={buildPath("/legal/cookies")} className="hover:opacity-100 hover:text-[var(--theme-primary)]">Cookie Policy</Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
