import { LANDING } from './landing.messages';

const M = LANDING.pricing;

export function PricingNotes() {
  return (
    <>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {M.notes.map((note) => (
          <div
            key={note.title}
            className="bg-lp-surface-2 border-lp-ink/8 rounded-[20px] border p-5"
          >
            <div className="text-[15px] font-extrabold">{note.title}</div>
            <p className="text-lp-muted mt-2.5 text-[14px] leading-loose">{note.body}</p>
          </div>
        ))}
      </div>
      <div className="border-lp-line mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4">
        <p className="text-lp-muted-2 text-[13px]">{M.addons}</p>
        <p className="text-lp-blue ms-auto text-[13px] font-bold">{M.upgrade}</p>
      </div>
    </>
  );
}
