import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTestById } from '@/features/testing-system/api/getTestById'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { getTestResultsByCandidate } from '@/features/testing-system/api/getTestResultsByCandidate'
import { useAuthStore, type AuthState } from '@/app/store/auth'
import { BigFiveResults } from '@/features/testing-system/ui/results/BigFiveResults'
import { MBTIResults } from '@/features/testing-system/ui/results/MBTIResults'
import { DISCResults } from '@/features/testing-system/ui/results/DISCResults'
import { EQResults } from '@/features/testing-system/ui/results/EQResults'
import { SoftSkillsResults } from '@/features/testing-system/ui/results/SoftSkillsResults'
import { MotivationResults } from '@/features/testing-system/ui/results/MotivationResults'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format, addMonths, isAfter } from 'date-fns'
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

  const canRetake = currentResult?.completed_at &&
    isAfter(new Date(), addMonths(new Date(currentResult.completed_at), 1))

  if (isLoadingTest || isLoadingResults) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-6 w-2/3 mb-8" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isErrorTest || isErrorResults || !test) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-destructive">{t('results.failedToLoad')}</p>
      </div>
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
    <div className="container mx-auto py-10 space-y-8 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Button asChild variant="ghost" className="self-start pl-0 hover:bg-transparent hover:text-primary group">
            <Link to="/candidate/dashboard" className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="text-lg font-medium">{t('results.backToTests')}</span>
            </Link>
          </Button>
          
          <div className="flex items-center gap-2 self-start md:self-center">
            {canRetake && (
              <Button variant="secondary" asChild className="rounded-full">
                 <Link to={`/candidate/test/${testId}`}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('results.retakeTest')}
                 </Link>
              </Button>
            )}
          </div>
        </header>

        <main id="test-results" className="space-y-8">
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight break-words">{test.name_ru}</h1>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 px-3 py-1 text-sm whitespace-nowrap">
                {t('results.currentStatus')}
              </Badge>
            </div>
            
            {currentResult?.completed_at && (
              <p className="text-muted-foreground">
                {t('results.testTakenOn')}: {format(new Date(currentResult.completed_at), 'd MMMM yyyy', { locale: ru })}
              </p>
            )}
          </div>

          {renderTestResult()}
        </main>
    </div>
  )
}

export default TestResultsPage
