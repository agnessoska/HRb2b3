import { useQuery } from '@tanstack/react-query'
import { getVacancies } from '../api/getVacancies'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { CreateVacancyDialog } from './CreateVacancyDialog'
import type { Database } from '@/shared/types/database'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Briefcase, MapPin, DollarSign, Users, MoreVertical, Eye, Edit, Archive } from 'lucide-react'

type Vacancy = Database['public']['Tables']['vacancies']['Row']

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-gradient-to-r from-emerald-500 to-green-600'
    case 'closed':
      return 'bg-gradient-to-r from-gray-500 to-slate-600'
    case 'archived':
      return 'bg-gradient-to-r from-red-500 to-rose-600'
    default:
      return 'bg-gradient-to-r from-blue-500 to-blue-600'
  }
}

function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  const { t } = useTranslation('vacancies')
  const navigate = useNavigate()
  const statusColor = getStatusColor(vacancy.status || 'active')

  return (
    <Card className="group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{vacancy.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white ${statusColor}`}
                >
                  {t(`statuses.${vacancy.status}` as keyof typeof t)}
                </div>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log('Edit clicked')}>
                <Edit className="mr-2 h-4 w-4" />
                <span>{t('actions.edit')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => console.log('Archive clicked')}
                className="text-destructive"
              >
                <Archive className="mr-2 h-4 w-4" />
                <span>{t('actions.archive')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2 text-sm text-muted-foreground">
          {vacancy.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{vacancy.location}</span>
            </div>
          )}
          {(vacancy.salary_min || vacancy.salary_max) && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>
                {vacancy.salary_min && vacancy.salary_max
                  ? `$${vacancy.salary_min} - $${vacancy.salary_max}`
                  : vacancy.salary_min
                  ? `${t('salary.from')} $${vacancy.salary_min}`
                  : `${t('salary.upTo')} $${vacancy.salary_max}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-xs">
              {vacancy.funnel_counts ?
                Object.values(vacancy.funnel_counts as Record<string, number>).reduce((a, b) => a + b, 0) : 0
              } {t('common.candidates')}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 border-t bg-muted/30 pt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1"
          onClick={() => navigate(`/hr/vacancy/${vacancy.id}/funnel`)}
        >
          <Eye className="h-3 w-3" />
          {t('actions.view')}
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => navigate(`/hr/vacancy/${vacancy.id}/profile`)}
        >
          {t('actions.manage')}
        </Button>
      </CardFooter>
    </Card>
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
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
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
          <h2 className="text-2xl font-bold tracking-tight">{t('list.header')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('list.description')}
          </p>
        </div>
        <CreateVacancyDialog />
      </div>
      {vacancies && vacancies.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {vacancies.map((vacancy, index) => (
            <div
              key={vacancy.id}
              className="animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
              <VacancyCard vacancy={vacancy} />
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{t('list.empty_title')}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              {t('list.empty_description')}
            </p>
            <div className="mt-6">
              <CreateVacancyDialog />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
