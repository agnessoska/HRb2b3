import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VacancyList } from '@/features/vacancy-management/ui/VacancyList'
import { CandidateList } from '@/features/candidate-management/ui/CandidateList'
import { ResumeAnalysis } from '@/features/ai-analysis/ui/ResumeAnalysis'
import { FileSearch, Users, Briefcase } from 'lucide-react'

export default function HRDashboardPage() {
  const { t } = useTranslation('dashboard')

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Tabs defaultValue="vacancies" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="resume-analysis" className="gap-2">
            <FileSearch className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.resume_analysis')}</span>
            <span className="sm:hidden">{t('resume')}</span>
          </TabsTrigger>
          <TabsTrigger value="candidates" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.candidates')}</span>
            <span className="sm:hidden">{t('tabs.candidatesShort')}</span>
          </TabsTrigger>
          <TabsTrigger value="vacancies" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.vacancies')}</span>
            <span className="sm:hidden">{t('tabs.vacanciesShort')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume-analysis" className="space-y-4">
          <ResumeAnalysis />
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
