import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { MOMAS_DEFAULTS } from './defaults';
import styles from './momas.module.css';

interface QuizItem {
  code: string;
  time: string;
  question: string;
  options: readonly string[];
  answer: string;
  explanation: string;
}

/**
 * Momas's signature section: real sample questions with the worked answer
 * behind a native `<details>` disclosure. Zero JavaScript, keyboard-operable
 * and open-by-default for search engines that ignore the toggle.
 */
export function MomasQuiz({ id, config }: TemplateSectionProps) {
  const d = MOMAS_DEFAULTS.quiz;
  const items = list<QuizItem>(config, 'items', d.items);

  return (
    <section id={id || 'showcase'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.code}
              className="rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-6"
            >
              <div className={`flex items-center justify-between text-[12.5px] text-(--theme-muted) ${styles.mono}`}>
                <span>{item.code}</span>
                <span>{item.time}</span>
              </div>

              <p className="mt-4 text-[17px] font-bold leading-[1.7]">{item.question}</p>

              <ol className="mt-4 grid gap-2.5">
                {item.options.map((option, index) => (
                  <li
                    key={option}
                    className="flex items-center gap-3 rounded-(--theme-border-radius) border border-(--theme-border-color) px-4 py-2.5 text-[15px]"
                  >
                    <span
                      className={`grid size-6 flex-none place-items-center rounded-full bg-(--theme-surface-alt) text-[12px] font-bold ${styles.mono}`}
                    >
                      {index + 1}
                    </span>
                    {option}
                  </li>
                ))}
              </ol>

              <details
                className={`mt-4 rounded-(--theme-border-radius) border border-(--theme-border-color) p-4 ${styles.answer}`}
              >
                <summary className="flex items-center justify-between gap-3 text-[14.5px] font-bold text-(--theme-primary)">
                  پاسخ تشریحی
                  <span aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-[14.5px] font-bold">{item.answer}</p>
                <p className="mt-2 text-[14.5px] leading-[1.85] text-(--theme-ink-2)">{item.explanation}</p>
              </details>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
