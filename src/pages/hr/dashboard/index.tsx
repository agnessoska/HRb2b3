import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VacancyList } from '@/features/vacancy-management/ui/VacancyList'
import { CandidateList } from '@/features/candidate-management/ui/CandidateList'
import { ResumeAnalysis } from '@/features/ai-analysis/ui/ResumeAnalysis'
import { FileSearch, Users, Briefcase } from 'lucide-react'
import { GlassCard } from '@/shared/ui/GlassCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HelpCircle } from '@/shared/ui/HelpCircle'

export default function HRDashboardPage() {
  const { t } = useTranslation('dashboard')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'vacancies'

  // Set default tab if not present
  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'vacancies' }, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <GlassCard className="p-4 sm:p-6 border-none shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 truncate">
            {t('title')}
          </h1>
          <HelpCircle topicId="dashboard" className="shrink-0" iconClassName="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <p className="mt-1 sm:mt-2 text-muted-foreground text-xs sm:text-lg line-clamp-3 sm:line-clamp-none">
          {t('description')}
        </p>
      </GlassCard>

      {/* Mobile View: Select */}
      <div className="sm:hidden">
        <Select value={activeTab} onValueChange={handleTabChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="resume-analysis">
              <div className="flex items-center gap-2">
                <FileSearch className="h-4 w-4" />
                {t('tabs.resume_analysis')}
              </div>
            </SelectItem>
            <SelectItem value="candidates">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('tabs.candidates')}
              </div>
            </SelectItem>
            <SelectItem value="vacancies">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {t('tabs.vacancies')}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
        {/* Desktop View: TabsList */}
        <TabsList className="hidden sm:grid w-full grid-cols-3 h-12 p-1 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/50">
          <TabsTrigger value="resume-analysis" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileSearch className="h-4 w-4" />
            <span>{t('tabs.resume_analysis')}</span>
          </TabsTrigger>
          <TabsTrigger value="candidates" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="h-4 w-4" />
            <span>{t('tabs.candidates')}</span>
          </TabsTrigger>
          <TabsTrigger value="vacancies" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
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
