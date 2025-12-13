import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ru, enUS, kk } from 'date-fns/locale'
import { useGetComparisonsByVacancy } from '../api/getComparisons'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { History, Users, Calendar } from 'lucide-react'
import { GlassCard } from '@/shared/ui/GlassCard'

interface ComparisonHistoryProps {
  vacancyId: string
  onViewComparison: (comparisonId: string) => void
}

export const ComparisonHistory = ({ vacancyId, onViewComparison }: ComparisonHistoryProps) => {
  const { i18n } = useTranslation('ai-analysis')
  const { data: comparisons, isLoading } = useGetComparisonsByVacancy(vacancyId)

  const getLocale = () => {
    switch (i18n.language) {
      case 'ru':
        return ru
      case 'kk':
        return kk
      default:
        return enUS
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (!comparisons || comparisons.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">История сравнений пуста</p>
        <p className="text-sm text-muted-foreground mt-1">
          Сравнения будут отображаться здесь после генерации
        </p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-primary" />
        История сравнений
      </h3>
      {comparisons.map((comparison) => (
        <GlassCard 
          key={comparison.id} 
          className="p-4 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onViewComparison(comparison.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {comparison.candidate_ids.length} кандидатов
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(comparison.created_at), 'dd MMMM yyyy, HH:mm', { locale: getLocale() })}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Посмотреть
            </Button>
          </div>
        </GlassCard>
      ))}
    </div>
  )
}