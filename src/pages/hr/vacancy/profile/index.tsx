import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getVacancyById } from '@/features/vacancy-management/api/getVacancyById'
import { useGetApplicationsByVacancy } from '@/features/vacancy-management/api/getApplicationsByVacancy'
import { useGetComparisonById } from '@/features/ai-analysis/api/getComparisons'
import { CompareCandidatesDialog } from '@/features/ai-analysis/ui/CompareCandidatesDialog'
import { ComparisonResultView } from '@/features/ai-analysis/ui/ComparisonResultView'
import { ComparisonHistory } from '@/features/ai-analysis/ui/ComparisonHistory'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IdealProfileGenerator } from '@/features/vacancy-management/ui/IdealProfileGenerator'
import { IdealProfileEditor } from '@/features/vacancy-management/ui/IdealProfileEditor'
import { updateVacancyProfile } from '@/features/vacancy-management/api/updateVacancyProfile'
import { ArrowLeft, Target, Users } from 'lucide-react'
import { toast } from 'sonner'

const VacancyProfilePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['vacancies', 'ai-analysis', 'common'])
  const queryClient = useQueryClient()
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false)
  const [viewingComparisonId, setViewingComparisonId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('profile')

  const {
    data: vacancy,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['vacancy', id],
    queryFn: () => getVacancyById(id!),
    enabled: !!id,
  })

  const { data: applications } = useGetApplicationsByVacancy(id!)
  const { data: viewingComparison } = useGetComparisonById(viewingComparisonId)

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: updateVacancyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancy', id] })
      toast.success(t('profileUpdatedSuccess'))
    },
    onError: () => {
      toast.error(t('profileUpdatedError'))
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !vacancy) {
    return <div>{t('vacancyNotFound')}</div>
  }

  const candidatesForComparison =
    applications
      ?.filter((app) => app.candidate !== null)
      .map((app) => ({
        id: app.candidate.id,
        full_name: app.candidate.full_name || 'Unnamed Candidate',
        tests_completed: app.candidate.tests_completed || 0
      })) || []

  const candidateNamesMap = applications?.reduce((acc, app) => {
    if (app.candidate) {
      acc[app.candidate.id] = app.candidate.full_name || 'Unknown'
    }
    return acc
  }, {} as Record<string, string>) || {}

  if (viewingComparisonId && viewingComparison) {
    return (
      <ComparisonResultView
        data={viewingComparison.ranking}
        candidateNames={candidateNamesMap}
        onBack={() => setViewingComparisonId(null)}
      />
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/hr/dashboard?tab=vacancies')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{vacancy.title}</h1>
          <p className="text-muted-foreground mt-1">{t('idealProfile.subtitle')}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile" className="gap-2">
            <Target className="h-4 w-4" />
            {t('tabs.idealProfile')}
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <Users className="h-4 w-4" />
            {t('tabs.comparison')}
          </TabsTrigger>
        </TabsList>

        {/* Ideal Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          {vacancy.ideal_profile ? (
            <IdealProfileEditor
              vacancy={vacancy}
              onSave={(data) => saveProfile({ vacancyId: vacancy.id, idealProfile: data })}
              isLoading={isSaving}
            />
          ) : (
            <IdealProfileGenerator vacancy={vacancy} />
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{t('tabs.comparisonTitle')}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t('tabs.comparisonDescription')}</p>
            </div>
            <Button
              onClick={() => setIsCompareDialogOpen(true)}
              disabled={(candidatesForComparison.length ?? 0) < 2}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              {t('ai-analysis:compareCandidates.title')}
            </Button>
          </div>

          <ComparisonHistory
            vacancyId={vacancy.id}
            onViewComparison={setViewingComparisonId}
          />
        </TabsContent>
      </Tabs>

      <CompareCandidatesDialog
        isOpen={isCompareDialogOpen}
        onOpenChange={setIsCompareDialogOpen}
        vacancyId={vacancy.id}
        candidates={candidatesForComparison}
        onComparisonCreated={(comparisonId) => {
          queryClient.invalidateQueries({ queryKey: ['comparisons', vacancy.id] })
          setViewingComparisonId(comparisonId)
        }}
      />
    </div>
  )
}
export default VacancyProfilePage
