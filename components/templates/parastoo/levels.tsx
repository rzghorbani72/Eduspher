import { Container } from '../_shared/section';
import { Button, Initials } from '../_shared/primitives';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { PARASTOO_DEFAULTS } from './defaults';
import styles from './parastoo.module.css';
import { templateHref } from '../_shared/routes';

type NodeTone = 'primary' | 'accent' | 'secondary' | 'plain';

interface LevelNode {
  level: string;
  title: string;
  note: string;
  tone: NodeTone;
}

interface BoardRow {
  rank: string;
  initials: string;
  name: string;
  level: string;
  time: string;
  score: string;
}

const KNOB_TONE: Record<NodeTone, string> = {
  primary: 'bg-(--theme-primary) text-(--theme-on-primary)',
  accent: 'bg-(--theme-accent) text-(--theme-on-accent)',
  secondary: 'bg-(--theme-secondary) text-(--theme-on-secondary)',
  plain: 'bg-(--theme-surface-alt) text-(--theme-foreground)',
};

/**
 * Parastoo's signature section: the ten-level spine over a weekly leaderboard.
 * Progression is the product, so it gets the tall inverted band.
 */
export function ParastooLevels({ id, config, storeContext }: TemplateSectionProps) {
  const d = PARASTOO_DEFAULTS.levels;
  const nodes = list<LevelNode>(config, 'nodes', d.nodes);
  const rows = list<BoardRow>(config, 'boardRows', d.boardRows);
  const columns = list<string>(config, 'boardColumns', d.boardColumns);

  return (
    <section id={id || 'showcase'} className="bg-(--theme-deep) text-(--theme-on-deep)">
      <Container className="py-(--theme-section-padding-y)">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
          <div>
            <span className="block text-[13px] font-bold tracking-[0.16em] text-(--theme-accent)">
              {text(config, 'eyebrow', d.eyebrow)}
            </span>
            <h2
              data-editable="title"
              className="mt-3 max-w-[24ch] text-[clamp(28px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]"
            >
              {text(config, 'title', d.title)}
            </h2>
          </div>
          <p data-editable="subtitle" className="max-w-[46ch] text-[16px] leading-[1.85] text-current/65">
            {text(config, 'subtitle', d.subtitle)}
          </p>
        </div>

        <ol className={`relative grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5 ${styles.spine}`}>
          {nodes.map((node) => (
            <li key={node.level} className="relative text-center">
              <span
                className={`mx-auto grid size-20 place-items-center border-[3px] border-(--theme-deep) text-[32px] font-bold ${styles.squircle} ${KNOB_TONE[node.tone]}`}
              >
                {node.level}
              </span>
              <h3 className="mt-4 text-[17px] font-bold">{node.title}</h3>
              <p className="mt-1 text-[13.5px] text-current/60">{node.note}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-[34px] border-2 border-current/16 bg-current/5 p-6">
            <h3 className="mb-4 text-[21px] font-bold">{text(config, 'boardTitle', d.boardTitle)}</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] border-collapse">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column}
                        scope="col"
                        className="border-b-2 border-current/16 p-2.5 text-start text-[12.5px] font-bold text-current/55"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.rank}>
                      <td className="border-b border-current/12 p-3.5 text-[15px] tabular-nums">{row.rank}</td>
                      <td className="border-b border-current/12 p-3.5">
                        <span className="flex items-center gap-2.5 text-[15px] font-bold">
                          <Initials value={row.initials} className="size-8" tone="accent" />
                          {row.name}
                        </span>
                      </td>
                      <td className="border-b border-current/12 p-3.5 text-[15px]">{row.level}</td>
                      <td className="border-b border-current/12 p-3.5 text-[15px] tabular-nums">{row.time}</td>
                      <td className="border-b border-current/12 p-3.5 text-[17px] font-bold text-(--theme-accent) tabular-nums">
                        {row.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[34px] border-2 border-(--theme-deep) bg-(--theme-primary) p-8 text-(--theme-on-primary)">
            <span className="block text-[88px] font-bold leading-none tracking-[-0.06em] tabular-nums">
              {d.challenge.value}
            </span>
            <h3 className="mt-3 text-[24px] font-bold">{d.challenge.title}</h3>
            <p className="mt-3 text-[15px] leading-[1.8] opacity-90">{d.challenge.body}</p>
            <Button tone="deep" className="mt-6" href={templateHref(storeContext, 'register')}>
              {d.challenge.ctaText}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
