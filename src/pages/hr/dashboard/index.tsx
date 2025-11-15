import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VacancyList } from '@/features/vacancy-management/ui/VacancyList'
import { CandidateList } from '@/features/candidate-management/ui/CandidateList'

export default function HRDashboardPage() {
  const { t } = useTranslation('dashboard')

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">{t('title')}</h1>
      <Tabs defaultValue="vacancies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resume-analysis">
            {t('tabs.resume_analysis')}
          </TabsTrigger>
          <TabsTrigger value="candidates">{t('tabs.candidates')}</TabsTrigger>
          <TabsTrigger value="vacancies">{t('tabs.vacancies')}</TabsTrigger>
        </TabsList>
        <TabsContent value="resume-analysis">
          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.resume_analysis')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Resume analysis content will be here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="candidates">
          <CandidateList />
        </TabsContent>
        <TabsContent value="vacancies">
          <VacancyList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
