import { cn } from '@/lib/utils';

import { LANDING } from '../landing.messages';
import { MockFrame } from '../mock-frame';

const M = LANDING.courses.mock;

export function CourseMock() {
  return (
    <MockFrame title={M.crumb} dots={0} className="shadow-lp-frame-sm rounded-[20px]">
      <div className="grid gap-4 p-4 md:grid-cols-2">
        <div>
          <div className="lp-stripe border-lp-line-soft h-28 rounded-2xl border [--lp-stripe-s:7px]" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="bg-lp-mint-soft text-lp-on-mint rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold">
              {M.tags.paid}
            </span>
            <span className="bg-lp-surface-2 text-lp-muted rounded-lg px-2.5 py-1.5 text-[11px] font-semibold">
              {M.tags.price}
            </span>
            <span className="bg-lp-blue-soft text-lp-blue rounded-lg px-2.5 py-1.5 text-[11px] font-semibold">
              {M.tags.coupon}
            </span>
          </div>
          <div className="mt-3.5 flex flex-col gap-1.5">
            {M.lessons.map((lesson) => (
              <div
                key={lesson.name}
                className="border-lp-ink/8 flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[12px]"
              >
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    lesson.done ? 'bg-lp-green' : 'bg-lp-faint-4',
                  )}
                />
                {lesson.name}
                <span className="text-lp-faint ms-auto text-[10.5px]">{lesson.meta}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-lp-surface-3 border-lp-line-soft rounded-2xl border p-3.5">
          <div className="text-[12px] font-extrabold">{M.uploadTitle}</div>
          <div className="border-lp-blue-2/45 mt-3 grid place-items-center rounded-2xl border-[1.5px] border-dashed bg-white p-5 text-center">
            <div className="text-lp-blue text-[11.5px] font-bold">{M.dropTitle}</div>
            <div className="text-lp-faint mt-1 text-[10px]">{M.dropMeta}</div>
          </div>
          <div className="text-lp-muted mt-3.5 text-[10.5px]">{M.uploading}</div>
          <div className="bg-lp-track mt-1.5 h-1.5 overflow-hidden rounded-full">
            <div className="bg-lp-mint h-full" style={{ width: `${M.progressWidth}%` }} />
          </div>
          <div className="text-lp-faint mt-1.5 text-[10px]">{M.progress}</div>
          <div className="bg-lp-mint-soft mt-3.5 flex items-start gap-2.5 rounded-xl border border-[rgba(10,127,92,.2)] p-3">
            <span className="text-lp-green text-[12px] font-bold">◆</span>
            <div>
              <div className="text-lp-on-mint text-[11px] font-extrabold">{M.secureTitle}</div>
              <div className="mt-1 text-[10px] leading-[1.9] text-[#0a5c43]">{M.secureBody}</div>
            </div>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}
