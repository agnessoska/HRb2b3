import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VacancyList } from '@/features/vacancy-management/ui/VacancyList'
import { CandidateList } from '@/features/candidate-management/ui/CandidateList'
import { FileSearch, Users, Briefcase, TrendingUp, CheckCircle2, Clock } from 'lucide-react'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { useQuery } from '@tanstack/react-query'
import { getVacancies } from '@/features/vacancy-management/api/getVacancies'
import { getCandidates } from '@/features/candidate-management/api/getCandidates'

export default function HRDashboardPage() {
  const { t } = useTranslation('dashboard')
  const { data: organization } = useOrganization()

  // Fetch data for stats
  const { data: vacancies } = useQuery({
    queryKey: ['vacancies', organization?.id],
    queryFn: () => getVacancies(organization!.id),
    enabled: !!organization,
  })

  const { data: candidates } = useQuery({
    queryKey: ['candidates', organization?.id],
    queryFn: () => getCandidates(organization!.id),
    enabled: !!organization,
  })

  // Calculate stats
  const totalVacancies = vacancies?.length || 0
  const activeVacancies = vacancies?.filter(v => v.status === 'active').length || 0
  const totalCandidates = candidates?.length || 0
  const activeCandidates = candidates?.filter(c =>
    c.tests_completed > 0 && c.tests_completed < 6
  ).length || 0

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your recruitment process efficiently
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Total Vacancies */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Vacancies</p>
                <p className="text-3xl font-bold">{totalVacancies}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-blue-100 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span>{activeVacancies} active</span>
            </div>
          </div>
        </Card>

        {/* Total Candidates */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Total Candidates</p>
                <p className="text-3xl font-bold">{totalCandidates}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-emerald-100 text-xs">
              <CheckCircle2 className="h-3 w-3" />
              <span>in your pipeline</span>
            </div>
          </div>
        </Card>

        {/* Active Candidates */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-1">Active Candidates</p>
                <p className="text-3xl font-bold">{activeCandidates}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-amber-100 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span>in progress</span>
            </div>
          </div>
        </Card>

        {/* Completed Tests */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Completed Tests</p>
                <p className="text-3xl font-bold">
                  {candidates?.filter(c => c.tests_completed === 6).length || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-purple-100 text-xs">
              <FileSearch className="h-3 w-3" />
              <span>ready for review</span>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="vacancies" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="resume-analysis" className="gap-2">
            <FileSearch className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.resume_analysis')}</span>
            <span className="sm:hidden">Resume</span>
          </TabsTrigger>
          <TabsTrigger value="candidates" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.candidates')}</span>
            <span className="sm:hidden">Candidates</span>
          </TabsTrigger>
          <TabsTrigger value="vacancies" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.vacancies')}</span>
            <span className="sm:hidden">Vacancies</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume-analysis" className="space-y-4">
          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{t('tabs.resume_analysis')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Resume Analysis</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Upload and analyze resumes with AI-powered insights. This feature will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <CandidateList />
        </TabsContent>

        <TabsContent value="vacancies" className="space-y-4">
          <VacancyList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
