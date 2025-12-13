import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Play,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { InterviewSection } from './InterviewSection'
import { InterviewCompletionDialog } from './InterviewCompletionDialog'
import { useInterviewAutoSave } from '../hooks'
import { useStartSession } from '../api/updateInterviewSession'
import { countTotalItems, getProgressPercentage } from '../types'
import type { InterviewSessionWithData, SessionData } from '../types'

interface InterviewWorkspaceProps {
  session: InterviewSessionWithData
  onBack: () => void
  isInDialog?: boolean
}

export function InterviewWorkspace({
  session,
  onBack,
  isInDialog = false
}: InterviewWorkspaceProps) {
  const { t } = useTranslation('interview')
  const [sessionData, setSessionData] = useState<SessionData>(session.session_data)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const startMutation = useStartSession()

  const isCompleted = session.status === 'completed'
  const isInProgress = session.status === 'in_progress'
  const isPlanned = session.status === 'planned'

  // Auto-save (only when not completed)
  useInterviewAutoSave({
    sessionId: session.id,
    sessionData,
    enabled: !isCompleted
  })

  // Calculate progress
  const totalItems = useMemo(() => countTotalItems(session.interview_plan), [session.interview_plan])
  const progressPercent = useMemo(() => getProgressPercentage(sessionData, totalItems), [sessionData, totalItems])

  // Handlers
  const handleToggleComplete = useCallback((itemKey: string) => {
    setSessionData(prev => ({
      ...prev,
      completed_items: prev.completed_items.includes(itemKey)
        ? prev.completed_items.filter(k => k !== itemKey)
        : [...prev.completed_items, itemKey]
    }))
  }, [])

  const handleNotesChange = useCallback((itemKey: string, value: string) => {
    setSessionData(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [itemKey]: value
      }
    }))
  }, [])

  const handleRatingChange = useCallback((itemKey: string, value: number) => {
    setSessionData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [itemKey]: value
      }
    }))
  }, [])

  const handleStart = () => {
    startMutation.mutate(session.id, {
      onSuccess: () => {
        setSessionData(prev => ({
          ...prev,
          progress: {
            ...prev.progress,
            current_section: session.interview_plan.sections[0]?.id || 'intro'
          }
        }))
        toast.success(t('started', 'Интервью начато'), {
          description: t('startedDescription', 'Можете делать заметки и оценивать ответы кандидата')
        })
      },
      onError: (error) => {
        toast.error(t('common:error'), {
          description: error.message
        })
      }
    })
  }

  const handleComplete = () => {
    if (progressPercent < 80) {
      toast.error(t('completeAtLeast80', 'Заполните хотя бы 80% интервью перед завершением'))
      return
    }
    setShowCompletionDialog(true)
  }

  const handleCompletionSuccess = () => {
    toast.success(t('completed', 'Интервью завершено'))
    setShowCompletionDialog(false)
    onBack()
  }

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className={cn(
        "bg-background/95 backdrop-blur-sm border-b shadow-sm py-4",
        isInDialog ? "px-0" : "sticky top-16 z-40 -mx-6 px-6"
      )}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {!isInDialog && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back', 'Назад')}
            </Button>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Badge */}
            <Badge
              variant={isCompleted ? 'default' : isInProgress ? 'default' : 'outline'}
              className={cn(
                isCompleted && 'bg-emerald-600 hover:bg-emerald-700 text-white',
                isInProgress && 'bg-orange-600 hover:bg-orange-700 text-white'
              )}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {t('status.completed', 'Завершено')}
                </>
              ) : isInProgress ? (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  {t('status.inProgress', 'В процессе')}
                </>
              ) : (
                t('status.planned', 'Запланировано')
              )}
            </Badge>

            {/* Actions */}
            {!isCompleted && (
              <>
                {isPlanned && (
                  <Button
                    size="sm"
                    onClick={handleStart}
                    disabled={startMutation.isPending}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {t('startInterview', 'Начать интервью')}
                  </Button>
                )}
                
                {isInProgress && (
                  <Button
                    size="sm"
                    onClick={handleComplete}
                    disabled={progressPercent < 50}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {t('completeInterview', 'Завершить')}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Progress Bar (only when not completed) */}
        {!isCompleted && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('overallProgress', 'Общий прогресс')}
              </span>
              <span className="font-semibold">
                {sessionData.completed_items.length}/{totalItems} {t('items', 'пунктов')}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}
      </div>
{/* Interview Header Info */}
<Card>
  <CardContent className="p-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex-1 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{session.interview_plan.candidate_name}</h2>
        <p className="text-muted-foreground text-base">{session.interview_plan.vacancy_title}</p>
      </div>
      <div className="flex-shrink-0">
        <div className="text-center px-6 py-4 rounded-xl bg-muted/50 border">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {t('duration', 'Продолжительность')}
          </div>
          <div className="text-4xl font-bold">
            {session.interview_plan.estimated_duration}
          </div>
          <div className="text-sm text-muted-foreground mt-1">{t('minutes', 'мин')}</div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>

      {/* Final Assessment Card (only for completed interviews) */}
      {isCompleted && sessionData.completion && (
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                    {t('finalAssessment', 'Итоговая оценка')}
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    {t('interviewCompleted', 'Интервью успешно завершено')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    {t('recommendation', 'Рекомендация')}:
                  </span>
                  <Badge
                    className={cn(
                      'font-semibold',
                      sessionData.completion.recommendation === 'hire_strongly' && 'bg-emerald-600 hover:bg-emerald-700 text-white',
                      sessionData.completion.recommendation === 'hire' && 'bg-blue-600 hover:bg-blue-700 text-white',
                      sessionData.completion.recommendation === 'consider' && 'bg-amber-600 hover:bg-amber-700 text-white',
                      sessionData.completion.recommendation === 'reject' && 'bg-red-600 hover:bg-red-700 text-white'
                    )}
                  >
                    {t(`recommendations.${sessionData.completion.recommendation}`, sessionData.completion.recommendation)}
                  </Badge>
                </div>

                <div className="rounded-lg bg-white/50 dark:bg-black/20 p-4 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-2">
                    {t('overallImpression', 'Итоговое впечатление')}:
                  </p>
                  <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                    {sessionData.completion.overall_impression}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {session.interview_plan.sections.map((section, idx) => (
          <InterviewSection
            key={section.id}
            section={section}
            sectionIndex={idx}
            sessionData={sessionData}
            isActive={sessionData.progress?.current_section === section.id}
            onToggleComplete={handleToggleComplete}
            onNotesChange={handleNotesChange}
            onRatingChange={handleRatingChange}
          />
        ))}
      </div>

      {/* Completion Dialog */}
      <InterviewCompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        sessionId={session.id}
        onSuccess={handleCompletionSuccess}
      />
    </div>
  )
}