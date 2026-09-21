import { LANDING } from '../landing.messages';
import { MockFrame } from '../mock-frame';

const M = LANDING.hero.site;

/** The academy's public site, tilted behind the panel on desktop. */
export function HeroSiteMock() {
  return (
    <MockFrame title={M.domain} titleAsUrl size="sm" className="shadow-lp-frame">
      <div className="p-3.5">
        <div className="from-lp-navy to-lp-navy-2 flex h-[70px] items-center rounded-[11px] bg-linear-115 px-[13px] text-white">
          <div>
            <div className="text-[11.5px] font-extrabold">{M.name}</div>
            <div className="text-lp-sky-2 mt-1 text-[9px]">{M.tagline}</div>
          </div>
          <div className="bg-lp-mint text-lp-on-mint ms-auto rounded-[7px] px-[9px] py-[5px] text-[9px] font-extrabold">
            {M.enroll}
          </div>
        </div>
        <div className="mt-[9px] grid grid-cols-3 gap-[7px]">
          {M.courses.map((course) => (
            <div key={course} className="border-lp-ink/8 rounded-[9px] border p-[7px]">
              <div className="lp-stripe h-8 rounded-md [--lp-stripe-s:5px]" />
              <div className="text-lp-muted mt-[5px] text-[8px]">{course}</div>
            </div>
          ))}
        </div>
      </div>
    </MockFrame>
  );
}
