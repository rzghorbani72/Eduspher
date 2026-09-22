import { LANDING } from './landing.messages';

const M = LANDING.domain;

export function DomainSection() {
  return (
    <section id="domain" className="bg-lp-surface-2 border-lp-ink/8 border-y">
      <div className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-[27px] font-extrabold tracking-[-.015em] md:text-[38px]">
              {M.title}
            </h2>
            <p className="text-lp-muted mt-4 max-w-[520px] text-[16px] leading-loose">{M.body}</p>
            <p className="border-lp-line text-lp-muted mt-6 flex items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 text-[13.5px] leading-[1.95]">
              <span className="bg-lp-blue-2 mt-[7px] size-[7px] shrink-0 rounded-sm" />
              {M.note}
            </p>
          </div>
          <div className="grid gap-3">
            <div className="border-lp-mint rounded-[18px] border-[1.5px] bg-white p-4">
              <div className="text-lp-green-2 text-[11.5px] font-extrabold">{M.custom.title}</div>
              <div className="bg-lp-mint-tint mt-2.5 flex items-center gap-2.5 rounded-xl px-3 py-3">
                <span className="bg-lp-green size-[7px] rounded-full" />
                <span dir="ltr" className="text-[13.5px] font-bold">
                  {M.custom.value}
                </span>
              </div>
              <div className="text-lp-faint mt-2.5 text-[11.5px]">{M.custom.meta}</div>
            </div>
            <div className="border-lp-line rounded-[18px] border bg-white p-4">
              <div className="text-lp-muted text-[11.5px] font-extrabold">{M.fallback.title}</div>
              <div className="bg-lp-surface-3 mt-2.5 flex items-center gap-2.5 rounded-xl px-3 py-3">
                <span className="bg-lp-faint-4 size-[7px] rounded-full" />
                <span dir="ltr" className="text-[13.5px] font-bold">
                  {M.fallback.value}
                </span>
              </div>
              <div className="bg-lp-surface-2 text-lp-faint mt-3 rounded-xl px-3 py-2.5 text-center text-[10.5px]">
                {M.fallback.badge}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
