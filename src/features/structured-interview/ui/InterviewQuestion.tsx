import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, AlertTriangle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InterviewPlanItem } from '../types'

interface InterviewQuestionProps {
  item: InterviewPlanItem
  itemKey: string
  isCompleted: boolean
  notes: string
  rating: number | null
  onToggleComplete: (key: string) => void
  onNotesChange: (key: string, value: string) => void
  onRatingChange: (key: string, value: number) => void
}

export function InterviewQuestion({
  item,
  itemKey,
  isCompleted,
  notes,
  rating,
  onToggleComplete,
  onNotesChange,
  onRatingChange,
}: InterviewQuestionProps) {
  const { t } = useTranslation('interview')
  const [isHoveringRating, setIsHoveringRating] = useState<number | null>(null)

  // Don't render if it's just a script (no interaction needed)
  if (item.type === 'script') {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground italic">{item.content}</p>
      </div>
    )
  }

  const displayRating = isHoveringRating !== null ? isHoveringRating : rating || 0

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isCompleted && 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10'
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <CardTitle className="text-base font-semibold leading-tight">
              {item.question}
            </CardTitle>
            
            {item.category && (
              <Badge variant="outline" className="text-xs">
                {item.category}
              </Badge>
            )}
            
            {/* Risk/Strength description */}
            {(item.risk_description || item.strength_description) && (
              <div className={cn(
                'flex gap-2 p-2 rounded-lg text-xs',
                item.risk_description 
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
              )}>
                <span className="font-medium">
                  {item.risk_description ? '⚠️ Риск:' : '✨ Сильная сторона:'}
                </span>
                <span>{item.risk_description || item.strength_description}</span>
              </div>
            )}
          </div>
          
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggleComplete(itemKey)}
            className="mt-1"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hints */}
        {item.what_to_listen_for && (
          <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-semibold">{t('whatToListenFor', 'Что искать:')}</strong>
              <p className="mt-1 text-muted-foreground">{item.what_to_listen_for}</p>
            </div>
          </div>
        )}

        {/* Red Flags */}
        {item.red_flags && item.red_flags.length > 0 && (
          <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-semibold">{t('redFlags', 'Red flags:')}</strong>
              <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-0.5">
                {item.red_flags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Expected Questions (for candidate_questions type) */}
        {item.expected_questions && item.expected_questions.length > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg border">
            <strong className="text-xs font-semibold">{t('expectedQuestions', 'Возможные вопросы кандидата:')}</strong>
            <ul className="list-disc list-inside mt-2 text-xs text-muted-foreground space-y-1">
              {item.expected_questions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Rating */}
        {item.rating_enabled && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold">{t('rateAnswer', 'Оценка ответа:')}</Label>
            <div 
              className="flex gap-1"
              onMouseLeave={() => setIsHoveringRating(null)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRatingChange(itemKey, star)}
                  onMouseEnter={() => setIsHoveringRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                >
                  <Star
                    className={cn(
                      'h-6 w-6 transition-colors',
                      displayRating >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor={`notes-${itemKey}`} className="text-xs font-semibold">
            {t('notes', 'Заметки:')}
          </Label>
          <Textarea
            id={`notes-${itemKey}`}
            value={notes}
            onChange={(e) => onNotesChange(itemKey, e.target.value)}
            placeholder={item.notes_placeholder || t('notesPlaceholder', 'Запишите ответ кандидата, ваши наблюдения...')}
            className="min-h-[80px] text-sm resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {notes.length}/1000
          </p>
        </div>
      </CardContent>
    </Card>
  )
}