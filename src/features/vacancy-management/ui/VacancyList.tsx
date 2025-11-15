import { useQuery } from '@tanstack/react-query'
import { getVacancies } from '../api/getVacancies'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { CreateVacancyDialog } from './CreateVacancyDialog'
import type { Database } from '@/shared/types/database'
import { useTranslation } from 'react-i18next'

type Vacancy = Database['public']['Tables']['vacancies']['Row']

// TODO: Create a proper VacancyCard component
function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  const { t } = useTranslation('vacancies')
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <h3 className="font-semibold">{vacancy.title}</h3>
      <p className="text-sm text-muted-foreground">
        {t(`statuses.${vacancy.status}` as keyof typeof t)}
      </p>
    </div>
  )
}

export function VacancyList() {
  const { t } = useTranslation('vacancies')
  const { data: organization, isLoading: isLoadingOrg } = useOrganization()
  const organizationId = organization?.id

  const {
    data: vacancies,
    isLoading: isLoadingVacancies,
    isError,
  } = useQuery({
    queryKey: ['vacancies', organizationId],
    queryFn: () => getVacancies(organizationId!),
    enabled: !!organizationId,
  })

  if (isLoadingOrg || isLoadingVacancies) {
    return <div>{t('loading')}</div>
  }

  if (isError) {
    return <div>{t('error')}</div>
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('list.header')}</h2>
        <CreateVacancyDialog />
      </div>
      {vacancies && vacancies.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vacancies.map((vacancy) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <h3 className="text-xl font-semibold">{t('list.empty_title')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('list.empty_description')}
          </p>
          <div className="mt-4">
            <CreateVacancyDialog />
          </div>
        </div>
      )}
    </div>
  )
}
