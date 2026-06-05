"use client";

import { useState } from "react";
import {
  Palette,
  BookOpen,
  CreditCard,
  Users,
  BarChart2,
  Globe,
  Star,
  Check,
  ArrowLeft,
  ExternalLink,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { buildAcademyPath } from "@/lib/utils";
import type { StoreSummary } from "@/lib/api/types";
import Link from "@/components/ui/link";

type Props = {
  adminLoginUrl: string;
  adminRegisterUrl: string;
  academies: StoreSummary[];
};

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type Example = {
  title: string;
  description: string;
  bgColor: string;
  accentColor: string;
  emoji: string;
};

const FEATURES: Feature[] = [
  {
    icon: Palette,
    title: "برندینگ اختصاصی",
    description:
      "رنگ‌ها، قلم‌ها و هویت بصری آکادمیت را کاملاً سفارشی کن. برند تو، شخصیت تو.",
  },
  {
    icon: BookOpen,
    title: "سازنده دوره",
    description:
      "ویدیو، PDF، فایل و نظرات — همه را با یک ابزار ساده و بصری بساز.",
  },
  {
    icon: CreditCard,
    title: "پرداخت و اشتراک",
    description:
      "آکادمی‌ات را به درآمد تبدیل کن — پرداخت ساده، بدون دردسر، مستقیم به حسابت.",
  },
  {
    icon: Users,
    title: "داشبورد دانشجو",
    description:
      "پیشرفت دانشجو، کتابخانه و دسترسی همیشگی به محتوای خریداری‌شده.",
  },
  {
    icon: BarChart2,
    title: "آمار و تحلیل",
    description:
      "بفهم کدام دوره‌ها بیشتر دانشجو جذب می‌کنند و درآمدت را بهینه کن.",
  },
  {
    icon: Globe,
    title: "دامنه سفارشی",
    description:
      "آکادمیت روی دامنه خودت — مثل academy.yourdomain.ir — حرفه‌ای و قابل اعتماد.",
  },
];

const EXAMPLES: Example[] = [
  {
    title: "زبانکده",
    description: "یادگیری زبان‌های خارجی",
    bgColor: "#0a1f15",
    accentColor: "#4ade80",
    emoji: "🇬🇧",
  },
  {
    title: "مکتب فیتنس",
    description: "سلامت، ورزش و تناسب اندام",
    bgColor: "#1f1205",
    accentColor: "#f59e0b",
    emoji: "💪",
  },
  {
    title: "آکادمی کدنویسی نوین",
    description: "برنامه‌نویسی و توسعه دیجیتال",
    bgColor: "#07091e",
    accentColor: "#818cf8",
    emoji: "⌨️",
  },
];

const MARQUEE_ITEMS = [
  "آکادمی کدنویسی نوین",
  "مکتب فیتنس",
  "زبانکده",
  "هوش مصنوعی نوین",
  "آکادمی دیجیتال مارکتینگ",
  "مدرسه هوش مصنوعی",
  "آکادمی طراحی",
  "یادگیری طراحی",
];

const PRO_FEATURES = [
  "دوره‌های نامحدود",
  "دانشجوی نامحدود",
  "برندینگ اختصاصی",
  "دامنه سفارشی (۰٪ کمیسیون)",
  "تأیید سفارشی برند",
  "پشتیبانی اختصاصی",
  "آمار و پیشرفت پیشرفته",
];

const CUSTOM_FEATURES = [
  "همه امکانات حرفه‌ای",
  "یکپارچه‌سازی اختصاصی",
  "پشتیبانی اولویت‌دار",
  "قرارداد SLA",
  "آموزش تیمی",
  "گزارش‌های اختصاصی",
];

const FREE_FEATURES = ["۱ دوره فعال", "تا ۵۰ دانشجو", "پشتیبانی پایه"];

const NAV_ITEMS = [
  { href: "#features", label: "امکانات" },
  { href: "#examples", label: "نمونه آکادمی‌ها" },
  { href: "#pricing", label: "قیمت‌گذاری" },
  { href: "#about", label: "درباره ما" },
];

/* ─── Landing header ─── */

function LandingHeader({ adminLoginUrl }: { adminLoginUrl: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0b12]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-white transition hover:text-amber-400">
          وب آکادمی
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={adminLoginUrl}
          className="hidden h-10 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5 md:inline-flex"
        >
          ورود به حساب
        </a>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#0d0d16] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-slate-300 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href={adminLoginUrl}
            className="mt-6 block rounded-full border border-white/20 py-2.5 text-center text-sm font-semibold text-white"
          >
            ورود به حساب
          </a>
        </div>
      )}
    </header>
  );
}

/* ─── small shared presentationals ─── */

function SectionLabel({ children }: { children: string }) {
  return <p className="mb-3 text-sm font-semibold text-amber-400">{children}</p>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-bold text-white sm:text-4xl">{children}</h2>
  );
}

function SectionSubtitle({ children }: { children: string }) {
  return (
    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
      {children}
    </p>
  );
}

/* ─── Hero mockup ─── */

function HeroMockup() {
  const blocks = [
    { block: "lp-block-indigo", dot: "lp-block-indigo-dot" },
    { block: "lp-block-violet", dot: "lp-block-violet-dot" },
    { block: "lp-block-pink",   dot: "lp-block-pink-dot" },
  ];

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#13131f] shadow-[0_30px_70px_rgba(0,0,0,0.55)]">
      {/* browser chrome */}
      <div className="flex items-center gap-3 border-b border-white/6 bg-[#1a1a28] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 rounded bg-[#0d0d18] px-3 py-1 text-center text-xs text-slate-600">
          webacademy.ir/builder
        </div>
      </div>

      {/* content */}
      <div className="p-5" dir="rtl">
        <p className="mb-1 text-xs font-bold text-amber-400">کد نویسی نوین</p>
        <div className="mb-4 space-y-1.5">
          <div className="h-1.5 w-2/3 rounded-full bg-white/12" />
          <div className="h-1.5 w-1/2 rounded-full bg-white/7" />
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {blocks.map(({ block, dot }, i) => (
            <div key={i} className={`rounded-lg p-2.5 ${block}`}>
              <div className={`mb-1.5 h-1 rounded-full ${dot}`} />
              <div className="h-1 w-2/3 rounded-full bg-white/8" />
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-amber-500 py-2 text-center text-xs font-bold text-[#0b0b12]">
          پرداخت و ادامه یادگیری
        </div>
      </div>
    </div>
  );
}

/* ─── Example card ─── */

function ExampleCard({ example }: { example: Example }) {
  const cssVars = {
    "--ex-bg": example.bgColor,
    "--ex-accent": example.accentColor,
    "--ex-accent-hi": example.accentColor + "50",
    "--ex-accent-lo": example.accentColor + "30",
  } as React.CSSProperties;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/7 bg-[#13131f] transition hover:-translate-y-0.5"
      style={cssVars}
    >
      <div className="flex aspect-video items-center justify-center bg-(--ex-bg)">
        <div className="text-center">
          <div className="mb-2 text-5xl">{example.emoji}</div>
          <p className="text-sm font-semibold text-(--ex-accent)">
            {example.title}
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <div className="h-1 w-16 rounded-full bg-(--ex-accent-hi)" />
            <div className="h-1 w-10 rounded-full bg-(--ex-accent-lo)" />
          </div>
        </div>
      </div>
      <div className="p-4" dir="rtl">
        <p className="font-semibold text-white">{example.title}</p>
        <p className="mt-1 text-sm text-slate-500">{example.description}</p>
      </div>
    </div>
  );
}

/* ─── Real academy example card ─── */

type AcademyExampleCardProps = {
  name: string;
  domain: string;
  href: string;
  palette: { bgColor: string; accentColor: string };
};

function AcademyExampleCard({ name, domain, href, palette }: AcademyExampleCardProps) {
  const cssVars = {
    "--ex-bg": palette.bgColor,
    "--ex-accent": palette.accentColor,
  } as React.CSSProperties;

  return (
    <a
      href={href}
      className="group block overflow-hidden rounded-2xl border border-white/7 bg-[#13131f] transition hover:-translate-y-0.5"
      style={cssVars}
    >
      <div className="flex aspect-video items-center justify-center bg-(--ex-bg)">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <span className="text-xl font-bold text-(--ex-accent)">{name.charAt(0)}</span>
          </div>
          <p className="text-sm font-semibold text-(--ex-accent)">{name}</p>
        </div>
      </div>
      <div className="p-4" dir="rtl">
        <p className="font-semibold text-white transition group-hover:text-amber-400">{name}</p>
        <p className="mt-1 text-sm text-slate-500">{domain}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-(--ex-accent)">
          بازدید از آکادمی
          <ExternalLink className="h-3 w-3" />
        </p>
      </div>
    </a>
  );
}

/* ─── Pricing card ─── */

type PricingCardProps = {
  name: string;
  price: string | null;
  period: string | null;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
  badge: string | null;
};

function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  ctaHref,
  highlighted,
  badge,
}: PricingCardProps) {
  return (
    <div
      className={
        highlighted
          ? "relative rounded-2xl border border-amber-500/40 bg-[#1c1408] p-6"
          : "relative rounded-2xl border border-white/7 bg-[#13131f] p-6"
      }
    >
      {badge ? (
        <span className="absolute -top-3 right-6 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-bold text-[#0b0b12]">
          {badge}
        </span>
      ) : null}

      <p className="text-lg font-semibold text-white">{name}</p>

      <div className="mt-4">
        {price !== null ? (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white">{price}</span>
            {period ? <span className="text-sm text-slate-500">{period}</span> : null}
          </div>
        ) : (
          <span className="text-2xl font-extrabold text-slate-400">تماس با ما</span>
        )}
      </div>

      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
            <Check className="h-4 w-4 shrink-0 text-amber-400" />
            {f}
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        className={
          highlighted
            ? "mt-8 block w-full rounded-full bg-amber-500 py-3 text-center text-sm font-bold text-[#0b0b12] transition hover:opacity-90"
            : "mt-8 block w-full rounded-full border border-white/10 bg-white/6 py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
        }
      >
        {cta}
      </a>
    </div>
  );
}

/* ─── Landing footer ─── */

const FOOTER_LINKS = [
  {
    title: "محصول",
    items: [
      { label: "امکانات", href: "#features" },
      { label: "قیمت‌گذاری", href: "#pricing" },
      { label: "نمونه آکادمی‌ها", href: "#examples" },
    ],
  },
  {
    title: "شرکت",
    items: [
      { label: "درباره ما", href: "#about" },
      { label: "وبلاگ", href: "/blog" },
      { label: "تماس با ما", href: "/contact" },
    ],
  },
  {
    title: "پشتیبانی",
    items: [
      { label: "مرکز راهنما", href: "/support" },
      { label: "شرایط استفاده", href: "/legal/terms" },
      { label: "حریم خصوصی", href: "/legal/privacy" },
    ],
  },
];

function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#0b0b12] px-4 pt-16 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-bold text-white transition hover:text-amber-400">
              وب آکادمی
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              بهترین پلتفرم برای ساخت آکادمی آنلاین با برند خودت.
            </p>
          </div>

          {/* link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-sm font-semibold text-white">{col.title}</p>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-slate-500 transition hover:text-white"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-sm text-slate-600">
            &copy; {new Date().getFullYear()} وب آکادمی. تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-5">
            <a href="/legal/terms" className="text-sm text-slate-600 transition hover:text-white">
              شرایط استفاده
            </a>
            <a href="/legal/privacy" className="text-sm text-slate-600 transition hover:text-white">
              حریم خصوصی
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Marquee ─── */

function MarqueeStrip({ names }: { names: string[] }) {
  const doubled = [...names, ...names];
  return (
    <div className="flex overflow-hidden" dir="ltr">
      <div className="lp-marquee-strip flex shrink-0 gap-10">
        {doubled.map((item, i) => (
          <span key={i} className="whitespace-nowrap text-sm text-slate-500">
            {item}
            <span className="mx-3 text-amber-600/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main export ─── */

const EXAMPLE_PALETTES = [
  { bgColor: "#0a1f15", accentColor: "#4ade80" },
  { bgColor: "#1f1205", accentColor: "#f59e0b" },
  { bgColor: "#07091e", accentColor: "#818cf8" },
  { bgColor: "#1a0a1e", accentColor: "#e879f9" },
  { bgColor: "#0d1a10", accentColor: "#34d399" },
];

export function PlatformLandingPage({ adminLoginUrl, adminRegisterUrl, academies }: Props) {
  const [email, setEmail] = useState("");

  const marqueeNames = academies.length > 0
    ? academies.map((a) => a.name)
    : MARQUEE_ITEMS;

  const exampleAcademies = academies.slice(0, 3);

  return (
    <div dir="rtl" className="relative z-10 min-h-screen bg-[#0b0b12] text-white">
      <LandingHeader adminLoginUrl={adminLoginUrl} />

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden px-4 pb-0 pt-16 sm:px-6 lg:px-8">
        {/* ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-[15%] right-0 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.07)_0%,transparent_65%)]"
        />

        <div className="relative mx-auto max-w-7xl">
          {/* badge */}
          <div className="mb-8 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/22 bg-amber-500/8 px-4 py-1.5 text-sm font-medium text-amber-300">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              بهترین ابزار آکادمی‌سازی ایران
            </span>
          </div>

          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* text — right side in RTL */}
            <div className="text-center lg:text-right">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                آکادمی آنلاین
                <br />
                خودت را با
                <br />
                <span className="text-amber-400">برند خودت</span> بساز
              </h1>

              <p className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg">
                دوره‌هایت را بفروش، دانشجو جذب کن و درآمد پایدار بساز —
                <br className="hidden sm:block" />
                بدون نیاز به دانش فنی. فقط ایده‌ات را بیاور.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <a
                  href={adminRegisterUrl}
                  className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-3.5 text-base font-bold text-[#0b0b12] transition hover:opacity-90"
                >
                  همین حالا شروع کن
                </a>
                <a
                  href="#examples"
                  className="inline-flex items-center gap-2 text-slate-300 transition hover:text-white"
                >
                  ببینید با نمونه
                  <ArrowLeft className="h-4 w-4" />
                </a>
              </div>

              {/* stats */}
              <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/7 pt-8">
                {[
                  { value: "۱۴ میلیارد", label: "بهترین نرم‌افزار", amber: true },
                  { value: "۸۵,۰۰۰+", label: "دانشجوی فعال", amber: false },
                  { value: academies.length > 0 ? `${academies.length.toLocaleString("fa-IR")}+` : "۱,۲۰۰+", label: "آکادمی فعال", amber: false },
                ].map((stat) => (
                  <div key={stat.value}>
                    <p className={`text-xl font-extrabold sm:text-2xl ${stat.amber ? "text-amber-400" : "text-white"}`}>
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* mockup — left side in RTL */}
            <div className="flex justify-center lg:order-first lg:justify-end">
              <HeroMockup />
            </div>
          </div>
        </div>

        {/* marquee ticker */}
        <div className="mt-20 overflow-hidden border-y border-white/5 bg-white/1.5 py-4">
          <MarqueeStrip names={marqueeNames} />
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <SectionLabel>امکانات</SectionLabel>
            <SectionHeading>همه چیزی که نیاز داری، اینجاست</SectionHeading>
            <SectionSubtitle>
              از طراحی تا فروش — تمام ابزارهای لازم برای ساخت یک آکادمی حرفه‌ای در یک جا
            </SectionSubtitle>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/7 bg-[#13131f] p-6 transition hover:-translate-y-0.5"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                    <Icon className="h-5 w-5 text-amber-400" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ EXAMPLES ══ */}
      <section id="examples" className="bg-white/1.5 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <SectionLabel>نمونه آکادمی‌ها</SectionLabel>
            <SectionHeading>ببین چه می‌توانی بسازی</SectionHeading>
            <SectionSubtitle>
              آکادمی‌های واقعی در حوزه‌های مختلف — همه ساخته‌شده با وب‌آکادمی
            </SectionSubtitle>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exampleAcademies.length > 0
              ? exampleAcademies.map((academy, i) => {
                  const palette = EXAMPLE_PALETTES[i % EXAMPLE_PALETTES.length];
                  const slug = academy.slug ?? String(academy.id);
                  const href = buildAcademyPath(slug, "/");
                  const domain =
                    academy.domain?.public_address ??
                    academy.domain?.private_address ??
                    slug;
                  return (
                    <AcademyExampleCard
                      key={academy.id}
                      name={academy.name}
                      domain={domain}
                      href={href}
                      palette={palette}
                    />
                  );
                })
              : EXAMPLES.map((example) => (
                  <ExampleCard key={example.title} example={example} />
                ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <SectionLabel>قیمت‌گذاری</SectionLabel>
            <SectionHeading>شروع رایگان، رشد بی‌محدود</SectionHeading>
            <SectionSubtitle>
              پلنی که مناسب شماست را انتخاب کنید. هیچ کمیسیونی از فروش شما نمی‌گیریم.
            </SectionSubtitle>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
            <PricingCard
              name="رایگان"
              price="۰"
              period="رایگان"
              features={FREE_FEATURES}
              cta="شروع رایگان"
              ctaHref={adminRegisterUrl}
              highlighted={false}
              badge={null}
            />
            <PricingCard
              name="حرفه‌ای"
              price="۲۹۰,۰۰۰"
              period="تومان / ماه"
              features={PRO_FEATURES}
              cta="همین حالا شروع کن"
              ctaHref={adminRegisterUrl}
              highlighted={true}
              badge="محبوب‌ترین"
            />
            <PricingCard
              name="سفارشی"
              price={null}
              period={null}
              features={CUSTOM_FEATURES}
              cta="تماس با ما"
              ctaHref={`${adminLoginUrl}?plan=custom`}
              highlighted={false}
              badge={null}
            />
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}

      <section id="about" className="bg-white/1.5 px-4 py-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-extrabold leading-snug sm:text-5xl">
            آکادمی شما.
            <br />
            برند شما.
            <br />
            <span className="text-amber-400">درآمد شما.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg text-slate-400">
            از صفر تا ۱۵ دقیقه آکادمی آنلاین بسازید. بدون نیاز به دانش فنی، بدون هزینه اولیه.
          </p>
          <form
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            onSubmit={(e) => {
              e.preventDefault();
              const url = email
                ? `${adminRegisterUrl}?email=${encodeURIComponent(email)}`
                : adminRegisterUrl;
              window.location.href = url;
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ایمیل خود را وارد کنید"
              className="w-full rounded-full border border-white/10 bg-[#1a1a28] px-5 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 sm:w-72"
              dir="rtl"
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-8 py-3.5 text-sm font-bold text-[#0b0b12] transition hover:opacity-90 sm:w-auto"
            >
              شروع کن
            </button>
          </form>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
