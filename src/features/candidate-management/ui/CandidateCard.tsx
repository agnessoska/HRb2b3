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
import { ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HelpCircle } from '@/shared/ui/HelpCircle'
import { AssignToVacancyDialog } from './AssignToVacancyDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface CandidateCardProps {
  candidate: CandidateWithVacancies
}

function getTestStatus(testsCompleted: number, lastUpdatedAt: string | null) {
  if (testsCompleted === 0) {
    return {
      textKey: 'statuses.notStarted',
      color: 'bg-muted text-muted-foreground border-muted-foreground/20',
      icon: Clock,
    }
  }

  if (testsCompleted < 6) {
    return {
      textKey: 'statuses.inProgress',
      color: 'bg-primary/10 text-primary border-primary/20',
      icon: Clock,
    }
  }

  if (!lastUpdatedAt) {
    return {
      textKey: 'statuses.relevant',
      color: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white',
      icon: CheckCircle2,
    }
  }

  const lastUpdateDate = new Date(lastUpdatedAt)
  const now = new Date()
  const monthsDiff =
    (now.getFullYear() - lastUpdateDate.getFullYear()) * 12 +
    (now.getMonth() - lastUpdateDate.getMonth())

  if (monthsDiff < 1) {
    return { textKey: 'statuses.relevant', color: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white', icon: CheckCircle2 }
  } else if (monthsDiff <= 2) {
    return { textKey: 'statuses.expiring', color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white', icon: Clock }
  } else {
    return { textKey: 'statuses.outdated', color: 'bg-gradient-to-r from-red-500 to-rose-600 text-white', icon: AlertCircle }
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
  const testStatus = getTestStatus(testsCompleted, candidate.tests_last_updated_at)
  const StatusIcon = testStatus.icon
  const progressPercentage = (testsCompleted / 6) * 100

  // Получаем инициалы для fallback
  const initials = candidate.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  // Формируем корректный URL аватарки
  const avatarUrl = candidate.avatar_url ? (
    candidate.avatar_url.startsWith('http') 
      ? candidate.avatar_url 
      : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${candidate.avatar_url}`
  ) : null

  return (
    <Card className="group overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-md border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border/50 shrink-0">
              {avatarUrl && (
                <AvatarImage 
                  src={avatarUrl} 
                  alt={candidate.full_name || ''} 
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">{candidate.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">{categoryName}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex-1">
        <div className="space-y-4 flex flex-col h-full">
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
          
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex items-center gap-2">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${testStatus.color}`}
              >
                <StatusIcon className="h-3 w-3" />
                {t(`card.${testStatus.textKey}`)}
              </div>
              <HelpCircle topicId="tests_relevance" iconClassName="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 border-t bg-muted/30 pt-4 px-5 pb-5 mt-auto">
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
        testsCompleted={testsCompleted}
      />
    </Card>
  )
}
