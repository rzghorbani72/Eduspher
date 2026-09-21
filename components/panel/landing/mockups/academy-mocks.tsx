import { cn } from '@/lib/utils';

import { LANDING } from '../landing.messages';
import { AvatarDot } from './persona-mocks';

const M = LANDING.academy;

export function AcademyTeachersMock() {
  return (
    <>
      <div className="text-lp-faint-2 flex items-center justify-between pb-2 text-[10px]">
        <span>{M.teachers.head[0]}</span>
        <span>{M.teachers.head[1]}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {M.teachers.rows.map((row, index) => (
          <div
            key={row.name}
            className="border-lp-line-soft flex items-center gap-2.5 rounded-xl border bg-white px-2.5 py-2"
          >
            <AvatarDot index={index} />
            <span className="text-[11.5px] font-semibold">{row.name}</span>
            <span className="ms-auto text-[10.5px] font-bold">{row.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Mark({ on }: { on: boolean }) {
  return on ? (
    <span className="text-lp-green text-center font-bold">✓</span>
  ) : (
    <span className="text-lp-faint-4 text-center">—</span>
  );
}

export function AcademyRolesMock() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_38px_38px] items-center gap-y-2 text-[10.5px]">
      <span className="text-lp-faint-2">{M.roles.head[0]}</span>
      <span className="text-lp-faint-2 text-center font-bold">{M.roles.head[1]}</span>
      <span className="text-lp-faint-2 text-center font-bold">{M.roles.head[2]}</span>
      {M.roles.rows.map((row) => (
        <div key={row.label} className="contents">
          <span>{row.label}</span>
          <Mark on={row.teacher} />
          <Mark on={row.clerk} />
        </div>
      ))}
    </div>
  );
}

export function AcademyMultiMock() {
  return (
    <>
      <div className="border-lp-blue-2 flex items-center gap-2.5 rounded-xl border-[1.5px] bg-white px-3 py-2.5">
        <span className="bg-lp-navy size-5 rounded-[7px]" />
        <span className="text-[12px] font-extrabold">{M.multi.current}</span>
        <span className="text-lp-faint ms-auto text-[10px]">▾</span>
      </div>
      <div className="border-lp-ink/8 mt-1.5 flex flex-col rounded-xl border bg-white p-1.5">
        {M.multi.others.map((name, index) => (
          <div
            key={name}
            className="text-lp-muted flex items-center gap-2.5 rounded-lg px-2 py-2 text-[11.5px]"
          >
            <span
              className={cn(
                'size-[18px] rounded-md',
                index === 0 ? 'bg-lp-blue-soft' : 'bg-lp-mint-soft',
              )}
            />
            {name}
          </div>
        ))}
        <div className="text-lp-blue border-lp-line-soft mt-1 flex items-center gap-2 rounded-lg border-t px-2 py-2 text-[11.5px] font-bold">
          {M.multi.add}
        </div>
      </div>
    </>
  );
}
