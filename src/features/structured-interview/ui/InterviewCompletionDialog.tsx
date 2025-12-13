import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCompleteSession } from '../api'

interface InterviewCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  onSuccess: () => void
}

export function InterviewCompletionDialog({
  open,
  onOpenChange,
  sessionId,
  onSuccess
}: InterviewCompletionDialogProps) {
  const { t } = useTranslation('interview')
  const [overallImpression, setOverallImpression] = useState('')
  const [recommendation, setRecommendation] = useState<'hire_strongly' | 'hire' | 'consider' | 'reject'>('hire')
  const { mutate: completeSession, isPending } = useCompleteSession()

  const handleComplete = () => {
    console.log('🔍 InterviewCompletion: Starting completion process', {
      sessionId,
      impression: overallImpression,
      recommendation,
      impressionLength: overallImpression.trim().length
    });

    if (!overallImpression.trim() || overallImpression.trim().length < 10) {
      console.log('❌ InterviewCompletion: Impression is too short');
      toast.error(t('impressionTooShort', 'Итоговое впечатление должно содержать минимум 10 символов'))
      return
    }

    console.log('✅ InterviewCompletion: Validation passed, calling mutation');

    completeSession(
      {
        session_id: sessionId,
        overall_impression: overallImpression,
        recommendation
      },
      {
        onSuccess: (data) => {
          console.log('✅ InterviewCompletion: Mutation successful', data);
          onSuccess()
          onOpenChange(false)
        },
        onError: (error) => {
          console.error('❌ InterviewCompletion: Mutation failed', error);
          toast.error(t('completionError', 'Ошибка завершения'), {
            description: error.message
          })
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            {t('completeDialog.title', 'Завершение интервью')}
          </DialogTitle>
          <DialogDescription>
            {t('completeDialog.description', 'Оставьте итоговое впечатление и рекомендацию')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Impression */}
          <div className="space-y-2">
            <Label htmlFor="impression" className="text-sm font-semibold">
              {t('completeDialog.impression', 'Итоговое впечатление')} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="impression"
              value={overallImpression}
              onChange={(e) => setOverallImpression(e.target.value)}
              placeholder={t('completeDialog.impressionPlaceholder', 'Общее впечатление о кандидате, ключевые выводы...')}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <div className="flex items-center justify-between text-xs">
              <span className={cn(
                "text-muted-foreground",
                overallImpression.trim().length > 0 && overallImpression.trim().length < 10 && "text-destructive font-medium"
              )}>
                {overallImpression.trim().length < 10 && `Минимум 10 символов`}
              </span>
              <span className="text-muted-foreground">
                {overallImpression.length}/2000
              </span>
            </div>
          </div>

          {/* Recommendation */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              {t('completeDialog.recommendation', 'Рекомендация')} <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={recommendation} onValueChange={(val) => setRecommendation(val as typeof recommendation)}>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="hire_strongly" id="hire_strongly" />
                  <Label htmlFor="hire_strongly" className="flex-1 cursor-pointer">
                    <div className="font-medium">{t('recommendations.hire_strongly', 'Нанять немедленно')}</div>
                    <div className="text-xs text-muted-foreground">{t('recommendations.hire_strongly_desc', 'Отличный кандидат, идеальное совпадение')}</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="hire" id="hire" />
                  <Label htmlFor="hire" className="flex-1 cursor-pointer">
                    <div className="font-medium">{t('recommendations.hire', 'Нанять')}</div>
                    <div className="text-xs text-muted-foreground">{t('recommendations.hire_desc', 'Хороший кандидат, соответствует требованиям')}</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="consider" id="consider" />
                  <Label htmlFor="consider" className="flex-1 cursor-pointer">
                    <div className="font-medium">{t('recommendations.consider', 'Рассмотреть')}</div>
                    <div className="text-xs text-muted-foreground">{t('recommendations.consider_desc', 'Есть потенциал, но нужно больше информации')}</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="reject" id="reject" />
                  <Label htmlFor="reject" className="flex-1 cursor-pointer">
                    <div className="font-medium">{t('recommendations.reject', 'Отклонить')}</div>
                    <div className="text-xs text-muted-foreground">{t('recommendations.reject_desc', 'Не подходит для данной позиции')}</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('cancel', 'Отмена')}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isPending || !overallImpression.trim() || overallImpression.trim().length < 10}
            className="gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('completeDialog.submit', 'Завершить интервью')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}