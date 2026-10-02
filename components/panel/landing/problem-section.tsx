import { LANDING } from './landing.messages';

const M = LANDING.problem;
const card = 'rounded-[18px] border border-white/10 bg-white/[.045] p-5';
const text = 'text-lp-sky-4 mt-5 text-[14.5px] leading-[1.95]';
const bubble = 'w-fit rounded-2xl px-3 py-2 text-[11px]';

export function ProblemSection() {
  return (
    <section id="problem" className="bg-lp-navy text-white">
      <div className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
        <h2 className="mt-6 text-[27px] font-extrabold tracking-[-.015em] md:text-[40px]">
          {M.title}
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className={card}>
            <div className="flex min-h-[92px] flex-col gap-1.5">
              <div className={`${bubble} text-lp-sky rounded-se-md bg-white/10`}>{M.chat.a}</div>
              <div dir="ltr" className={`${bubble} text-lp-sky rounded-se-md bg-white/10`}>
                {M.chat.b}
              </div>
              <div className={`${bubble} bg-lp-mint-soft text-lp-green-2 ms-auto rounded-ss-md`}>
                {M.chat.reply}
              </div>
            </div>
            <p className={text}>{M.chatText}</p>
          </article>
          <article className={card}>
            <div className="grid min-h-[92px] grid-cols-4 content-start gap-1.5">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-[25px] rounded-md bg-white/9" />
              ))}
              <div className="col-span-2 grid h-[25px] place-items-center rounded-md bg-[rgba(255,107,107,.18)] text-[10px] font-bold text-[#ffb3b3]">
                {M.revoke}
              </div>
            </div>
            <p className={text}>{M.revokeText}</p>
          </article>
          <article className={card}>
            <div className="min-h-[92px]">
              <div className="rounded-2xl border border-dashed border-white/22 p-3.5">
                <div className="text-lp-sky-2 text-[10px]">{M.dev.label}</div>
                <div className="text-lp-sky-4 mt-2 text-[11.5px] leading-[1.85]">
                  {M.dev.message}
                </div>
                <div className="mt-2.5 text-[10.5px] font-bold text-[#ffb3b3]">{M.dev.later}</div>
              </div>
            </div>
            <p className={text}>{M.devText}</p>
          </article>
          <article className={card}>
            <div className="grid min-h-[92px] grid-cols-2 content-start gap-2">
              {M.tools.map((tool) => (
                <div
                  key={tool}
                  className="text-lp-sky grid h-10 place-items-center rounded-xl bg-white/7 text-[11px] font-semibold"
                >
                  {tool}
                </div>
              ))}
            </div>
            <p className={text}>{M.toolsText}</p>
          </article>
        </div>
        <p className="mt-10 text-[20px] font-extrabold tracking-tight md:text-[26px]">
          {M.closingLead}
          <span className="text-lp-mint">{M.closingStrong}</span>
          {M.closingTail}
        </p>
      </div>
    </section>
  );
}
