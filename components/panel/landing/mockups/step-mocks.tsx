import { LANDING } from '../landing.messages';

const M = LANDING.steps;
const box = 'bg-lp-surface-3 border-lp-line-soft mt-4 rounded-2xl border p-3.5';

export function StepFormMock() {
  return (
    <div className={box}>
      <div className="text-lp-faint text-[10px]">{M.form.nameLabel}</div>
      <div className="border-lp-line mt-1.5 rounded-xl border bg-white px-2.5 py-2 text-[11.5px]">
        {M.form.nameValue}
        <span className="lp-caret bg-lp-blue-2 ms-0.5 inline-block h-3 w-[1.5px] align-[-2px]" />
      </div>
      <div className="text-lp-faint mt-2.5 text-[10px]">{M.form.urlLabel}</div>
      <div
        dir="ltr"
        className="border-lp-line text-lp-muted mt-1.5 rounded-xl border bg-white px-2.5 py-2 text-[11.5px]"
      >
        {M.form.urlValue}
      </div>
    </div>
  );
}

export function StepCreatedMock() {
  return (
    <div className="bg-lp-mint-tint mt-4 grid min-h-[104px] place-items-center rounded-2xl border border-[rgba(10,127,92,.14)] p-4">
      <div className="text-center">
        <div className="bg-lp-mint text-lp-on-mint mx-auto grid size-9 place-items-center rounded-full text-[17px] font-bold">
          ✓
        </div>
        <div className="text-lp-green-2 mt-2.5 text-[12px] font-extrabold">{M.created}</div>
      </div>
    </div>
  );
}

export function StepTemplateMock() {
  return (
    <div className={`${box} grid grid-cols-3 gap-2`}>
      <div className="lp-stripe border-lp-mint h-[66px] rounded-xl border-2 [--lp-stripe-a:#e7eef4] [--lp-stripe-b:#f5f8fb]" />
      <div className="lp-stripe h-[66px] rounded-xl" />
      <div className="lp-stripe h-[66px] rounded-xl" />
    </div>
  );
}

export function StepCustomizeMock() {
  return (
    <div className={`${box} flex gap-2.5`}>
      <div className="flex w-[44%] flex-col gap-2">
        <div className="bg-lp-mint-soft text-lp-on-mint rounded-lg px-2 py-1.5 text-[9.5px] font-extrabold">
          {M.customize.brandColor}
        </div>
        <div className="flex gap-1.5">
          <span className="bg-lp-mint size-[15px] rounded-[5px]" />
          <span className="bg-lp-blue-2 size-[15px] rounded-[5px]" />
          <span className="bg-lp-ink size-[15px] rounded-[5px]" />
        </div>
        <div className="border-lp-ink/8 text-lp-muted-2 rounded-lg border bg-white px-2 py-1.5 text-[9.5px]">
          {M.customize.heroText}
        </div>
      </div>
      <div className="lp-stripe flex-1 rounded-xl" />
    </div>
  );
}

export function StepUploadMock() {
  return (
    <div className={box}>
      {M.uploads.map((file, index) => (
        <div key={file.name} className={index > 0 ? 'mt-3.5' : undefined}>
          <div className="text-lp-muted flex items-center justify-between text-[10.5px]">
            <span>{file.name}</span>
            <span className="text-lp-green font-bold">{file.percent}</span>
          </div>
          <div className="bg-lp-track mt-1.5 h-1.5 overflow-hidden rounded-full">
            <div className="bg-lp-mint h-full" style={{ width: `${file.width}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StepPublishMock() {
  return (
    <div className="bg-lp-mint-tint mt-4 rounded-2xl border border-[rgba(10,127,92,.14)] p-3.5">
      <div className="flex items-center gap-2">
        <div
          dir="ltr"
          className="border-lp-line text-lp-muted flex-1 rounded-xl border bg-white px-2.5 py-2 text-[11px]"
        >
          {M.publish.url}
        </div>
        <div className="bg-lp-mint text-lp-on-mint rounded-xl px-3 py-2 text-[11px] font-extrabold">
          {M.publish.button}
        </div>
      </div>
      <div className="text-lp-green-2 mt-2.5 text-[10.5px] font-bold">{M.publish.done}</div>
    </div>
  );
}
