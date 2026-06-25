import Link from "@/components/ui/link";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath } from "@/lib/utils";
import { Mail, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { t } from "@/lib/i18n/server-translations";

interface FooterBlockProps {
  id?: string;
  config?: {
    showSocialLinks?: boolean;
    showNewsletter?: boolean;
    columns?: number;
    minimal?: boolean;
    compact?: boolean;
    showLegal?: boolean;
    style?: "default" | "creative";
  };
}

function getFooterLinks() {
  return [
    {
      title: t("footer.product"),
      items: [
        { label: t("navigation.courses"), href: "/courses" },
        { label: t("footer.learningPaths"), href: "/paths" },
        { label: t("footer.pricing"), href: "/pricing" },
        { label: t("footer.scholarships"), href: "/scholarships" },
      ],
    },
    {
      title: t("footer.company"),
      items: [
        { label: t("footer.about"), href: "/about" },
        { label: t("footer.blog"), href: "/articles" },
        { label: t("footer.careers"), href: "/careers" },
        { label: t("footer.press"), href: "/press" },
      ],
    },
    {
      title: t("footer.support"),
      items: [
        { label: t("footer.helpCenter"), href: "/support" },
        { label: t("footer.contact"), href: "/contact" },
        { label: t("footer.status"), href: "/status" },
        { label: t("footer.terms"), href: "/legal/terms" },
      ],
    },
  ];
}

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
    style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)', boxShadow: 'var(--theme-shadow)' }}
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

const Copyright = ({ name, rightsText }: { name: string; rightsText: string }) => (
  <p className="text-xs opacity-40">&copy; {new Date().getFullYear()} {name}. {rightsText}</p>
);

export async function FooterBlock({ id, config }: FooterBlockProps) {
  const store = await getAcademyContext();
  const buildPath = (path: string) => buildAcademyPath(store.slug, path);

  if (config?.style === "creative") {
    return <CreativeFooter id={id} name={store.name ?? "منتوریار"} buildPath={buildPath} />;
  }

  const showSocialLinks = config?.showSocialLinks !== false;
  const showNewsletter = config?.showNewsletter !== false;
  const columns = config?.columns || 4;
  const minimal = config?.minimal === true;
  const compact = config?.compact === true;
  const showLegal = config?.showLegal === true;

  const footerLinks = getFooterLinks();
  const displayLinks = minimal ? footerLinks.slice(0, 2) : footerLinks;
  const gridCols = minimal ? "sm:grid-cols-2" : `sm:grid-cols-${Math.min(columns, 3)}`;
  const rightsText = t("footer.allRightsReserved");

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
          <Copyright name={store.name ?? ''} rightsText={rightsText} />
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
            <p className="text-sm leading-relaxed opacity-55">{t("footer.description")}</p>
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
            <Copyright name={store.name ?? ''} rightsText={rightsText} />
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
          <p className="text-sm leading-relaxed opacity-55">{t("footer.description")}</p>
          {showSocialLinks && <SocialLinks />}
          {showNewsletter && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">{t("footer.newsletter")}</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder={t("footer.emailPlaceholder")}
                  className="flex-1 rounded-lg border border-(--theme-border-strong) px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20"
                  style={{ backgroundColor: 'var(--theme-surface)', color: 'var(--theme-foreground)' }}
                />
                <button
                  type="submit"
                  aria-label={t("footer.newsletter")}
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
          <Copyright name={store.name ?? ''} rightsText={rightsText} />
          {showLegal && (
            <div className="flex flex-wrap items-center gap-4 text-xs opacity-55">
              <Link href={buildPath("/legal/terms")} className="hover:opacity-100 hover:text-[var(--theme-primary)]">{t("footer.termsOfService")}</Link>
              <Link href={buildPath("/legal/privacy")} className="hover:opacity-100 hover:text-[var(--theme-primary)]">{t("footer.privacy")}</Link>
              <Link href={buildPath("/legal/cookies")} className="hover:opacity-100 hover:text-[var(--theme-primary)]">{t("footer.cookies")}</Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

// ── Creative (استودیوی خلاق) — navy footer with brand + link columns ──────────

const CREATIVE_FOOTER_COLS = [
  {
    title: "یادگیری",
    items: [
      { label: "همه کلاس‌ها", href: "/courses" },
      { label: "دسته‌بندی‌ها", href: "/courses" },
      { label: "مدرسان", href: "/about" },
      { label: "جامعه", href: "/about" },
    ],
  },
  {
    title: "تدریس",
    items: [
      { label: "مدرس شو", href: "/about" },
      { label: "راهنمای مدرسان", href: "/about" },
      { label: "پرداخت‌ها", href: "/pricing" },
    ],
  },
  {
    title: "شرکت",
    items: [
      { label: "درباره ما", href: "/about" },
      { label: "وبلاگ", href: "/articles" },
      { label: "استخدام", href: "/about" },
      { label: "مطبوعات", href: "/about" },
    ],
  },
];

function CreativeFooter({ id, name, buildPath }: { id?: string; name: string; buildPath: (path: string) => string }) {
  return (
    <footer id={id || "footer"} className="bg-(--theme-secondary) px-[40px] pb-[32px] pt-[64px] text-(--theme-on-secondary)">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-[48px] grid gap-[48px] md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-[12px] text-[22px] font-black text-(--theme-on-secondary)">{name}</div>
            <p className="max-w-[280px] text-[13px] leading-[1.8] text-(--theme-on-secondary)/55">
              جامعه یادگیری خلاق که هر کسی می‌تواند کلاس بگیرد، کار به اشتراک بذارد، و با هم رشد کند.
            </p>
          </div>
          {CREATIVE_FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h5 className="mb-[16px] text-[11px] font-black text-(--theme-on-secondary)">{col.title}</h5>
              {col.items.map((item) => (
                <Link
                  key={item.label}
                  href={buildPath(item.href)}
                  className="mb-[10px] block text-[13px] font-semibold text-(--theme-on-secondary)/55 transition-colors hover:text-(--theme-primary)"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 border-t-[1.5px] border-(--theme-on-secondary)/15 pt-[24px] text-[13px] font-semibold text-(--theme-on-secondary)/45 sm:flex-row sm:justify-between">
          <span>© ۱۴۰۵ {name}</span>
          <span className="text-(--theme-primary)">👩‍🎨 ساخته شده برای خلاقان، توسط خلاقان</span>
        </div>
      </div>
    </footer>
  );
}
