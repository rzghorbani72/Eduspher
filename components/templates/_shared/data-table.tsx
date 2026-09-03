import { Container, SectionHead } from './section';
import { list, text, type SectionConfig } from './types';
import { editableList, editableItem } from './editable-list';

export type CapacityTone = 'open' | 'few' | 'full';

export interface DataCell {
  text: string;
  /** Secondary line under the main value. */
  note?: string;
  bold?: boolean;
  /** When set, the cell renders as a capacity/status badge. */
  status?: CapacityTone;
}

export interface DataRow {
  key: string;
  cells: readonly DataCell[];
}

export interface DataTableDefaults {
  eyebrow: string;
  title: string;
  subtitle: string;
  columns: readonly string[];
  rows: readonly DataRow[];
}

interface TemplateDataTableProps {
  id?: string;
  config?: SectionConfig;
  defaults: DataTableDefaults;
  tone?: 'page' | 'surface';
}

const STATUS_CLASS: Record<CapacityTone, string> = {
  open: 'bg-(--theme-primary-subtle) text-(--theme-primary)',
  few: 'bg-(--theme-accent-subtle) text-(--theme-accent)',
  full: 'bg-(--theme-surface-alt) text-(--theme-muted)',
};

/**
 * The dense-data section several designs share — a class calendar, mission
 * roster or observing schedule. It scrolls inside its own container so the page
 * body never scrolls sideways on a phone.
 */
export function TemplateDataTable({ id, config, defaults, tone = 'surface' }: TemplateDataTableProps) {
  const columns = list<string>(config, 'columns', defaults.columns);
  const rows = list<DataRow>(config, 'rows', defaults.rows);

  return (
    <section
      id={id || 'showcase'}
      className={`border-y border-(--theme-border-color) ${
        tone === 'surface' ? 'bg-(--theme-surface-alt)' : 'bg-(--theme-background)'
      } text-(--theme-foreground)`}
    >
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', defaults.eyebrow)}
          title={text(config, 'title', defaults.title)}
          subtitle={text(config, 'subtitle', defaults.subtitle)}
        />

        <div className="overflow-x-auto rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) shadow-(--theme-shadow)">
          <table className="w-full min-w-[720px] border-collapse text-[15px]">
            <thead {...editableList('columns', columns)}>
              <tr>
                {columns.map((column, columnIndex) => (
                  <th
                    key={column}
                    scope="col"
                    {...editableItem('columns', columnIndex)}
                    className="border-b border-(--theme-border-color) bg-(--theme-surface-alt) p-4 text-start text-[13px] font-bold text-(--theme-muted)"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody {...editableList('rows', rows)}>
              {rows.map((row, rowIndex) => (
                <tr key={row.key} className="hover:bg-(--theme-surface-alt)">
                  {row.cells.map((cell, index) => (
                    <td
                      key={`${row.key}-${index}`}
                      className={`border-b border-(--theme-border-color) p-4 ${cell.bold ? 'font-bold whitespace-nowrap' : ''}`}
                    >
                      {cell.status ? (
                        <span
                          data-motion={cell.status === 'few' ? 'signal' : undefined}
                          {...editableItem('rows', rowIndex, 'cells', index, 'text')}
                          className={`inline-block whitespace-nowrap rounded-(--theme-border-radius) px-2.5 py-1 text-[12px] font-bold ${STATUS_CLASS[cell.status]}`}
                        >
                          {cell.text}
                        </span>
                      ) : (
                        <>
                          <span {...editableItem('rows', rowIndex, 'cells', index, 'text')} className="block">
                            {cell.text}
                          </span>
                          {cell.note ? (
                            <span
                              {...editableItem('rows', rowIndex, 'cells', index, 'note')}
                              className="mt-1 block text-[13px] text-(--theme-muted)"
                            >
                              {cell.note}
                            </span>
                          ) : null}
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
