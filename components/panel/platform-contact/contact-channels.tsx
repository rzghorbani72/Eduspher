import { AlertTriangle, Clock, Mail, Phone } from 'lucide-react';

import { CONTACT } from './contact.messages';

type Props = {
  panelSupportUrl: string;
  studentSupportUrl: string;
};

const cardClass = 'rounded-2xl border border-lp-line bg-white p-5';

/**
 * The channels beside the form are deliberately ranked: email is an equal
 * alternative, the phone is framed as the exception (urgent / outage) so the
 * queue stays in the ticket system where every request is tracked.
 */
export function ContactChannels({ panelSupportUrl, studentSupportUrl }: Props) {
  return (
    <aside className="flex flex-col gap-4">
      <h2 className="text-lp-ink-2 text-[15px] font-bold">{CONTACT.channels.title}</h2>

      <a href={`mailto:${CONTACT.channels.emailValue}`} className={cardClass}>
        <div className="flex items-center gap-3">
          <span className="bg-lp-mint/20 text-lp-ink grid h-11 w-11 shrink-0 place-items-center rounded-xl">
            <Mail size={19} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-lp-muted text-xs">{CONTACT.channels.emailLabel}</div>
            <div dir="ltr" className="text-lp-ink truncate text-start font-bold">
              {CONTACT.channels.emailValue}
            </div>
          </div>
        </div>
        <p className="text-lp-muted mt-3 text-[13px] leading-[1.85]">
          {CONTACT.channels.emailHint}
        </p>
      </a>

      <a href={CONTACT.channels.phoneHref} className={`${cardClass} border-dashed opacity-90`}>
        <div className="flex items-center gap-3">
          <span className="border-lp-line text-lp-muted grid h-11 w-11 shrink-0 place-items-center rounded-xl border">
            <Phone size={19} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-lp-muted text-xs">{CONTACT.channels.phoneLabel}</div>
            <div className="text-lp-ink-2 truncate font-bold">{CONTACT.channels.phoneValue}</div>
          </div>
        </div>
        <p className="text-lp-muted mt-3 flex items-start gap-2 text-[13px] leading-[1.85]">
          <AlertTriangle size={15} aria-hidden="true" className="mt-1 shrink-0" />
          {CONTACT.channels.phoneHint}
        </p>
      </a>

      <div className={cardClass}>
        <div className="text-lp-ink flex items-center gap-2 text-[14px] font-bold">
          <Clock size={16} aria-hidden="true" />
          {CONTACT.channels.responseTitle}
        </div>
        <p className="text-lp-muted mt-2 text-[13px] leading-[1.85]">
          {CONTACT.channels.responseBody}
        </p>
      </div>

      <div className="border-lp-mint/30 bg-lp-mint/10 rounded-2xl border p-5">
        <div className="text-lp-ink text-[14px] font-bold">{CONTACT.loggedIn.title}</div>
        <p className="text-lp-muted mt-2 text-[13px] leading-[1.85]">{CONTACT.loggedIn.body}</p>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={panelSupportUrl}
            className="bg-lp-mint text-lp-ink flex h-11 items-center justify-center rounded-full px-4 text-[13px] font-bold"
          >
            {CONTACT.loggedIn.panelCta}
          </a>
          <a
            href={studentSupportUrl}
            className="border-lp-line-2 text-lp-ink flex h-11 items-center justify-center rounded-full border px-4 text-[13px] font-semibold"
          >
            {CONTACT.loggedIn.studentCta}
          </a>
        </div>
      </div>
    </aside>
  );
}
