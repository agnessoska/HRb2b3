import { useOrganization } from '@/shared/hooks/useOrganization'
import { useQuery } from '@tanstack/react-query'
import { getCandidates } from '../api/getCandidates'
import { CandidateCard } from './CandidateCard'
import { useTranslation } from 'react-i18next'
import { GenerateInviteLinkDialog } from './GenerateInviteLinkDialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Users } from 'lucide-react'

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
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-destructive">{t('error')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Candidates</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your candidate pool
          </p>
        </div>
        <GenerateInviteLinkDialog />
      </div>
      {candidates && candidates.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {candidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className="animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
              <CandidateCard candidate={candidate} />
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{t('empty.title')}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              {t('empty.description')}
            </p>
            <div className="mt-6">
              <GenerateInviteLinkDialog />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
