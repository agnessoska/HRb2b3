import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VacancyList } from '@/features/vacancy-management/ui/VacancyList'
import { CandidateList } from '@/features/candidate-management/ui/CandidateList'
import { ResumeAnalysis } from '@/features/ai-analysis/ui/ResumeAnalysis'
import { FileSearch, Users, Briefcase } from 'lucide-react'

export default function HRDashboardPage() {
  const { t } = useTranslation('dashboard')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Tabs defaultValue="vacancies" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="resume-analysis" className="gap-2">
            <FileSearch className="h-4 w-4" />
            <span>{t('tabs.resume_analysis')}</span>
          </TabsTrigger>
          <TabsTrigger value="candidates" className="gap-2">
            <Users className="h-4 w-4" />
            <span>{t('tabs.candidates')}</span>
          </TabsTrigger>
          <TabsTrigger value="vacancies" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span>{t('tabs.vacancies')}</span>
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
