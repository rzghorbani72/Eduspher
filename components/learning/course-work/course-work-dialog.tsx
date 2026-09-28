'use client';

import { AssignmentPanel } from '@/components/learning/assignment-panel';
import { LessonQuiz } from '@/components/quiz/lesson-quiz';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n/hooks';
import { WORK_LABEL_KEY, type CourseWork } from './course-work';

interface CourseWorkDialogProps {
  work: CourseWork | null;
  onClose: () => void;
  currentProfileId: string;
  storeSlug: string | null;
  onQuizPassed: () => void;
}

/** Takes a season/course quiz or hands in a season assignment without leaving the lesson. */
export function CourseWorkDialog({
  work,
  onClose,
  currentProfileId,
  storeSlug,
  onQuizPassed,
}: CourseWorkDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={work !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      {work ? (
        <DialogContent
          closeLabel={t('common.close')}
          className="flex max-h-[90dvh] max-w-3xl flex-col overflow-hidden"
        >
          <DialogHeader>
            <DialogTitle>{work.title}</DialogTitle>
            <DialogDescription>{t(WORK_LABEL_KEY[work.parent.kind][work.type])}</DialogDescription>
          </DialogHeader>
          {/* A quiz has as many questions as the teacher drew; only this part scrolls. */}
          <div className="min-h-0 flex-1 overflow-y-auto pe-1">
            {work.type === 'quiz' ? (
              <LessonQuiz
                parent={work.parent}
                currentProfileId={currentProfileId}
                storeSlug={storeSlug}
                onPassed={onQuizPassed}
              />
            ) : (
              <AssignmentPanel parent={work.parent} currentProfileId={currentProfileId} />
            )}
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
