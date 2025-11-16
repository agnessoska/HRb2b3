import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useGetCandidateById } from '@/features/candidate-management/api/getCandidateById'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Bot, Download, Share2 } from 'lucide-react'
import { GenerateFullAnalysisDialog } from '@/features/ai-analysis/ui/GenerateFullAnalysisDialog'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { useGetFullAnalysisByCandidate } from '@/features/ai-analysis/api/getFullAnalysisByCandidate'
import { marked } from 'marked'
import { useTranslation } from 'react-i18next'

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation(['candidates', 'common'])
  const { data: organization } = useOrganization()

  const { 
    data: candidate, 
    isLoading: isLoadingCandidate, 
    isError: isErrorCandidate, 
    error: errorCandidate 
  } = useGetCandidateById(id!)

  const { 
    data: analysis, 
    isLoading: isLoadingAnalysis,
    isError: isErrorAnalysis,
    error: errorAnalysis
  } = useGetFullAnalysisByCandidate(id!, organization?.id)

  const analysisHtml = useMemo(() => {
    if (analysis?.content_markdown) {
      return marked.parse(analysis.content_markdown)
    }
    return ''
  }, [analysis])

  const isLoading = isLoadingCandidate || (organization && isLoadingAnalysis)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-6 w-1/4 mt-2" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isErrorCandidate || isErrorAnalysis) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTitle>{t('common:error')}</AlertTitle>
          <AlertDescription>{errorCandidate?.message || errorAnalysis?.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{candidate?.full_name}</h1>
        <p className="mt-2 text-muted-foreground">{t('profile.title')}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('profile.aiAnalysisCard.title')}</CardTitle>
              {analysis && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    {t('common:share')}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    {t('common:downloadPdf')}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div 
                  className="prose dark:prose-invert max-w-none" 
                  dangerouslySetInnerHTML={{ __html: analysisHtml as string }} 
                />
              ) : (
                <div className="text-center py-12">
                  <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">{t('profile.aiAnalysisCard.empty.title')}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t('profile.aiAnalysisCard.empty.description')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.actionsCard.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <GenerateFullAnalysisDialog 
                candidateId={id!} 
                testsCompleted={candidate?.tests_completed || 0} 
              />
              {(candidate?.tests_completed || 0) < 6 && (
                <p className="text-xs text-muted-foreground pt-1">
                  {t('profile.actionsCard.analysisDisabledTooltip')}
                </p>
              )}
              <Button variant="outline" className="w-full" disabled>{t('profile.actionsCard.invite')}</Button>
              <Button variant="outline" className="w-full" disabled>{t('profile.actionsCard.offer')}</Button>
              <Button variant="destructive" className="w-full" disabled>{t('profile.actionsCard.reject')}</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.detailsCard.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>{t('profile.detailsCard.email')}:</strong> {candidate?.id}</p>
              <p><strong>{t('profile.detailsCard.phone')}:</strong> {candidate?.phone || t('common:notSpecified')}</p>
              <p><strong>{t('profile.detailsCard.experience')}:</strong> {candidate?.experience || t('common:notSpecified')}</p>
              <p><strong>{t('profile.detailsCard.education')}:</strong> {candidate?.education || t('common:notSpecified')}</p>
              <p><strong>{t('profile.detailsCard.about')}:</strong> {candidate?.about || t('common:notSpecified')}</p>
              <p><strong>{t('profile.detailsCard.testsCompleted')}:</strong> {candidate?.tests_completed || 0}/6</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
