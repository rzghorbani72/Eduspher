import { cn } from '@/lib/utils';

import { LANDING } from '../landing.messages';
import { MockFrame } from '../mock-frame';

const M = LANDING.students.table;

export function StudentsTableMock() {
  return (
    <MockFrame title={M.title} dots={0} className="shadow-lp-frame-sm rounded-[20px]">
      <div className="lp-rail overflow-x-auto">
        <table className="w-full min-w-[380px] border-collapse">
          <thead>
            <tr className="bg-lp-bar-2">
              {M.head.map((head) => (
                <th key={head} className="text-lp-faint p-3.5 text-start text-[11px] font-bold">
                  {head}
                </th>
              ))}
              <th className="p-3.5" />
            </tr>
          </thead>
          <tbody>
            {M.rows.map((row, index) => (
              <tr
                key={row.name}
                className={cn('border-lp-ink/6 border-t', index === 2 && 'bg-lp-bar-2')}
              >
                <td className="p-3.5 text-[12.5px] font-bold">{row.name}</td>
                <td className="text-lp-muted p-3.5 text-[12.5px]">{row.courses}</td>
                <td className="p-3.5 text-end">
                  <span
                    className={cn(
                      'rounded-lg px-2.5 py-1.5 text-[11px]',
                      row.active
                        ? 'text-lp-red-2 border border-[rgba(178,47,47,.3)] font-bold'
                        : 'bg-lp-mint text-lp-on-mint font-extrabold',
                    )}
                  >
                    {row.active ? M.revoke : M.grant}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockFrame>
  );
}
