import { LANDING } from '../landing.messages';

const M = LANDING.live.room;
const tile = 'bg-lp-navy-4 h-[54px] rounded-xl border border-white/7';

export function LiveRoomMock() {
  return (
    <div className="bg-lp-navy overflow-hidden rounded-[20px] shadow-[0_30px_60px_-36px_rgba(11,26,46,.8)]">
      <div className="bg-lp-navy-3 flex h-9 items-center gap-[9px] px-[13px]">
        <span className="lp-live bg-lp-red size-2 rounded-full" />
        <span className="text-lp-sky text-[10px]">{M.title}</span>
        <span className="text-lp-sky-2 ms-auto text-[10px]">{M.timer}</span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_184px] gap-3 p-3.5">
        <div className="grid gap-2.5">
          <div className="bg-lp-navy-4 relative grid h-[186px] place-items-center rounded-2xl border border-white/7">
            <span className="bg-lp-navy-5 size-[54px] rounded-full" />
            <span className="text-lp-sky absolute start-[13px] bottom-[11px] text-[11px] font-semibold">
              {M.teacher}
            </span>
            <span className="bg-lp-mint text-lp-on-mint absolute end-[13px] top-[11px] rounded-lg px-2 py-1 text-[9.5px] font-extrabold">
              {M.board}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            <div className={tile} />
            <div className={tile} />
            <div className={tile} />
            <div className={`${tile} text-lp-sky-2 grid place-items-center text-[11px] font-bold`}>
              {M.more}
            </div>
          </div>
          <div className="bg-lp-navy-3 flex flex-wrap items-center justify-center gap-2 rounded-2xl p-2.5">
            {M.controls.map((control) => (
              <span
                key={control}
                className="bg-lp-navy-5 text-lp-sky-4 rounded-lg px-3 py-1.5 text-[10.5px] font-semibold"
              >
                {control}
              </span>
            ))}
            <span className="bg-lp-red rounded-lg px-3 py-1.5 text-[10.5px] font-extrabold text-white">
              {M.end}
            </span>
          </div>
        </div>
        <div className="bg-lp-navy-3 rounded-2xl p-3">
          <div className="text-lp-sky text-[10.5px] font-extrabold">{M.chatTitle}</div>
          <div className="mt-2.5 flex flex-col gap-2">
            {M.chat.map((line) => (
              <div
                key={line}
                className="bg-lp-navy-6 text-lp-sky rounded-xl px-2.5 py-2 text-[10.5px]"
              >
                {line}
              </div>
            ))}
            <div className="bg-lp-navy-green rounded-xl px-2.5 py-2 text-[10.5px] text-[#9df0d0]">
              {M.chatTeacher}
            </div>
          </div>
          <div className="bg-lp-navy-6 mt-3 rounded-xl px-2.5 py-2 text-[10px] text-[#7c8ba3]">
            {M.chatInput}
          </div>
        </div>
      </div>
    </div>
  );
}
