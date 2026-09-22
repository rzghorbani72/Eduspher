import { FlowRail } from './flow-rail';
import { LANDING } from './landing.messages';
import { LiveRoomMock } from './mockups/live-room-mock';

const M = LANDING.live;

function PhoneMock() {
  return (
    <div className="border-lp-navy mx-auto w-[238px] overflow-hidden rounded-[28px] border-8 bg-white shadow-[0_26px_50px_-30px_rgba(11,26,46,.7)] lg:mx-0">
      <div className="bg-lp-navy h-5" />
      <div className="bg-lp-surface-4 min-h-[246px] p-3.5">
        <div className="text-lp-faint text-[10px]">{M.phone.smsLabel}</div>
        <div className="border-lp-ink/8 mt-2 rounded-2xl rounded-se-md border bg-white p-3.5 text-[11.5px] leading-loose">
          {M.phone.sms}
        </div>
        <div className="bg-lp-mint-soft mt-3 rounded-2xl p-3.5">
          <div className="text-lp-on-mint text-[10.5px] font-extrabold">{M.phone.pushTitle}</div>
          <div className="text-lp-green-2 mt-1 text-[10.5px]">{M.phone.pushBody}</div>
        </div>
      </div>
    </div>
  );
}

export function LiveSection() {
  return (
    <section id="live" className="mx-auto max-w-[1180px] px-5 py-16 md:px-7 md:py-24">
      <h2 className="mt-6 text-[27px] font-extrabold tracking-[-.015em] md:text-[40px]">
        {M.title}
      </h2>
      <p className="text-lp-muted mt-4 max-w-[660px] text-[16px] leading-loose">{M.subtitle}</p>
      <FlowRail
        steps={[...M.flow, M.flowLast]}
        active={M.flow.length}
        className="mt-7 hidden md:block"
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,250px)] lg:items-start">
        <LiveRoomMock />
        <PhoneMock />
      </div>
    </section>
  );
}
