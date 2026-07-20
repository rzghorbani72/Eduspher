import Image from "next/image";
import Link from "next/link";

import { Container } from "./landing-container";
import { LANDING } from "./landing.messages";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-lp-line bg-lp-surface-2 py-16">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,auto))] lg:gap-20">
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
            <p className="mt-5 max-w-[260px] text-sm leading-[1.9] text-lp-muted">
              {LANDING.footer.tagline}
            </p>
          </div>

          {LANDING.footer.columns.map((column) => (
            <nav key={column.title}>
              <h3 className="text-[13px] font-bold text-lp-ink">
                {column.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-lp-muted transition-colors hover:text-lp-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 border-t border-lp-line pt-6 text-center text-[13px] text-lp-muted">
          © {year} — {LANDING.footer.rights}
        </div>
      </Container>
    </footer>
  );
}
