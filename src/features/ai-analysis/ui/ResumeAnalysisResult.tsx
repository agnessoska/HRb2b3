import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, ArrowLeft, User, ThumbsUp, ThumbsDown, MinusCircle, CheckCircle2, XCircle, AlertTriangle, Brain, MessageCircle, Heart } from 'lucide-react'
import { AIBorder } from '@/shared/ui/AIBorder'
import { AIStreamingText } from '@/shared/ui/AIStreamingText'
import { Progress } from '@/components/ui/progress'
import { pdf } from '@react-pdf/renderer'
import { ResumeAnalysisDocument } from './pdf/ResumeAnalysisDocument'
import type { AnalysisData, AnalysisResult } from '../types'

interface ResumeAnalysisResultProps {
  result: AnalysisResult
  onBack: () => void
}

export const ResumeAnalysisResult = ({ result, onBack }: ResumeAnalysisResultProps) => {
  const { t } = useTranslation(['ai-analysis', 'common'])

  const analysisData = result.analysis_data as AnalysisData | null

  const handleDownloadPDF = async () => {
    if (!analysisData) return

    try {
      const translations = {
        matchScore: t('ai-analysis:resumeAnalysis.result.matchScore'),
        matches: t('ai-analysis:resumeAnalysis.result.matches'),
        hardSkills: t('ai-analysis:resumeAnalysis.result.sections.hardSkills'),
        softSkills: t('ai-analysis:resumeAnalysis.result.sections.softSkills'),
        gaps: t('ai-analysis:resumeAnalysis.result.sections.gaps'),
        redFlags: t('ai-analysis:resumeAnalysis.result.sections.redFlags'),
        culturalFit: t('ai-analysis:resumeAnalysis.result.sections.culturalFit'),
        interviewQuestions: t('ai-analysis:resumeAnalysis.result.sections.interviewQuestions'),
        verdicts: {
          recommended: t('ai-analysis:resumeAnalysis.result.verdicts.recommended'),
          maybe: t('ai-analysis:resumeAnalysis.result.verdicts.maybe'),
          rejected: t('ai-analysis:resumeAnalysis.result.verdicts.rejected'),
        }
      }

      const blob = await pdf(
        <ResumeAnalysisDocument
          data={analysisData}
          title={t('resumeAnalysis.result.title')}
          translations={translations}
        />
      ).toBlob()
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `resume-analysis-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to generate PDF', error)
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'recommended': return 'bg-success/10 text-success border-success/20'
      case 'maybe': return 'bg-warning/10 text-warning border-warning/20'
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'recommended': return <ThumbsUp className="w-4 h-4" />
      case 'maybe': return <MinusCircle className="w-4 h-4" />
      case 'rejected': return <ThumbsDown className="w-4 h-4" />
      default: return null
    }
  }

  if (!analysisData?.candidates) {
    // Fallback to HTML content if no JSON data
    return (
      <div className="space-y-6">
        <AIBorder>
          <Card className="border-none shadow-none">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    <AIStreamingText text={t('resumeAnalysis.result.title')} isStreaming={false} />
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common:back')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: result.content_html || '' }}
              />
            </CardContent>
          </Card>
        </AIBorder>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            {t('resumeAnalysis.result.title')}
          </h2>
        </div>
        <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          {t('ai-analysis:resumeAnalysis.result.downloadPDF')}
        </Button>
      </div>

      <div className="bg-background p-4 sm:p-8 rounded-xl">
        <div className="space-y-8">
          {analysisData.candidates?.map((candidate, index) => (
            <Card key={index} className="candidate-card overflow-hidden border-border/50 shadow-sm break-inside-avoid">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{candidate.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={getVerdictColor(candidate.verdict)}>
                          <span className="flex items-center gap-1">
                            {getVerdictIcon(candidate.verdict)}
                            <span className="capitalize">{t(`ai-analysis:resumeAnalysis.result.verdicts.${candidate.verdict}`)}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="flex-1 text-right">
                      <div className="text-sm font-medium text-muted-foreground mb-1">{t('ai-analysis:resumeAnalysis.result.matchScore')}</div>
                      <div className="text-2xl font-bold text-primary">{candidate.match_score}%</div>
                    </div>
                    <div className="h-14 w-14 relative flex items-center justify-center">
                      <svg className="transform -rotate-90 w-full h-full">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          className="text-muted/20"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 24}
                          strokeDashoffset={2 * Math.PI * 24 * (1 - candidate.match_score / 100)}
                          className="text-primary transition-all duration-1000 ease-out"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-muted/30 p-4 rounded-xl">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {candidate.summary}
                  </p>
                </div>

                {/* Vacancy Matches */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{t('ai-analysis:resumeAnalysis.result.matches')}</h4>
                  <div className="grid gap-3">
                    {candidate.vacancy_matches?.map((match, i) => (
                      <div key={i} className="bg-card border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{match.vacancy_title}</span>
                          <span className="font-bold text-primary">{match.score}%</span>
                        </div>
                        <Progress value={match.score} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">{match.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced Skills Analysis (New Structure) */}
                {candidate.skills ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hard Skills & Pros */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-sm text-success mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          {t('resumeAnalysis.result.sections.hardSkills')}
                        </h4>
                        <ul className="space-y-2">
                          {[...(candidate.pros || []), ...(candidate.skills?.hard_skills_match || [])].map((item, i) => (
                            <li key={i} className="text-sm flex items-baseline gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-success/50 translate-y-[-2px] shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Soft Skills */}
                      {(candidate.skills.soft_skills?.length ?? 0) > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-purple-500 mb-3 flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            {t('resumeAnalysis.result.sections.softSkills')}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills?.soft_skills?.map((skill, i) => (
                              <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Missing Skills & Cons */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-sm text-destructive mb-3 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          {t('resumeAnalysis.result.sections.gaps')}
                        </h4>
                        <ul className="space-y-2">
                          {[...(candidate.cons || []), ...(candidate.skills?.missing_skills || [])].map((item, i) => (
                            <li key={i} className="text-sm flex items-baseline gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-destructive/50 translate-y-[-2px] shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Red Flags */}
                      {(candidate.red_flags?.length ?? 0) > 0 && (
                        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                          <h4 className="font-semibold text-sm text-destructive mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {t('resumeAnalysis.result.sections.redFlags')}
                          </h4>
                          <ul className="space-y-2">
                            {candidate.red_flags?.map((flag, i) => (
                              <li key={i} className="text-sm text-destructive/90 flex items-baseline gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive translate-y-[-2px] shrink-0" />
                                <span>{flag}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Fallback for old data structure
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-sm text-success mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Pros
                      </h4>
                      <ul className="space-y-2">
                        {candidate.pros?.map((pro, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-success/50 mt-1.5 shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-destructive mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Cons
                      </h4>
                      <ul className="space-y-2">
                        {candidate.cons?.map((con, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive/50 mt-1.5 shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Cultural Fit & Interview Questions */}
                {(candidate.cultural_fit || (candidate.interview_questions?.length ?? 0) > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                    {candidate.cultural_fit && (
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-semibold text-sm text-blue-700 mb-2 flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          {t('resumeAnalysis.result.sections.culturalFit')}
                        </h4>
                        <p className="text-sm text-blue-900/80 leading-relaxed">
                          {candidate.cultural_fit}
                        </p>
                      </div>
                    )}
                    
                    {candidate.interview_questions && candidate.interview_questions.length > 0 && (
                      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                        <h4 className="font-semibold text-sm text-amber-700 mb-3 flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          {t('resumeAnalysis.result.sections.interviewQuestions')}
                        </h4>
                        <ul className="space-y-3">
                          {candidate.interview_questions?.map((q, i) => (
                            <li key={i} className="text-sm text-amber-900/80 flex gap-2">
                              <span className="font-bold text-amber-500/50">{i + 1}.</span>
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}