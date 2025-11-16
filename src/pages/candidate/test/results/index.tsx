import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTestById } from '@/features/testing-system/api/getTestById'
import { DashboardLayout } from '@/shared/ui/layouts/DashboardLayout'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTestResultsByCandidate } from '@/features/testing-system/api/getTestResultsByCandidate'
import { useAuthStore, type AuthState } from '@/app/store/auth'
import { BigFiveResults } from '@/features/testing-system/ui/results/BigFiveResults'
import { MBTIResults } from '@/features/testing-system/ui/results/MBTIResults'
import { DISCResults } from '@/features/testing-system/ui/results/DISCResults'
import { EQResults } from '@/features/testing-system/ui/results/EQResults'
import { SoftSkillsResults } from '@/features/testing-system/ui/results/SoftSkillsResults'
import { MotivationResults } from '@/features/testing-system/ui/results/MotivationResults'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

const TestResultsPage = () => {
  const { t } = useTranslation('tests')
  const { testId } = useParams<{ testId: string }>()
  const user = useAuthStore((state: AuthState) => state.user)

  const {
    data: test,
    isLoading: isLoadingTest,
    isError: isErrorTest,
  } = useQuery({
    queryKey: ['test', testId],
    queryFn: () => getTestById(testId!),
    enabled: !!testId,
  })

  const {
    data: results,
    isLoading: isLoadingResults,
    isError: isErrorResults,
  } = useQuery({
    queryKey: ['testResults', user?.id],
    queryFn: () => getTestResultsByCandidate(user!.id),
    enabled: !!user,
  })

  const currentResult = results?.find((r) => r.test_id === testId)

  if (isLoadingTest || isLoadingResults) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-10">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-6 w-2/3 mb-8" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (isErrorTest || isErrorResults || !test) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-10 text-center">
          <p className="text-destructive">{t('results.failedToLoad')}</p>
        </div>
      </DashboardLayout>
    )
  }

  const renderTestResult = () => {
    if (!currentResult) {
      return <p>{t('results.noResults')}</p>
    }

    const normalizedScores = currentResult.normalized_scores as Record<string, number>
    const rawScores = currentResult.raw_scores as Record<string, number>
    const detailedResult = currentResult.detailed_result || ''

    switch (test.code) {
      case 'big_five':
        return <BigFiveResults results={normalizedScores} />
      case 'mbti':
        return <MBTIResults result={detailedResult} rawScores={rawScores} />
      case 'disc':
        return <DISCResults results={normalizedScores} dominantStyle={detailedResult} />
      case 'eq':
        return <EQResults results={normalizedScores} />
      case 'soft_skills':
        return <SoftSkillsResults results={normalizedScores} />
      case 'motivation':
        return <MotivationResults results={normalizedScores} />
      default:
        return <p>{t('results.notAvailable')}</p>
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Button asChild variant="outline" className="self-start">
            <Link to="/candidate/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('results.backToTests')}
            </Link>
          </Button>
          <div className="flex items-center gap-2 self-start md:self-center">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('results.downloadPDF')}
            </Button>
            <Button variant="secondary">{t('results.retakeTest')}</Button>
          </div>
        </header>

        <main id="test-results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">{test.name_ru}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {currentResult?.completed_at && (
                  <span>
                    {t('results.testTakenOn')}: {format(new Date(currentResult.completed_at), 'd MMMM yyyy', { locale: ru })}
                  </span>
                )}
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {t('results.currentStatus')}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {renderTestResult()}
        </main>
      </div>
    </DashboardLayout>
  )
}

export default TestResultsPage
