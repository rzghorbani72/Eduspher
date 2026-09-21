import { LANDING } from '../landing.messages';

const M = LANDING.hero.editor;

/** Small floating "site editor" card at the hero's bottom corner. */
export function HeroEditorMock() {
  return (
    <div className="border-lp-line overflow-hidden rounded-[14px] border bg-white shadow-[0_26px_50px_-26px_rgba(11,26,46,.5)]">
      <div className="bg-lp-bar border-lp-ink/6 text-lp-faint flex h-[25px] items-center border-b px-2.5 text-[9px]">
        {M.title}
      </div>
      <div className="flex flex-col gap-1.5 p-[9px]">
        <div className="border-lp-mint bg-lp-mint-tint text-lp-green-2 rounded-lg border-[1.5px] border-dashed px-2 py-[7px] text-[9px]">
          {M.active}
        </div>
        {M.rows.map((row) => (
          <div
            key={row}
            className="border-lp-ink/8 text-lp-muted-2 rounded-lg border px-2 py-[7px] text-[9px]"
          >
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}
