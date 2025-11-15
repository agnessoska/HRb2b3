import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Database } from '@/shared/types/database'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

type Candidate = Database['public']['Tables']['candidates']['Row']

interface CandidateCardProps {
  candidate: Candidate
}

function getTestStatus(lastUpdatedAt: string | null) {
  if (!lastUpdatedAt) {
    return {
      textKey: 'statuses.relevant', // Default for new candidates
      color: 'bg-gray-500',
    }
  }

  const lastUpdateDate = new Date(lastUpdatedAt)
  const now = new Date()
  const monthsDiff =
    (now.getFullYear() - lastUpdateDate.getFullYear()) * 12 +
    (now.getMonth() - lastUpdateDate.getMonth())

  if (monthsDiff < 1) {
    return { textKey: 'statuses.relevant', color: 'bg-green-500' }
  } else if (monthsDiff <= 2) {
    return { textKey: 'statuses.expiring', color: 'bg-yellow-500' }
  } else {
    return { textKey: 'statuses.outdated', color: 'bg-red-500' }
  }
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const { t } = useTranslation('candidates')
  const testsCompleted = candidate.tests_completed || 0

  // TODO: Get category name from professional_categories table
  const categoryName = candidate.category_id || 'N/A'

  const testStatus = getTestStatus(candidate.tests_last_updated_at)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{candidate.full_name}</CardTitle>
        <p className="text-sm text-muted-foreground">{categoryName}</p>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <p className="mb-1 text-sm font-medium">
            {t('card.testing_progress')}
          </p>
          <div className="flex items-center gap-1">
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${(testsCompleted / 6) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold">
              {testsCompleted}/6
            </span>
          </div>
        </div>
        {testsCompleted > 0 && (
          <div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs text-primary-foreground ${testStatus.color}`}
            >
              {t('card.test_status_label', {
                status: t(testStatus.textKey),
              })}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          {t('card.profile_button')}
        </Button>
        <Button size="sm">{t('card.assign_button')}</Button>
      </CardFooter>
    </Card>
  )
}
