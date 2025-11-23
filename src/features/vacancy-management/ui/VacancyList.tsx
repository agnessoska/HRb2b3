import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getVacancies } from '../api/getVacancies'
import { updateVacancy } from '../api/updateVacancy'
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
import { Briefcase, MapPin, Users, MoreVertical, Eye, Edit, Archive } from 'lucide-react'
import { toast } from 'sonner'
import { ListContainer, ListItem } from '@/shared/ui/ListTransition'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Vacancy = Database['public']['Tables']['vacancies']['Row']

const currencyMap: Record<string, string> = {
  USD: '$',
  KZT: '₸',
  RUB: '₽',
  EUR: '€',
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'active':
      return 'bg-success/10 text-success hover:bg-success/20 border-success/20'
    case 'closed':
      return 'bg-muted text-muted-foreground hover:bg-muted/80 border-border'
    case 'archived':
      return 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20'
    default:
      return 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
  }
}

interface VacancyCardProps {
  vacancy: Vacancy
  onEdit: (vacancy: Vacancy) => void
  onArchive: (vacancy: Vacancy) => void
}

function VacancyCard({ vacancy, onEdit, onArchive }: VacancyCardProps) {
  const { t } = useTranslation('vacancies')
  const navigate = useNavigate()
  const statusStyles = getStatusStyles(vacancy.status || 'active')
  const currencySymbol = currencyMap[vacancy.currency || 'USD'] || '$'

  return (
    <Card className="group relative overflow-hidden border-transparent shadow-lg shadow-primary/5 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 bg-card rounded-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4 flex-1 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${statusStyles}`}
                >
                  {t(`statuses.${vacancy.status}` as keyof typeof t)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => onEdit(vacancy)} className="rounded-lg cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      <span>{t('actions.edit')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onArchive(vacancy)}
                      className="text-destructive focus:text-destructive rounded-lg cursor-pointer"
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      <span>{t('actions.archive')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-xl font-bold truncate leading-tight">{vacancy.title}</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground">
          {vacancy.location && (
            <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">{vacancy.location}</span>
            </div>
          )}
          {(vacancy.salary_min || vacancy.salary_max) && (
            <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
              <div className="flex h-3.5 w-3.5 items-center justify-center text-primary font-bold text-xs">
                {currencySymbol}
              </div>
              <span className="font-medium">
                {vacancy.salary_min && vacancy.salary_max
                  ? `${vacancy.salary_min} - ${vacancy.salary_max}`
                  : vacancy.salary_min
                  ? `${t('salary.from')} ${vacancy.salary_min}`
                  : `${t('salary.upTo')} ${vacancy.salary_max}`}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-secondary/50">
          <div className="flex items-center gap-2">
            <div className="bg-background p-1.5 rounded-lg shadow-sm">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('card.candidates')}</span>
              <span className="text-sm font-bold">
                {vacancy.funnel_counts ?
                  Object.values(vacancy.funnel_counts as Record<string, number>).reduce((a, b) => a + b, 0) : 0
                }
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-8 gap-1 hover:bg-background hover:text-primary" onClick={() => navigate(`/hr/vacancy/${vacancy.id}/funnel`)}>
            {t('card.view_funnel')} <Eye className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-3 px-6 pb-6 pt-0">
        <Button
          className="flex-1 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
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
  const queryClient = useQueryClient()
  const [vacancyToEdit, setVacancyToEdit] = useState<Vacancy | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('active')

  const {
    data: vacancies,
    isLoading: isLoadingVacancies,
    isError,
  } = useQuery({
    queryKey: ['vacancies', organizationId],
    queryFn: () => getVacancies(organizationId!),
    enabled: !!organizationId,
  })

  const filteredVacancies = vacancies?.filter((vacancy) => {
    if (activeTab === 'all') return true
    return (vacancy.status || 'active') === activeTab
  })

  const { mutate: archiveVacancy } = useMutation({
    mutationFn: updateVacancy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies', organizationId] })
      toast.success(t('archivedSuccess'))
    },
    onError: () => {
      toast.error(t('archivedError'))
    },
  })

  const handleEdit = (vacancy: Vacancy) => {
    setVacancyToEdit(vacancy)
    setIsEditOpen(true)
  }

  const handleArchive = (vacancy: Vacancy) => {
    if (confirm(t('confirmArchive'))) {
      archiveVacancy({ id: vacancy.id, status: 'archived' })
    }
  }

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            {t('statuses.active')}
            <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {vacancies?.filter((v) => (v.status || 'active') === 'active').length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger value="closed">
            {t('statuses.closed')}
            <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
              {vacancies?.filter((v) => v.status === 'closed').length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger value="archived">
            {t('statuses.archived')}
            <span className="ml-2 text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">
              {vacancies?.filter((v) => v.status === 'archived').length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger value="all">{t('statuses.all')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredVacancies && filteredVacancies.length > 0 ? (
            <ListContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {filteredVacancies.map((vacancy) => (
                <ListItem key={vacancy.id} className="h-full">
                  <VacancyCard
                    vacancy={vacancy}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                  />
                </ListItem>
              ))}
            </ListContainer>
          ) : (
            <Card className="border-2 border-dashed border-muted/60 bg-muted/10 hover:bg-muted/20 transition-colors rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-bold tracking-tight">
                  {activeTab === 'all' ? t('list.empty_title') : t(`list.empty_${activeTab}`)}
                </h3>
                <p className="mt-2 text-base text-muted-foreground max-w-md">
                  {activeTab === 'all'
                    ? t('list.empty_description')
                    : t(`list.empty_${activeTab}_description`)}
                </p>
                {activeTab === 'active' && (
                  <div className="mt-8">
                    <CreateVacancyDialog />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateVacancyDialog
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) setVacancyToEdit(null)
        }}
        vacancyToEdit={vacancyToEdit}
      />
    </div>
  )
}
