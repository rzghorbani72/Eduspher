import { cn } from '@/lib/utils';

import { LANDING } from '../landing.messages';

const T = LANDING.personas.teacher;
const A = LANDING.personas.academy;

export function PersonaTeacherMock() {
  return (
    <div className="bg-lp-surface-3 border-lp-line-soft mt-5 rounded-2xl border p-3.5">
      <div className="text-lp-faint flex items-center justify-between text-[11px]">
        <span>{T.mockTitle}</span>
        <span>{T.mockMeta}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {T.stats.map((stat) => (
          <div
            key={stat.label}
            className="border-lp-line-soft rounded-xl border bg-white p-2.5 text-center"
          >
            <div className="text-[16px] font-extrabold">{stat.value}</div>
            <div className="text-lp-faint text-[9.5px]">{stat.label}</div>
          </div>
        ))}
        <div className="bg-lp-mint-soft rounded-xl border border-[rgba(10,127,92,.14)] p-2.5 text-center">
          <div className="text-lp-green text-[16px] font-extrabold">{T.commission.value}</div>
          <div className="text-lp-green-2 text-[9.5px]">{T.commission.label}</div>
        </div>
      </div>
    </div>
  );
}

/** Avatar dots alternate blue / mint, like every roster in the design. */
export function AvatarDot({ index, size = 18 }: { index: number; size?: number }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full',
        index % 2 === 0 ? 'bg-lp-blue-soft' : 'bg-lp-mint-soft',
      )}
      style={{ width: size, height: size }}
    />
  );
}

export function PersonaAcademyMock() {
  return (
    <div className="bg-lp-surface-3 border-lp-line-soft mt-5 rounded-2xl border p-3.5">
      <div className="text-lp-faint flex items-center justify-between text-[11px]">
        <span>{A.mockTitle}</span>
        <span>{A.mockMeta}</span>
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        {A.teachers.map((teacher, index) => (
          <div
            key={teacher.name}
            className="border-lp-line-soft flex items-center gap-2.5 rounded-xl border bg-white px-2.5 py-2"
          >
            <AvatarDot index={index} />
            <span className="text-[11.5px] font-semibold">{teacher.name}</span>
            <span className="text-lp-faint ms-auto text-[10px]">{teacher.meta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
