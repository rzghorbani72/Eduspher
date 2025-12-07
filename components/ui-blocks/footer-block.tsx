import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getStoreContext } from "@/lib/store-context";
import { buildStorePath } from "@/lib/utils";
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

export async function FooterBlock({ id, config }: FooterBlockProps) {
  const store = await getStoreContext();
  const buildPath = (path: string) => buildStorePath(store.slug, path);
  
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
      <footer id={id || "footer"} className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:justify-between md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/30">
              <span className="text-lg font-semibold">ES</span>
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{store.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            {displayLinks.flatMap((section) =>
              section.items.slice(0, 2).map((item) => (
                <Link
                  key={item.href}
                  href={buildPath(item.href)}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  if (compact) {
    return (
      <footer id={id || "footer"} className="border-t border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 md:flex-row md:justify-between">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/30">
                <span className="text-lg font-semibold">ES</span>
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{store.name}</p>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {env.siteDescription}
            </p>
          </div>
          <div className={`grid flex-1 gap-4 ${gridCols}`}>
            {displayLinks.map((section) => (
              <div key={section.title} className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                  {section.title}
                </p>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        className="hover:text-slate-900 dark:hover:text-white transition-colors"
                        href={buildPath(item.href)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-600">
              &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
            </p>
            {showSocialLinks && (
              <div className="flex items-center gap-4">
                {socialLinks.slice(0, 4).map((social) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="text-slate-400 transition-colors hover:text-[var(--theme-primary)] dark:text-slate-500 dark:hover:text-[var(--theme-primary)]"
                      aria-label={social.name}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // Default footer
  return (
    <footer id={id || "footer"} className="border-t border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:justify-between md:gap-8">
        <div className="max-w-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/30">
              <span className="text-lg font-semibold">ES</span>
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{store.name}</p>
          </div>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {env.siteDescription} Grow your skills with curated lessons, guided paths, and
            mentoring from experts.
          </p>
          {showSocialLinks && (
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-slate-400 transition-colors hover:text-[var(--theme-primary)] dark:text-slate-500 dark:hover:text-[var(--theme-primary)]"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          )}
          {showNewsletter && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Subscribe to our newsletter
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[var(--theme-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 dark:border-slate-700 dark:bg-slate-900"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--theme-primary)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--theme-primary)]/30 transition-all hover:bg-[var(--theme-primary)]/90"
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
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                {section.title}
              </p>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      className="hover:text-slate-900 dark:hover:text-white transition-colors"
                      href={buildPath(item.href)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl border-t border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
          {showLegal && (
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <Link href={buildPath("/legal/terms")} className="hover:text-slate-900 dark:hover:text-white">
                Terms of Service
              </Link>
              <Link href={buildPath("/legal/privacy")} className="hover:text-slate-900 dark:hover:text-white">
                Privacy Policy
              </Link>
              <Link href={buildPath("/legal/cookies")} className="hover:text-slate-900 dark:hover:text-white">
                Cookie Policy
              </Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

