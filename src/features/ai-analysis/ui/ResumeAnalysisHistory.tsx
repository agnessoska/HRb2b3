import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ru, enUS, kk } from 'date-fns/locale'
import { useGetResumeAnalyses } from '../api/getResumeAnalyses'
import { Button } from '@/components/ui/button'
import { Eye, History, Calendar, Users } from 'lucide-react'
import { ListContainer, ListItem } from '@/shared/ui/ListTransition'
import { GlassCard } from '@/shared/ui/GlassCard'
import { Badge } from '@/components/ui/badge'

interface AnalysisResult {
  id: string
  created_at: string
  resume_count: number | null
  content_html: string | null
  content_markdown: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analysis_data: any
}

interface ResumeAnalysisHistoryProps {
  onViewAnalysis: (analysis: AnalysisResult) => void
}

export const ResumeAnalysisHistory = ({ onViewAnalysis }: ResumeAnalysisHistoryProps) => {
  const { t, i18n } = useTranslation(['ai-analysis', 'common'])
  const { data: analyses, isLoading } = useGetResumeAnalyses()

  const getDateLocale = () => {
    // i18n.language может возвращать 'ru-RU', 'en-US' и т.д.
    const lang = i18n.language.split('-')[0]
    switch (lang) {
      case 'ru': return ru
      case 'kk': return kk
      case 'en': return enUS
      default: return ru // Default to Russian if unknown
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full bg-muted/50 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (!analyses || analyses.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <History className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{t('resumeAnalysis.history.title', 'История анализов')}</h3>
      </div>

      <ListContainer className="space-y-4">
        {analyses.map((analysis) => (
          <ListItem key={analysis.id}>
            <GlassCard className="p-0 hover:bg-card/50 transition-colors overflow-hidden border border-border/50">
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {format(new Date(analysis.created_at), 'PPP p', { locale: getDateLocale() })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Users className="w-4 h-4 text-primary" />
                    <span>
                      {t('resumeAnalysis.history.candidatesCount', { count: analysis.resume_count || 0 })}
                    </span>
                    {analysis.analysis_data && (
                      <Badge variant="outline" className="ml-2 text-xs bg-primary/5 border-primary/20 text-primary">
                        JSON
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewAnalysis(analysis as AnalysisResult)}
                    className="w-full sm:w-auto rounded-xl"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {t('common:view', 'Просмотр')}
                  </Button>
                </div>
              </div>
            </GlassCard>
          </ListItem>
        ))}
      </ListContainer>
    </div>
  )
}