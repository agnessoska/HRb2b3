import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getVacancyById } from '@/features/vacancy-management/api/getVacancyById'
import { Skeleton } from '@/components/ui/skeleton'
import { IdealProfileGenerator } from '@/features/vacancy-management/ui/IdealProfileGenerator'
import { IdealProfileEditor } from '@/features/vacancy-management/ui/IdealProfileEditor'
import { updateVacancyProfile } from '@/features/vacancy-management/api/updateVacancyProfile'

const VacancyProfilePage = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('vacancies')
  const queryClient = useQueryClient()

  const {
    data: vacancy,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['vacancy', id],
    queryFn: () => getVacancyById(id!),
    enabled: !!id,
  })

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{vacancy.title}</h1>
        <p className="text-muted-foreground">{t('idealProfile.subtitle')}</p>
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
  )
}

export default VacancyProfilePage
