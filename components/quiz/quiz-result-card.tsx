'use client';

import { Award, CheckCircle2, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from '@/components/ui/link';
import type { QuizAttempt } from '@/lib/api/client';
import { usePlatformFeatures } from '@/components/providers/platform-features-provider';
import { useTranslation } from '@/lib/i18n/hooks';
import { buildAcademyPath, toPersianDigits } from '@/lib/utils';

interface Props {
  title: string;
  attempt: QuizAttempt;
  /** Shown when the student failed and still has an attempt left. */
  onTryAgain: (() => void) | null;
  storeSlug: string | null;
}

export function QuizResultCard({ title, attempt, onTryAgain, storeSlug }: Props) {
  const { t, language } = useTranslation();
  const { certificates_enabled } = usePlatformFeatures();
  const pending = attempt.status === 'PENDING_REVIEW';

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant={attempt.passed ? 'success' : pending ? 'warning' : 'outline'}>
          {pending ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {t('learning.awaitingReview')}
            </span>
          ) : attempt.passed ? (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {t('learning.passed')}
            </span>
          ) : (
            t('learning.notPassed')
          )}
        </Badge>
      </div>
      <p className="text-muted-foreground text-sm">
        {t('learning.score')}:{' '}
        <span className="text-foreground font-medium">
          {toPersianDigits(attempt.score, language)}
        </span>{' '}
        / {toPersianDigits(attempt.max_score, language)}
        {pending && ` (${t('learning.shortAnswersPending')})`}
      </p>
      {attempt.feedback && <p className="bg-muted rounded-md p-3 text-sm">{attempt.feedback}</p>}

      {certificates_enabled && attempt.certificate_number && (
        <Link
          href={buildAcademyPath(storeSlug, `/certificates/${attempt.certificate_number}`)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
        >
          <Award className="size-4" aria-hidden="true" />
          {t('learning.certificateIssued')}
        </Link>
      )}

      {onTryAgain && (
        <Button variant="outline" onClick={onTryAgain}>
          {t('learning.quizTryAgain')}
        </Button>
      )}
    </Card>
  );
}
