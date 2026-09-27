'use client';

import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { QuizQuestion } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/utils';
import type { AnswerValue } from './use-quiz-flow';

interface Props {
  question: QuizQuestion;
  index: number;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}

/** One drawn question. New quizzes are multiple choice; older types still render. */
export function QuizQuestionCard({ question, index, value, onChange }: Props) {
  const { t, language } = useTranslation();

  return (
    <Card className="space-y-3 p-5">
      <p className="font-medium">
        {toPersianDigits(index + 1, language)}. {question.prompt}{' '}
        <span className="text-muted-foreground text-xs">
          ({toPersianDigits(question.points, language)} {t('learning.points')})
        </span>
      </p>

      {question.type === 'MULTIPLE_CHOICE' && (
        <div className="space-y-2">
          {question.Option.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={question.id}
                checked={value?.selected_option_id === option.id}
                onChange={() => onChange({ selected_option_id: option.id })}
              />
              {option.text}
            </label>
          ))}
        </div>
      )}

      {question.type === 'TRUE_FALSE' && (
        <div className="flex gap-4">
          {[true, false].map((choice) => (
            <label key={String(choice)} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={question.id}
                checked={value?.answer_boolean === choice}
                onChange={() => onChange({ answer_boolean: choice })}
              />
              {choice ? t('learning.true') : t('learning.false')}
            </label>
          ))}
        </div>
      )}

      {question.type === 'SHORT_TEXT' && (
        <Textarea
          rows={3}
          maxLength={5000}
          value={value?.answer_text ?? ''}
          onChange={(e) => onChange({ answer_text: e.target.value })}
          placeholder={t('learning.yourAnswer')}
          aria-label={t('learning.yourAnswer')}
        />
      )}
    </Card>
  );
}
