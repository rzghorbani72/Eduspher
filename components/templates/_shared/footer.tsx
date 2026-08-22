import { getCurrentAcademy } from '@/lib/api/server';
import { PlatformTrustBadge } from '@/components/academy/platform-trust-badge';
import { PoweredBy } from '@/components/shared/powered-by';
import { Container } from './section';
import { list, text, type SectionConfig } from './types';

export interface FooterColumn {
  title: string;
  links: readonly { label: string; href: string }[];
}

export interface FooterContact {
  label: string;
  href?: string;
}

interface TemplateFooterProps {
  id?: string;
  config?: SectionConfig;
  defaults: {
    about: string;
    legal: string;
    columns?: readonly FooterColumn[];
    contact?: readonly FooterContact[];
    socials?: readonly { label: string; href: string }[];
  };
}

const DEFAULT_COLUMNS: readonly FooterColumn[] = [
  {
    title: 'آموزش',
    links: [
      { label: 'همهٔ دوره‌ها', href: '/courses' },
      { label: 'دسته‌بندی‌ها', href: '/courses' },
      { label: 'مدرسان', href: '/about' },
    ],
  },
  {
    title: 'آکادمی',
    links: [
      { label: 'دربارهٔ ما', href: '/about' },
      { label: 'تماس با ما', href: '/contact' },
      { label: 'وبلاگ', href: '/blog' },
    ],
  },
  {
    title: 'پشتیبانی',
    links: [
      { label: 'پرسش‌های پرتکرار', href: '/faq' },
      { label: 'قوانین و مقررات', href: '/legal/terms' },
      { label: 'حریم خصوصی', href: '/legal/privacy' },
    ],
  },
];

/**
 * All seven designs land on the same footer skeleton: a brand column with a
 * short "about" and social row, three link columns, and a contact column. One
 * component keeps that consistent while every label stays editable per academy.
 */
export async function TemplateSiteFooter({ id, config, defaults }: TemplateFooterProps) {
  const academy = await getCurrentAcademy().catch(() => null);
  const academyName = academy?.name ?? 'آکادمی';
  const columns = list<FooterColumn>(config, 'columns', defaults.columns ?? DEFAULT_COLUMNS);
  const contact = list<FooterContact>(config, 'contact', defaults.contact ?? []);
  const socials = list<{ label: string; href: string }>(config, 'socials', defaults.socials ?? []);
  const year = new Date().toLocaleDateString('fa-IR-u-ca-persian', { year: 'numeric' });

  return (
    <footer id={id || 'footer'} className="bg-(--theme-deep) text-(--theme-on-deep)">
      <Container className="pt-16">
        <div className="grid gap-10 pb-12 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          <div>
            <p className="text-[19px] font-bold">{academyName}</p>
            <p data-editable="about" className="mt-4 max-w-[36ch] text-[14px] leading-[1.85] text-current/62">
              {text(config, 'about', defaults.about)}
            </p>
            {socials.length > 0 ? (
              <ul className="mt-6 flex gap-2.5">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      className="grid size-9 place-items-center rounded-(--theme-border-radius) border border-current/25 text-[12px] font-bold text-current/80 hover:border-(--theme-accent) hover:text-(--theme-accent)"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-4 text-[14px] font-bold tracking-[0.1em] text-(--theme-accent)">{column.title}</h2>
              <ul className="grid gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[14px] text-current/72 hover:text-current">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {contact.length > 0 ? (
            <div>
              <h2 className="mb-4 text-[14px] font-bold tracking-[0.1em] text-(--theme-accent)">تماس</h2>
              <ul className="grid gap-2.5 text-[14px] text-current/72">
                {contact.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <a href={item.href} className="hover:text-current">
                        {item.label}
                      </a>
                    ) : (
                      item.label
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-current/14 py-6 text-[13px] text-current/55">
          <span>
            © {year} {academyName}. <span data-editable="legal">{text(config, 'legal', defaults.legal)}</span>
          </span>
          <PoweredBy />
          {academy?.slug ? (
            <PlatformTrustBadge slug={academy.slug} academyId={academy.id} />
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
