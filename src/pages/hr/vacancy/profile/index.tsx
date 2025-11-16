import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getVacancyById } from '@/features/vacancy-management/api/getVacancyById'
import { useGetApplicationsByVacancy } from '@/features/vacancy-management/api/getApplicationsByVacancy'
import { CompareCandidatesDialog } from '@/features/ai-analysis/ui/CompareCandidatesDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { IdealProfileGenerator } from '@/features/vacancy-management/ui/IdealProfileGenerator'
import { IdealProfileEditor } from '@/features/vacancy-management/ui/IdealProfileEditor'
import { updateVacancyProfile } from '@/features/vacancy-management/api/updateVacancyProfile'

const VacancyProfilePage = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation(['vacancies', 'ai-analysis'])
  const queryClient = useQueryClient()
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false)

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

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: updateVacancyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancy', id] })
      // TODO: Add toast notification for success
    },
    onError: () => {
      // TODO: Add toast notification for error
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
      ?.map((app) => app.candidates)
      .filter((c) => c !== null)
      .map((c) => ({ id: c!.id, full_name: c!.full_name || 'Unnamed Candidate' })) || []

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{vacancy.title}</h1>
            <p className="text-muted-foreground">{t('idealProfile.subtitle')}</p>
          </div>
          <Button
            onClick={() => setIsCompareDialogOpen(true)}
            disabled={(candidatesForComparison.length ?? 0) < 2}
          >
            {t('ai-analysis:compareCandidates.title')}
          </Button>
        </div>

        {vacancy.ideal_profile ? (
        <IdealProfileEditor
          vacancy={vacancy}
          onSave={(data) => saveProfile({ vacancyId: vacancy.id, idealProfile: data })}
          isLoading={isSaving}
        />
      ) : (
        <IdealProfileGenerator vacancy={vacancy} />
      )}
      </div>
      <CompareCandidatesDialog
        isOpen={isCompareDialogOpen}
        onOpenChange={setIsCompareDialogOpen}
        vacancyId={vacancy.id}
        candidates={candidatesForComparison}
      />
    </>
  )
}

export default VacancyProfilePage
