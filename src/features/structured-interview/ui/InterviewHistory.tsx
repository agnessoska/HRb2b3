import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, Eye, Calendar, CheckCircle, PlayCircle, CalendarClock } from 'lucide-react'
import { format } from 'date-fns'
import { ru, enUS, kk } from 'date-fns/locale'
import { useGetInterviewSessions } from '../api'
import type { InterviewSessionWithData } from '../types'

interface InterviewHistoryProps {
  candidateId: string
  onViewSession: (session: InterviewSessionWithData) => void
}

export function InterviewHistory({ candidateId, onViewSession }: InterviewHistoryProps) {
  const { t, i18n } = useTranslation('interview')
  const { data: sessions, isLoading } = useGetInterviewSessions(candidateId)

  const getLocale = () => {
    switch (i18n.language) {
      case 'ru': return ru
      case 'kk': return kk
      default: return enUS
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
          label: t('status.completed', 'Завершено')
        }
      case 'in_progress':
        return {
          icon: PlayCircle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-500/10',
          label: t('status.inProgress', 'В процессе')
        }
      case 'planned':
        return {
          icon: CalendarClock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-muted',
          label: t('status.planned', 'Запланировано')
        }
      default:
        return {
          icon: MessageSquare,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          label: status
        }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            < MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">
            {t('history.empty', 'Нет интервью')}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {t('history.emptyDescription', 'Сгенерируйте план интервью для начала работы с кандидатом')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const statusConfig = getStatusConfig(session.status)
        const StatusIcon = statusConfig.icon

        return (
          <Card key={session.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`h-10 w-10 rounded-lg ${statusConfig.bgColor} flex items-center justify-center shrink-0`}>
                    <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base leading-snug break-words">
                      {session.interview_plan.vacancy_title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {statusConfig.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(session.completed_at || session.created_at), 'dd MMM yyyy', { locale: getLocale() })}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewSession(session)}
                  className="gap-2 shrink-0 w-full sm:w-auto"
                >
                  <Eye className="h-4 w-4" />
                  {t('view', 'Открыть')}
                </Button>
              </div>
            </CardHeader>

            {session.status === 'in_progress' && (
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground">
                  {t('progressStatus', 'Прогресс')}: {session.session_data.completed_items?.length || 0} / {
                    session.interview_plan.sections.reduce((acc, s) => acc + s.items.length, 0)
                  } {t('items', 'пунктов')}
                </div>
              </CardContent>
            )}

            {session.status === 'completed' && session.session_data.completion && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{t('recommendation', 'Рекомендация')}:</span>
                  <Badge 
                    variant="outline"
                    className="text-xs"
                  >
                    {t(`recommendations.${session.session_data.completion.recommendation}`, session.session_data.completion.recommendation)}
                  </Badge>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
