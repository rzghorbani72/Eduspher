import { cn } from '@/lib/utils';

import { LANDING } from '../landing.messages';
import { MockFrame } from '../mock-frame';

const M = LANDING.features.editor;

export function SiteEditorMock() {
  return (
    <MockFrame title={M.title} className="shadow-lp-frame rounded-[20px]">
      <div className="grid grid-cols-[minmax(0,196px)_minmax(0,1fr)]">
        <aside className="bg-lp-bar-2 border-lp-ink/6 border-s px-3 py-3.5">
          <div className="text-lp-faint-2 text-[10px]">{M.sectionsLabel}</div>
          <div className="mt-2.5 flex flex-col gap-2">
            <div className="bg-lp-mint-tint border-lp-mint text-lp-on-mint rounded-xl border-[1.5px] px-2.5 py-2 text-[11.5px] font-extrabold">
              {M.active}
            </div>
            {M.sections.map((section) => (
              <div
                key={section}
                className="border-lp-ink/8 text-lp-muted rounded-xl border bg-white px-2.5 py-2 text-[11.5px]"
              >
                {section}
              </div>
            ))}
          </div>
          <div className="border-lp-blue-2/50 mt-4 rounded-2xl border border-dashed bg-white p-2.5">
            <div className="text-lp-blue text-[10px] font-extrabold">{M.swapTitle}</div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <div className="bg-lp-track border-lp-blue-2 h-[26px] rounded-lg border-[1.5px]" />
              <div className="bg-lp-stripe h-[26px] rounded-lg" />
              <div className="bg-lp-stripe h-[26px] rounded-lg" />
            </div>
            <div className="text-lp-faint mt-2 text-[9px]">{M.swapMeta}</div>
          </div>
        </aside>
        <div className="bg-lp-surface-4 p-4">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-lp-faint text-[10px]">{M.preview}</span>
            <span className="bg-lp-mint-soft text-lp-on-mint ms-auto rounded-lg px-2 py-1 text-[9.5px] font-extrabold">
              {M.autosave}
            </span>
          </div>
          <div className="border-lp-ink/8 overflow-hidden rounded-2xl border bg-white">
            <div className="from-lp-navy to-lp-navy-2 bg-linear-115 p-4 text-white">
              <div className="text-[14px] font-extrabold">{M.siteName}</div>
              <div className="text-lp-sky-2 mt-1.5 text-[10.5px]">{M.siteTagline}</div>
              <div className="bg-lp-mint text-lp-on-mint mt-3.5 w-fit rounded-lg px-3 py-1.5 text-[10.5px] font-extrabold">
                {M.siteCta}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5 p-3.5">
              {M.courses.map((course) => (
                <div key={course.name} className="border-lp-ink/8 rounded-xl border p-2">
                  <div className="lp-stripe h-11 rounded-lg" />
                  <div className="text-lp-muted mt-2 text-[9.5px]">{course.name}</div>
                  <div
                    className={cn('text-[9.5px] font-extrabold', course.free && 'text-lp-green')}
                  >
                    {course.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}
