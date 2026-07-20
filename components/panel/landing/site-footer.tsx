import { Instagram, Linkedin, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  telegram: Send,
  linkedin: Linkedin,
};

export function SiteFooter() {
  return (
    <footer className="border-t border-lp-line bg-lp-surface py-16">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-16">
          <div>
            <div className="flex items-center gap-4">
              <Image
                src="/logo-mark.svg"
                alt=""
                width={38}
                height={38}
                className="h-[38px] w-[38px]"
              />
              <Image
                src="/logo-type.svg"
                alt=""
                width={52}
                height={16}
                className="h-4 w-[52px]"
              />
            </div>

            <p className="mt-5 max-w-[330px] text-[13.5px] leading-[1.95] text-lp-muted">
              {LANDING.footer.tagline}
            </p>

            <ul className="mt-6 flex items-center gap-3">
              {LANDING.footer.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.id] ?? Send;
                return (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      className="grid h-9 w-9 place-items-center rounded-full border border-lp-line text-lp-muted transition-colors hover:border-lp-mint/50 hover:text-lp-ink"
                    >
                      <Icon size={15} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {LANDING.footer.columns.map((column) => (
            <nav key={column.title}>
              <h3 className="text-[13px] font-bold text-lp-ink">
                {column.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-[13.5px] text-lp-muted transition-colors hover:text-lp-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col-reverse items-center justify-between gap-3 border-t border-lp-line pt-6 text-[12.5px] text-lp-muted sm:flex-row">
          <span>{LANDING.footer.madeIn}</span>
          <span>© ۱۴۰۴ {LANDING.footer.rights}</span>
        </div>
      </Container>
    </footer>
  );
}
