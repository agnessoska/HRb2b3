import { useState } from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { CandidateWithVacancies } from '@/shared/types/extended'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { User, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AssignToVacancyDialog } from './AssignToVacancyDialog'

interface CandidateCardProps {
  candidate: CandidateWithVacancies
}

function getTestStatus(lastUpdatedAt: string | null) {
  if (!lastUpdatedAt) {
    return {
      textKey: 'statuses.relevant',
      color: 'bg-gradient-to-r from-slate-500 to-slate-600',
      icon: Clock,
    }
  }

  const lastUpdateDate = new Date(lastUpdatedAt)
  const now = new Date()
  const monthsDiff =
    (now.getFullYear() - lastUpdateDate.getFullYear()) * 12 +
    (now.getMonth() - lastUpdateDate.getMonth())

  if (monthsDiff < 1) {
    return { textKey: 'statuses.relevant', color: 'bg-gradient-to-r from-emerald-500 to-green-600', icon: CheckCircle2 }
  } else if (monthsDiff <= 2) {
    return { textKey: 'statuses.expiring', color: 'bg-gradient-to-r from-amber-500 to-orange-500', icon: Clock }
  } else {
    return { textKey: 'statuses.outdated', color: 'bg-gradient-to-r from-red-500 to-rose-600', icon: AlertCircle }
  }
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const { t, i18n } = useTranslation('candidates')
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const testsCompleted = candidate.tests_completed || 0

  // Получаем локализованное название категории в зависимости от языка
  const getCategoryName = () => {
    if (!candidate.category_name_ru && !candidate.category_name_en && !candidate.category_name_kk) {
      return t('common.notAvailable')
    }
    
    const lang = i18n.language as 'ru' | 'en' | 'kk'
    switch (lang) {
      case 'ru':
        return candidate.category_name_ru || t('common.notAvailable')
      case 'en':
        return candidate.category_name_en || t('common.notAvailable')
      case 'kk':
        return candidate.category_name_kk || t('common.notAvailable')
      default:
        return candidate.category_name_ru || t('common.notAvailable')
    }
  }

  const categoryName = getCategoryName()
  const testStatus = getTestStatus(candidate.tests_last_updated_at)
  const StatusIcon = testStatus.icon
  const progressPercentage = (testsCompleted / 6) * 100

  return (
    <Card className="group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{candidate.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{categoryName}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">
                {t('card.testing_progress')}
              </span>
              <span className="font-semibold tabular-nums">
                {testsCompleted}/6
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-chart-1 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          {testsCompleted > 0 && (
            <div className="flex items-center gap-2">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white ${testStatus.color}`}
              >
                <StatusIcon className="h-3 w-3" />
                {t(`card.${testStatus.textKey}`)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 border-t bg-muted/30 pt-4">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/hr/candidate/${candidate.id}`}>{t('card.profile_button')}</Link>
        </Button>
        <Button
          size="sm"
          className="flex-1 gap-1"
          onClick={() => setIsAssignDialogOpen(true)}
        >
          {t('card.assign_button')}
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardFooter>

      <AssignToVacancyDialog
        isOpen={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        candidateId={candidate.id}
        candidateName={candidate.full_name || t('common.notAvailable')}
        assignedVacancyIds={candidate.vacancy_ids || []}
      />
    </Card>
  )
}
