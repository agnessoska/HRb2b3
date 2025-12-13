import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InterviewQuestion } from './InterviewQuestion'
import { getItemKey, isItemCompleted } from '../types'
import type { InterviewSection as InterviewSectionType, SessionData } from '../types'

interface InterviewSectionProps {
  section: InterviewSectionType
  sectionIndex: number
  sessionData: SessionData
  isActive: boolean
  onToggleComplete: (key: string) => void
  onNotesChange: (key: string, value: string) => void
  onRatingChange: (key: string, value: number) => void
}

export function InterviewSection({
  section,
  sectionIndex,
  sessionData,
  isActive,
  onToggleComplete,
  onNotesChange,
  onRatingChange,
}: InterviewSectionProps) {
  const { t } = useTranslation('interview')

  // Calculate section completion
  const totalItems = section.items.filter(item => item.type !== 'script').length
  const completedItems = section.items.filter((item, idx) => {
    if (item.type === 'script') return false
    const key = getItemKey(section.id, idx)
    return isItemCompleted(sessionData, key)
  }).length
  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  const isFullyCompleted = completedItems === totalItems && totalItems > 0

  return (
    <Card className={cn(
      'transition-all duration-300',
      isActive && 'ring-2 ring-primary shadow-lg',
      isFullyCompleted && 'border-emerald-200 dark:border-emerald-800'
    )}>
      <CardHeader className={cn(
        'pb-4',
        isFullyCompleted && 'bg-emerald-50/30 dark:bg-emerald-950/10'
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Status Icon */}
            <div className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
              isFullyCompleted 
                ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                : isActive
                ? 'bg-primary/10'
                : 'bg-muted'
            )}>
              {isFullyCompleted ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Circle className={cn(
                  'h-5 w-5',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )} />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <CardTitle className="text-lg">
                {sectionIndex + 1}. {section.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            </div>
          </div>

          {/* Time Badge */}
          <Badge variant="outline" className="gap-1.5 shrink-0">
            <Clock className="h-3 w-3" />
            {section.time_allocation} {t('minutes', 'мин')}
          </Badge>
        </div>

        {/* Progress Bar */}
        {totalItems > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t('progress', 'Прогресс')}: {completedItems}/{totalItems}
              </span>
              <span className={cn(
                'font-semibold',
                completionPercent === 100 ? 'text-emerald-600' : 'text-muted-foreground'
              )}>
                {completionPercent}%
              </span>
            </div>
            <Progress value={completionPercent} className="h-1.5" />
          </div>
        )}

        {/* Focus Badge */}
        {section.focus === 'critical' && (
          <Badge variant="destructive" className="w-fit mt-2">
            {t('critical', 'Критически важно')}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {section.items.map((item, itemIdx) => {
          const itemKey = getItemKey(section.id, itemIdx)
          
          return (
            <InterviewQuestion
              key={itemKey}
              item={item}
              itemKey={itemKey}
              isCompleted={isItemCompleted(sessionData, itemKey)}
              notes={sessionData.notes[itemKey] || ''}
              rating={sessionData.ratings[itemKey] || null}
              onToggleComplete={onToggleComplete}
              onNotesChange={onNotesChange}
              onRatingChange={onRatingChange}
            />
          )
        })}
      </CardContent>
    </Card>
  )
}