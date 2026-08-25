import { AlertTriangle, Clock, Mail, Phone } from "lucide-react";

import { CONTACT } from "./contact.messages";

type Props = {
  panelSupportUrl: string;
  studentSupportUrl: string;
};

const cardClass = "rounded-2xl border border-lp-line bg-white p-5";

/**
 * The channels beside the form are deliberately ranked: email is an equal
 * alternative, the phone is framed as the exception (urgent / outage) so the
 * queue stays in the ticket system where every request is tracked.
 */
export function ContactChannels({ panelSupportUrl, studentSupportUrl }: Props) {
  return (
    <aside className="flex flex-col gap-4">
      <h2 className="text-[15px] font-bold text-lp-ink-2">
        {CONTACT.channels.title}
      </h2>

      <a href={`mailto:${CONTACT.channels.emailValue}`} className={cardClass}>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lp-mint/20 text-lp-ink">
            <Mail size={19} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-xs text-lp-muted">
              {CONTACT.channels.emailLabel}
            </div>
            <div
              dir="ltr"
              className="truncate text-start font-bold text-lp-ink"
            >
              {CONTACT.channels.emailValue}
            </div>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-[1.85] text-lp-muted">
          {CONTACT.channels.emailHint}
        </p>
      </a>

      <a
        href={CONTACT.channels.phoneHref}
        className={`${cardClass} border-dashed opacity-90`}
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-lp-line text-lp-muted">
            <Phone size={19} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-xs text-lp-muted">
              {CONTACT.channels.phoneLabel}
            </div>
            <div className="truncate font-bold text-lp-ink-2">
              {CONTACT.channels.phoneValue}
            </div>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-2 text-[13px] leading-[1.85] text-lp-muted">
          <AlertTriangle
            size={15}
            aria-hidden="true"
            className="mt-1 shrink-0"
          />
          {CONTACT.channels.phoneHint}
        </p>
      </a>

      <div className={cardClass}>
        <div className="flex items-center gap-2 text-[14px] font-bold text-lp-ink">
          <Clock size={16} aria-hidden="true" />
          {CONTACT.channels.responseTitle}
        </div>
        <p className="mt-2 text-[13px] leading-[1.85] text-lp-muted">
          {CONTACT.channels.responseBody}
        </p>
      </div>

      <div className="rounded-2xl border border-lp-mint/30 bg-lp-mint/10 p-5">
        <div className="text-[14px] font-bold text-lp-ink">
          {CONTACT.loggedIn.title}
        </div>
        <p className="mt-2 text-[13px] leading-[1.85] text-lp-muted">
          {CONTACT.loggedIn.body}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={panelSupportUrl}
            className="flex h-11 items-center justify-center rounded-full bg-lp-mint px-4 text-[13px] font-bold text-lp-ink"
          >
            {CONTACT.loggedIn.panelCta}
          </a>
          <a
            href={studentSupportUrl}
            className="flex h-11 items-center justify-center rounded-full border border-lp-line-2 px-4 text-[13px] font-semibold text-lp-ink"
          >
            {CONTACT.loggedIn.studentCta}
          </a>
        </div>
      </div>
    </aside>
  );
}
