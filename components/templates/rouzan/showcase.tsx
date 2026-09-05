import { list, text, type TemplateSectionProps } from '../_shared/types';
import { editableList, editableItem } from '../_shared/editable-list';
import { ROUZAN_DEFAULTS } from './defaults';
import { Wrap, SectionHead } from './layout';
import styles from './rouzan.module.css';

type SeatTone = 'live' | 'few' | 'full';

interface ClassRow {
  title: string;
  note: string;
  when: string;
  who: string;
  seats: string;
  status: string;
  tone: SeatTone;
  action: string;
}

const STATUS_CLASS: Record<SeatTone, string> = {
  live: styles.stLive,
  few: styles.stFew,
  full: styles.stFull,
};

/**
 * The live-class calendar, on the one dark band of the page.
 *
 * A table rather than cards: the visitor is comparing five sessions on the same
 * four attributes, and scanning down a column is the whole job. It scrolls
 * inside its own container so a narrow screen never scrolls the page sideways.
 */
export function RouzanShowcase({ id, config }: TemplateSectionProps) {
  const d = ROUZAN_DEFAULTS.showcase;
  const rows = list<ClassRow>(config, 'rows', d.rows);
  const columns = list<string>(config, 'columns', d.columns);

  return (
    <section id={id || 'showcase'} className="bg-(--theme-deep) text-(--theme-on-deep)">
      <div className="py-(--theme-section-padding-y)">
        <Wrap>
          <SectionHead
            eyebrow={text(config, 'eyebrow', d.eyebrow)}
            title={text(config, 'title', d.title)}
            aside={
              <p
                data-editable="subtitle"
                className="max-w-[40ch] text-[15px] leading-[1.85] opacity-70"
              >
                {text(config, 'subtitle', d.subtitle)}
              </p>
            }
          />

          <div className="mt-9 overflow-x-auto">
            <table className={`${styles.table} text-[14.5px]`}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody {...editableList('rows', rows)}>
                {rows.map((row, index) => (
                  <tr key={row.title}>
                    <td className="font-bold whitespace-nowrap">
                      <span {...editableItem('rows', index, 'title')}>{row.title}</span>
                      <span {...editableItem('rows', index, 'note')} className={styles.rowSub}>
                        {row.note}
                      </span>
                    </td>
                    <td {...editableItem('rows', index, 'when')}>{row.when}</td>
                    <td {...editableItem('rows', index, 'who')}>{row.who}</td>
                    <td {...editableItem('rows', index, 'seats')}>{row.seats}</td>
                    <td>
                      <span className={`${styles.st} ${STATUS_CLASS[row.tone]}`}>
                        {row.tone === 'live' ? <i aria-hidden="true" /> : null}
                        <span {...editableItem('rows', index, 'status')}>{row.status}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-(--theme-primary)">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p data-editable="note" className="mt-5 text-[13.5px] opacity-60">
            {text(config, 'note', d.note)}
          </p>
        </Wrap>
      </div>
    </section>
  );
}
