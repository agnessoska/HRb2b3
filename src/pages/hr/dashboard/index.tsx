import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VacancyList } from '@/features/vacancy-management/ui/VacancyList'
import { CandidateList } from '@/features/candidate-management/ui/CandidateList'
import { FileSearch, Users, Briefcase } from 'lucide-react'

export default function HRDashboardPage() {
  const { t } = useTranslation('dashboard')

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your recruitment process efficiently
        </p>
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
