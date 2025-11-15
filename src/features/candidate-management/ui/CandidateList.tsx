import { useOrganization } from '@/shared/hooks/useOrganization'
import { useQuery } from '@tanstack/react-query'
import { getCandidates } from '../api/getCandidates'
import { CandidateCard } from './CandidateCard'
import { useTranslation } from 'react-i18next'
import { GenerateInviteLinkDialog } from './GenerateInviteLinkDialog'

export function CandidateList() {
  const { t } = useTranslation('candidates')
  const { data: organization, isLoading: isOrgLoading } = useOrganization()

  const {
    data: candidates,
    isLoading: areCandidatesLoading,
    isError,
  } = useQuery({
    queryKey: ['candidates', organization?.id],
    queryFn: () => getCandidates(organization!.id),
    enabled: !!organization,
  })

  if (areCandidatesLoading || isOrgLoading) {
    return <div>{t('loading')}</div> // TODO: Add Skeleton loader
  }

  if (isError) {
    return <div>{t('error')}</div> // TODO: Add proper error component
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <GenerateInviteLinkDialog />
      </div>
      {candidates && candidates.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
            <p className="text-muted-foreground">{t('empty.description')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
