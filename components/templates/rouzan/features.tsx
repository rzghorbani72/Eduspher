import { Button } from '../_shared/primitives';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';
import { ROUZAN_DEFAULTS } from './defaults';
import { Wrap, LeadLabel } from './layout';
import styles from './rouzan.module.css';

interface ReasonItem {
  no: string;
  title: string;
  body: string;
}

/**
 * The promise of the page — a teacher who reads your code — argued as a bento:
 * one lead card carrying a mock code review, three supporting cards, and a
 * full-width refund bar. The review mock is the only illustration on the page,
 * so it shows the actual product rather than a stock graphic.
 */
export function RouzanFeatures({ id, config, storeContext }: TemplateSectionProps) {
  const d = ROUZAN_DEFAULTS.features;
  const items = list<ReasonItem>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="bg-(--theme-background) text-(--theme-foreground)">
      <div className="py-(--theme-section-padding-y)">
        <Wrap>
          <h2
            data-editable="title"
            className="max-w-[22ch] text-[clamp(30px,3.4vw,46px)] leading-[1.14] font-bold"
          >
            {text(config, 'title', d.title)}
          </h2>
          <p
            data-editable="subtitle"
            className="mt-4 max-w-[52ch] text-[17px] leading-[1.85] text-(--theme-muted)"
          >
            {text(config, 'subtitle', d.subtitle)}
          </p>

          <div className="mt-13 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
            <article className={`${styles.card} flex flex-col gap-4 p-8`}>
              <LeadLabel editableKey="leadNo">{text(config, 'leadNo', d.lead.no)}</LeadLabel>
              <h3 data-editable="leadTitle" className="text-[26px] leading-[1.25] font-bold">
                {text(config, 'leadTitle', d.lead.title)}
              </h3>
              <p
                data-editable="leadBody"
                className="max-w-[46ch] text-[15.5px] leading-[1.9] text-(--theme-muted)"
              >
                {text(config, 'leadBody', d.lead.body)}
              </p>

              <div className={`${styles.review} mt-auto p-4`} aria-hidden="true">
                <div className="flex items-baseline gap-3 py-[7px] text-[13.5px]">
                  <span className={`${styles.tok} min-w-14 text-(--theme-muted)`}>
                    {d.lead.file}
                  </span>
                  <b className="font-medium">{d.lead.fileNote}</b>
                </div>
                {d.lead.lines.map((line) => (
                  <div key={line.at} className="flex items-baseline gap-3 py-[7px] text-[13.5px]">
                    <span className="min-w-14 text-(--theme-muted)">{line.at}</span>
                    <b
                      className={`font-medium ${line.tone === 'add' ? styles.reviewAdd : styles.reviewDel}`}
                    >
                      {line.text}
                    </b>
                  </div>
                ))}
              </div>
            </article>

            <div className="grid gap-5" {...editableList('items', items)}>
              {items.map((item, index) => (
                <article key={item.title} className={`${styles.card} ${styles.cardHover} p-6`}>
                  <p
                    {...editableItem('items', index, 'no')}
                    className="text-[12.5px] font-bold text-(--theme-primary)"
                  >
                    {item.no}
                  </p>
                  <h3
                    {...editableItem('items', index, 'title')}
                    className="mt-1 text-[19.5px] leading-[1.5] font-bold"
                  >
                    {item.title}
                  </h3>
                  <p
                    {...editableItem('items', index, 'body')}
                    className="mt-2.5 text-[14.5px] leading-[1.85] text-(--theme-muted)"
                  >
                    {item.body}
                  </p>
                </article>
              ))}
            </div>

            <div
              className={`${styles.guarantee} flex flex-wrap items-center gap-6 px-7 py-6 lg:col-span-2`}
            >
              <div>
                <b data-editable="guaranteeTitle" className="text-[20px]">
                  {text(config, 'guaranteeTitle', d.guarantee.title)}
                </b>
                <p
                  data-editable="guaranteeBody"
                  className="max-w-[56ch] text-[14.5px] leading-[1.85] opacity-80"
                >
                  {text(config, 'guaranteeBody', d.guarantee.body)}
                </p>
              </div>
              <Button
                tone="outline"
                size="sm"
                editableKey="guaranteeCta"
                href={templateHref(storeContext, 'courses')}
                className="ms-auto !rounded-lg"
              >
                {text(config, 'guaranteeCta', d.guarantee.ctaText)}
              </Button>
            </div>
          </div>
        </Wrap>
      </div>
    </section>
  );
}
