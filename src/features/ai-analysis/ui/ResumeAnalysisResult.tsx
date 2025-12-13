import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, ArrowLeft, User, ThumbsUp, ThumbsDown, MinusCircle, CheckCircle2, XCircle, AlertTriangle, Brain, MessageCircle, Heart, UserPlus, Copy } from 'lucide-react'
import { AIBorder } from '@/shared/ui/AIBorder'
import { AIStreamingText } from '@/shared/ui/AIStreamingText'
import { Progress } from '@/components/ui/progress'
import { pdf } from '@react-pdf/renderer'
import { ResumeAnalysisDocument } from './pdf/ResumeAnalysisDocument'
import type { AnalysisCandidate, AnalysisData, AnalysisResult } from '../types'
import { useVacanciesByIds } from '@/features/vacancy-management/api/getVacancies'
import { useCreateCandidateFromAnalysis } from '../api/createCandidateFromAnalysis'
import { useCheckInviteTokensStatus } from '../api/checkInviteTokensStatus'
import { useGetResumeAnalysisById } from '../api/getResumeAnalysisById'
import { useUpdateAnalysisInvite } from '../api/updateAnalysisInvite'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { toast } from 'sonner'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ResumeAnalysisResultProps {
  result: AnalysisResult
  onBack: () => void
}

export const ResumeAnalysisResult = ({ result: initialResult, onBack }: ResumeAnalysisResultProps) => {
  const { t } = useTranslation(['ai-analysis', 'common'])
  const { data: hrProfile } = useHrProfile()
  const [inviteDialogData, setInviteDialogData] = useState<{ id?: string, link: string } | null>(null)
  
  // Subscribe to analysis updates (to get new invite tokens)
  const { data: result } = useGetResumeAnalysisById(initialResult.id, initialResult)
  
  // Get vacancies involved in this analysis
  const { data: vacancies = [] } = useVacanciesByIds(result?.vacancy_ids || [])
  
  const analysisData = (result?.analysis_data || null) as AnalysisData | null

  // Check status for all tokens
  const tokens = analysisData?.candidates
    .map(c => c.invite_token)
    .filter(Boolean) as string[] || []
    
  const { data: tokensStatus } = useCheckInviteTokensStatus(tokens)

  const { mutate: createCandidate, isPending: isCreating } = useCreateCandidateFromAnalysis()
  const { mutate: updateInvite } = useUpdateAnalysisInvite()

  const handleInvite = (candidate: AnalysisCandidate, vacancyId: string, index: number) => {
    if (!hrProfile || !result) return

    createCandidate({
      candidateData: candidate,
      vacancyId,
      hrId: hrProfile.id
    }, {
      onSuccess: (data) => {
        toast.success(t('ai-analysis:resumeAnalysis.result.inviteSuccess'))
        const inviteLink = `${window.location.origin}/auth/login?token=${data.invite_token}`
        setInviteDialogData({ id: data.candidate_id, link: inviteLink })
        
        // Save token to analysis result
        if (result) {
          updateInvite({
            analysisId: result.id,
            candidateIndex: index,
            inviteToken: data.invite_token
          })
        }
      },
      onError: (error) => {
        console.error(error)
        toast.error(t('common:error'))
      }
    })
  }

  const handleShowLink = (token: string) => {
    const inviteLink = `${window.location.origin}/auth/login?token=${token}`
    setInviteDialogData({ link: inviteLink })
  }

  const handleCopyLink = () => {
    if (inviteDialogData?.link) {
      navigator.clipboard.writeText(inviteDialogData.link)
      toast.success(t('common:copied'))
    }
  }

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
                dangerouslySetInnerHTML={{ __html: result?.content_html || '' }}
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

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-border/50 flex justify-end gap-3">
                  {(() => {
                    const token = candidate.invite_token
                    const status = token ? tokensStatus?.find(s => s.token === token) : null
                    
                    if (status?.is_used) {
                      return (
                        <Button disabled variant="secondary" className="gap-2 bg-success/10 text-success hover:bg-success/20">
                          <User className="w-4 h-4" />
                          {t('ai-analysis:resumeAnalysis.result.status.registered')}
                        </Button>
                      )
                    }

                    if (token) {
                      return (
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleShowLink(token)}
                        >
                          <Copy className="w-4 h-4" />
                          {t('ai-analysis:resumeAnalysis.result.status.copyLink')}
                        </Button>
                      )
                    }

                    return vacancies.length > 1 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="gap-2" disabled={isCreating}>
                            <UserPlus className="w-4 h-4" />
                            {t('ai-analysis:resumeAnalysis.result.invite')}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>{t('ai-analysis:resumeAnalysis.result.selectVacancy')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {vacancies.map((vacancy) => {
                            const match = candidate.vacancy_matches?.find(m => m.vacancy_title === vacancy.title)
                            return (
                              <DropdownMenuItem
                                key={vacancy.id}
                                onClick={() => handleInvite(candidate, vacancy.id, index)}
                                className="flex justify-between items-center"
                              >
                                <span className="truncate">{vacancy.title}</span>
                                {match && <span className="text-xs text-muted-foreground ml-2">{match.score}%</span>}
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        className="gap-2"
                        disabled={isCreating}
                        onClick={() => vacancies[0] && handleInvite(candidate, vacancies[0].id, index)}
                      >
                        <UserPlus className="w-4 h-4" />
                        {t('ai-analysis:resumeAnalysis.result.invite')}
                      </Button>
                    )
                  })()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!inviteDialogData} onOpenChange={(open) => !open && setInviteDialogData(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('ai-analysis:resumeAnalysis.result.inviteCreated')}</DialogTitle>
            <DialogDescription>
              {t('ai-analysis:resumeAnalysis.result.inviteCreatedDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={inviteDialogData?.link}
                readOnly
              />
            </div>
            <Button size="sm" className="px-3" onClick={handleCopyLink}>
              <span className="sr-only">Copy</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={() => setInviteDialogData(null)}>
              {t('common:close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}