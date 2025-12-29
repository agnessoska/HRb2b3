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

  const totalCandidates = vacancy.funnel_counts ?
    Object.values(vacancy.funnel_counts as Record<string, number>).reduce((a, b) => a + b, 0) : 0

  return (
    <Card className="group relative overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-all duration-300 bg-card rounded-2xl flex flex-col h-full">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${statusStyles}`}
              >
                {t(`statuses.${vacancy.status}` as keyof typeof t)}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl min-w-[160px]">
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
            <CardTitle className="text-lg font-bold truncate tracking-tight text-foreground/90">{vacancy.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 px-5 flex-1">
        <div className="flex flex-wrap gap-2 text-sm">
          {vacancy.location && (
            <div className="flex items-center gap-1 bg-muted/40 text-muted-foreground px-2 py-1 rounded-lg border border-border/30">
              <MapPin className="h-3 w-3" />
              <span className="text-xs font-medium">{vacancy.location}</span>
            </div>
          )}
          {(vacancy.salary_min || vacancy.salary_max) && (
            <div className="flex items-center gap-1 bg-muted/40 text-muted-foreground px-2 py-1 rounded-lg border border-border/30">
              <span className="text-xs font-bold text-primary/70">{currencySymbol}</span>
              <span className="text-xs font-semibold">
                {vacancy.salary_min && vacancy.salary_max
                  ? `${vacancy.salary_min} - ${vacancy.salary_max}`
                  : vacancy.salary_min
                  ? `${t('salary.from')} ${vacancy.salary_min}`
                  : `${t('salary.upTo')} ${vacancy.salary_max}`}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-5 p-4 rounded-xl bg-muted/20 border border-border/50 group/funnel relative overflow-hidden transition-all hover:bg-muted/30">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-background/80 p-2 rounded-lg shadow-sm border border-border/20">
                <Users className="h-4 w-4 text-primary/80" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('card.candidates')}</span>
                <span className="text-lg font-extrabold leading-none mt-0.5 tracking-tight">{totalCandidates}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-9 rounded-lg gap-2 bg-background border-border/60 hover:border-primary hover:text-primary hover:shadow-sm transition-all" 
              onClick={() => navigate(`/hr/vacancy/${vacancy.id}/funnel`)}
            >
              {t('card.view_funnel')}
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 pb-5 pt-0">
        <Button
          variant="default"
          className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
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
