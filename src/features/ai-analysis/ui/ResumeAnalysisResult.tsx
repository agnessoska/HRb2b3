import { ArrowLeft, ThumbsUp, ThumbsDown, MinusCircle, CheckCircle2, AlertTriangle, Brain, MessageCircle, Heart, UserPlus, Copy, Filter, SortAsc, SortDesc, Search, Check, ChevronDown, Sparkles, FileText, FileType2, X, Briefcase, Calendar } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/shared/lib/supabase'
import type { AnalysisCandidate, AnalysisData, AnalysisResult } from '../types'
import { useVacanciesByIds } from '@/features/vacancy-management/api/getVacancies'
import { useCreateCandidateFromAnalysis } from '../api/createCandidateFromAnalysis'
import { useCheckInviteTokensStatus } from '../api/checkInviteTokensStatus'
import { useGetResumeAnalysisById } from '../api/getResumeAnalysisById'
import { useUpdateAnalysisInvite } from '../api/updateAnalysisInvite'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { toast } from 'sonner'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { HelpCircle } from '@/shared/ui/HelpCircle'

interface ResumeAnalysisResultProps {
  result: AnalysisResult
  onBack: () => void
}

export const ResumeAnalysisResult = ({ result: initialResult, onBack }: ResumeAnalysisResultProps) => {
  const { t } = useTranslation(['ai-analysis', 'common'])
  const { data: hrProfile } = useHrProfile()
  const [inviteDialogData, setInviteDialogData] = useState<{ id?: string, link: string } | null>(null)
  
  // Filters and Sorting State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVerdicts, setSelectedVerdicts] = useState<string[]>(['recommended', 'maybe', 'rejected'])
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [expandedCards, setExpandedCards] = useState<string[]>([])
  
  // Subscribe to analysis updates (to get new invite tokens)
  const { data: result } = useGetResumeAnalysisById(initialResult.id, initialResult)
  
  // Get vacancies involved in this analysis
  const { data: vacancies = [] } = useVacanciesByIds(result?.vacancy_ids || [])
  
  const analysisData = (result?.analysis_data || null) as AnalysisData | null

  // Filtered and Sorted Candidates
  const filteredCandidates = useMemo(() => {
    if (!analysisData?.candidates) return []
    
    return analysisData.candidates
      .filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesVerdict = selectedVerdicts.includes(candidate.verdict)
        return matchesSearch && matchesVerdict
      })
      .sort((a, b) => {
        return sortOrder === 'desc' ? b.match_score - a.match_score : a.match_score - b.match_score
      })
  }, [analysisData, searchQuery, selectedVerdicts, sortOrder])

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

  const handleViewResume = async (fileName?: string) => {
    if (!fileName || !result?.file_paths) {
      toast.error(t('ai-analysis:resumeAnalysis.result.fileNotFound'))
      return
    }

    // Find the full path in file_paths that contains this fileName
    const fullPath = result.file_paths.find(path => path.includes(fileName))
    
    if (!fullPath) {
      toast.error(t('ai-analysis:resumeAnalysis.result.fileNotFound'))
      return
    }

    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(fullPath, 3600) // 1 hour

      if (error) throw error

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Error generating signed URL:', error)
      toast.error(t('common:error'))
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'recommended': return 'bg-success/10 text-success border-success/20'
      case 'maybe': return 'bg-warning/10 text-warning border-warning/20'
      case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
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

  if (!analysisData?.candidates) return null

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              {t('resumeAnalysis.result.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('ai-analysis:resumeAnalysis.history.candidatesCount', { count: filteredCandidates.length })}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <Card className="border-none shadow-md bg-card/60 backdrop-blur-md overflow-hidden rounded-3xl">
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Top Row: Search & Sorting */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input 
                placeholder={t('common:search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-background/40 border-border/40 focus:ring-primary/20 text-base rounded-2xl transition-all"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="border-border/40 bg-background/40 h-12 w-12 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all shrink-0"
            >
              {sortOrder === 'desc' ? <SortDesc className="w-5 h-5" /> : <SortAsc className="w-5 h-5" />}
            </Button>
          </div>

          {/* Inline Filters Row */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 pt-6 border-t border-border/10">
            {/* Verdict Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
              <span className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-[0.2em] whitespace-nowrap">
                {t('ai-analysis:resumeAnalysis.result.verdicts.recommended')}:
              </span>
              <div className="flex flex-wrap gap-2">
                {['recommended', 'maybe', 'rejected'].map(v => {
                  const isSelected = selectedVerdicts.includes(v)
                  return (
                    <Badge 
                      key={v} 
                      variant="outline"
                      className={cn(
                        "cursor-pointer px-3.5 py-2 rounded-xl border transition-all duration-200 select-none",
                        isSelected 
                          ? "bg-background shadow-sm border-border/80 text-foreground"
                          : "bg-transparent text-muted-foreground/50 border-border/30 hover:border-border/60 hover:text-muted-foreground"
                      )}
                      onClick={() => {
                        setSelectedVerdicts(prev => 
                          isSelected ? prev.filter(item => item !== v) : [...prev, v]
                        )
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          v === 'recommended' ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
                          v === 'maybe' ? "bg-warning shadow-[0_0_8px_rgba(234,179,8,0.4)]" :
                          "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
                          !isSelected && "opacity-30 grayscale-[50%]"
                        )} />
                        <span className="font-bold text-[11px] uppercase tracking-wider">
                          {t(`ai-analysis:resumeAnalysis.result.verdicts.${v}`)}
                        </span>
                      </div>
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        {filteredCandidates.length > 0 ? (
          <Accordion 
            type="multiple" 
            value={expandedCards} 
            onValueChange={setExpandedCards}
            className="space-y-4"
          >
            {filteredCandidates.map((candidate, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-none"
              >
                <Card className="group overflow-hidden border-border/40 shadow-sm bg-card/40 backdrop-blur-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 rounded-2xl">
                  <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
                    <div className="flex flex-col sm:flex-row items-center justify-between w-full p-6 gap-4 text-left">
                      <div className="flex items-center gap-5 w-full sm:w-auto">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-col gap-0.5">
                            <h3 className="text-xl font-bold tracking-tight">{candidate.name}</h3>
                            {candidate.vacancy_matches && candidate.vacancy_matches.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {candidate.vacancy_matches.map((m, i) => (
                                  <Badge key={i} variant="outline" className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground border-primary/20 text-[11px] font-semibold py-0.5 px-2.5 hover:bg-primary/10 pointer-events-none transition-colors">
                                    {m.vacancy_title}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={cn("px-3 py-0.5 border shadow-sm pointer-events-none hover:bg-transparent", getVerdictColor(candidate.verdict))}>
                              <span className="flex items-center gap-1.5 font-semibold uppercase text-[10px] tracking-wider">
                                {getVerdictIcon(candidate.verdict)}
                                {t(`ai-analysis:resumeAnalysis.result.verdicts.${candidate.verdict}`)}
                              </span>
                            </Badge>
                            {candidate.match_score >= 80 && (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1.5 pointer-events-none hover:bg-amber-500/10">
                                <Sparkles className="w-3 h-3" />
                                {t('ai-analysis:resumeAnalysis.topChoice')}
                              </Badge>
                            )}
                            {(candidate.total_experience_years !== undefined || candidate.last_position) && (
                              <div className="flex items-center gap-3 ml-1 text-muted-foreground">
                                {candidate.total_experience_years !== undefined && (
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/50 text-[11px] font-medium border border-border/50">
                                    <Calendar className="w-3 h-3 text-primary/60" />
                                    <span>{candidate.total_experience_years} {t('common:years', 'л.')}</span>
                                  </div>
                                )}
                                {candidate.last_position && (
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/50 text-[11px] font-medium border border-border/50 max-w-[200px]">
                                    <Briefcase className="w-3 h-3 text-primary/60" />
                                    <span className="truncate">{candidate.last_position}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pr-2">
                        <div className="flex items-center gap-5 bg-muted/30 border border-border/40 px-5 py-3 rounded-[1.25rem] shadow-sm transition-all duration-300">
                          <div className="flex flex-col items-end justify-center">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-[9px] font-bold text-muted-foreground/90 uppercase tracking-[0.2em]">
                                {t('ai-analysis:resumeAnalysis.result.matchScore')}
                              </span>
                              <HelpCircle topicId="match_score" iconClassName="h-3 w-3" />
                            </div>
                            <div className={cn(
                              "text-3xl font-bold tabular-nums tracking-tighter leading-none",
                              candidate.match_score >= 80 ? "text-success" :
                              candidate.match_score >= 50 ? "text-warning" :
                              "text-red-500"
                            )}>
                              {candidate.match_score}<span className="text-sm font-bold opacity-60 ml-0.5">%</span>
                            </div>
                          </div>
                          
                          <div className="h-12 w-12 relative flex items-center justify-center">
                            <svg className="transform -rotate-90 w-full h-full">
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-muted/25"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 20}
                                strokeDashoffset={2 * Math.PI * 20 * (1 - candidate.match_score / 100)}
                                strokeLinecap="round"
                                className={cn(
                                  "transition-all duration-1000 ease-out",
                                  candidate.match_score >= 80 ? "text-success" :
                                  candidate.match_score >= 50 ? "text-warning" :
                                  "text-red-500"
                                )}
                              />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="bg-muted/30 rounded-full p-2 group-data-[state=open]:rotate-180 transition-transform shrink-0 border border-border/50">
                          <ChevronDown className="w-5 h-5 text-muted-foreground/40" />
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="border-t border-border/20 pt-0">
                    <div className="p-6 sm:p-8 space-y-10 animate-in slide-in-from-top-2 duration-300">
                      {/* Executive Summary Row - Full Width */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 rounded-3xl p-6 border border-primary/10 shadow-sm group/summary">
                        <div className="absolute top-0 right-0 p-6 text-primary/10 group-hover/summary:text-primary/20 transition-colors">
                          <Sparkles className="w-8 h-8" />
                        </div>
                        <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 mb-4 opacity-80">
                          <FileText className="w-3.5 h-3.5" />
                          {t('ai-analysis:resumeAnalysis.executiveSummary')}
                        </h4>
                        <p className="text-base sm:text-lg leading-relaxed text-foreground/90 italic font-medium relative z-10">
                          "{candidate.summary}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Column 1: Vacancy Matches & Cultural Fit */}
                        <div className="space-y-10">
                          <div className="space-y-6">
                            <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2.5 mb-4 opacity-90 transition-opacity hover:opacity-100">
                              <CheckCircle2 className="w-4 h-4" />
                              {t('ai-analysis:resumeAnalysis.result.matches')}
                            </h4>
                            <div className="space-y-4">
                              {candidate.vacancy_matches?.map((match, i) => (
                                <div key={i} className="group/match bg-background/40 border border-border/40 rounded-2xl p-5 transition-all hover:bg-background/60 hover:shadow-sm">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-base truncate pr-2">{match.vacancy_title}</span>
                                    <span className="font-black text-primary tabular-nums bg-primary/10 px-2.5 py-0.5 rounded-full text-[10px] border border-primary/10">{match.score}%</span>
                                  </div>
                                  <Progress value={match.score} className="h-1.5 mb-4 bg-muted/30" />
                                  <p className="text-sm text-muted-foreground/90 leading-relaxed">{match.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {candidate.cultural_fit && (
                            <div className="bg-blue-50/50 dark:bg-blue-500/10 p-6 rounded-[2rem] border border-blue-200/50 dark:border-blue-800/50 animate-in fade-in slide-in-from-bottom-2 duration-500">
                              <h4 className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2.5">
                                <Heart className="w-4 h-4" />
                                {t('resumeAnalysis.result.sections.culturalFit')}
                              </h4>
                              <p className="text-base text-blue-900/80 dark:text-blue-200/70 leading-relaxed font-medium">
                                {candidate.cultural_fit}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Column 2: Strengths (Hard & Soft Skills) */}
                        <div className="space-y-10">
                          {candidate.skills ? (
                            <>
                              <div className="space-y-6">
                                <h4 className="text-xs font-black text-success uppercase tracking-[0.2em] flex items-center gap-2.5">
                                  <ThumbsUp className="w-4 h-4" />
                                  {t('resumeAnalysis.result.sections.hardSkills')}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {[...(candidate.pros || []), ...(candidate.skills?.hard_skills_match || [])].map((item, i) => (
                                    <Badge key={i} variant="secondary" className="bg-success/10 text-success dark:text-emerald-400 border-success/10 text-[11px] font-semibold py-1.5 px-3 rounded-lg pointer-events-none">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {(candidate.skills.soft_skills?.length ?? 0) > 0 && (
                                <div className="space-y-6">
                                  <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2.5">
                                    <Brain className="w-4 h-4" />
                                    {t('resumeAnalysis.result.sections.softSkills')}
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {candidate.skills?.soft_skills?.map((skill, i) => (
                                      <Badge key={i} variant="outline" className="bg-indigo-500/5 text-indigo-600 dark:text-indigo-300 border-indigo-200/50 text-[11px] font-semibold py-1.5 px-3 rounded-lg pointer-events-none">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm opacity-50 border-2 border-dashed rounded-[2rem]">
                              {t('ai-analysis:resumeAnalysis.detailedSkillsUnavailable')}
                            </div>
                          )}
                        </div>

                        {/* Column 3: Gaps & Red Flags */}
                        <div className="space-y-10">
                          {candidate.skills && (
                            <>
                              <div className="space-y-6">
                                <h4 className="text-xs font-black text-destructive uppercase tracking-[0.2em] flex items-center gap-2.5">
                                  <ThumbsDown className="w-4 h-4" />
                                  {t('resumeAnalysis.result.sections.gaps')}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {[...(candidate.cons || []), ...(candidate.skills?.missing_skills || [])].map((item, i) => (
                                    <Badge key={i} variant="outline" className="bg-destructive/5 text-destructive dark:text-red-400 border-destructive/20 text-[11px] font-semibold py-1.5 px-3 rounded-lg pointer-events-none">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {(candidate.red_flags?.length ?? 0) > 0 && (
                                <div className="space-y-6">
                                  <div className="bg-destructive/10 dark:bg-red-500/10 border border-destructive/20 dark:border-red-500/20 rounded-[1.5rem] p-6 space-y-4">
                                    <h4 className="text-xs font-black text-destructive dark:text-red-400 uppercase tracking-[0.2em] flex items-center gap-2.5">
                                      <AlertTriangle className="w-4 h-4" />
                                      {t('resumeAnalysis.result.sections.redFlags')}
                                    </h4>
                                    <ul className="space-y-3">
                                      {candidate.red_flags?.map((flag, i) => (
                                        <li key={i} className="text-sm text-destructive dark:text-red-400/90 leading-tight flex items-start gap-3">
                                          <span className="shrink-0 text-destructive dark:text-red-500 mt-0.5">•</span>
                                          {flag}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Interview Questions Row - Full Width */}
                      {candidate.interview_questions && candidate.interview_questions.length > 0 && (
                        <div className="border-t border-border/10 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                          <div className="bg-amber-50/50 dark:bg-amber-500/10 p-8 rounded-[2.5rem] border border-amber-200/50 dark:border-amber-800/50">
                            <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2.5">
                              <MessageCircle className="w-4 h-4" />
                              {t('resumeAnalysis.result.sections.interviewQuestions')}
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {candidate.interview_questions?.map((q, i) => (
                                <li key={i} className="bg-background/40 rounded-2xl p-6 text-sm text-amber-900/80 dark:text-amber-200/70 leading-relaxed flex gap-4 border border-amber-200/20 shadow-sm transition-all hover:bg-background/60 hover:shadow-md">
                                  <span className="font-black text-amber-500/40 shrink-0 text-xl leading-none">{i + 1}</span>
                                  <span>{q}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Actions Footer */}
                      <div className="pt-6 mt-6 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                          <div className="flex items-center gap-1.5">
                            <FileType2 className="w-3.5 h-3.5" />
                            {t('ai-analysis:resumeAnalysis.resumeVerified')}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5" />
                            {t('ai-analysis:resumeAnalysis.insightEngine')}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            className="flex-1 sm:flex-none gap-2 border-border/40 hover:bg-muted/50 h-11 text-base"
                            onClick={() => handleViewResume(candidate.fileName)}
                          >
                            <FileText className="w-4 h-4" />
                            {t('ai-analysis:resumeAnalysis.result.viewResume')}
                          </Button>
                          {(() => {
                            const token = candidate.invite_token
                            const status = token ? tokensStatus?.find(s => s.token === token) : null
                            
                            if (status?.is_used) {
                              return (
                                <Button disabled variant="secondary" className="w-full sm:w-auto gap-2 bg-success/10 text-success border-success/10 h-11 text-base">
                                  <Check className="w-4 h-4" />
                                  {t('ai-analysis:resumeAnalysis.result.status.registered')}
                                </Button>
                              )
                            }

                            if (token) {
                              return (
                                <Button
                                  variant="outline"
                                  className="w-full sm:w-auto gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary h-11 text-base"
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
                                  <Button className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-purple-600 hover:scale-[1.02] transition-transform h-11 text-base" disabled={isCreating}>
                                    <UserPlus className="w-4 h-4" />
                                    {t('ai-analysis:resumeAnalysis.result.invite')}
                                    <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-72 rounded-2xl shadow-2xl border-border/50 p-2">
                                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground p-3 opacity-60">
                                    {t('ai-analysis:resumeAnalysis.result.selectVacancy')}
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator className="mx-2 my-1" />
                                  <div className="space-y-1">
                                    {vacancies.map((vacancy) => {
                                      const match = candidate.vacancy_matches?.find(m => m.vacancy_title === vacancy.title)
                                      return (
                                        <DropdownMenuItem
                                          key={vacancy.id}
                                          onClick={() => handleInvite(candidate, vacancy.id, index)}
                                          className="py-3 px-4 flex flex-col items-start gap-1 cursor-pointer rounded-xl transition-colors focus:bg-primary/10 hover:bg-transparent"
                                        >
                                          <div className="flex justify-between w-full items-center">
                                            <span className="font-bold text-sm truncate pr-2">{vacancy.title}</span>
                                            {match && <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/10">{match.score}%</span>}
                                          </div>
                                          <div className="text-[10px] font-medium text-muted-foreground line-clamp-1 opacity-60 uppercase tracking-wider">
                                            {vacancy.employment_type} • {vacancy.location || 'Remote'}
                                          </div>
                                        </DropdownMenuItem>
                                      )
                                    })}
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <Button
                                className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-purple-600 hover:scale-[1.02] transition-transform h-11 text-base"
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
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-background/20 rounded-[2.5rem] border-2 border-dashed border-border/30 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="h-24 w-24 rounded-full bg-muted/20 flex items-center justify-center mb-8 text-muted-foreground/20">
              <Filter className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold mb-3">{t('ai-analysis:resumeAnalysis.noCandidatesFound')}</h3>
            <p className="text-muted-foreground max-w-sm px-6 text-base leading-relaxed">
              {t('ai-analysis:resumeAnalysis.noCandidatesFoundDesc')}
            </p>
            <Button 
              variant="outline" 
              className="mt-10 gap-2 h-12 px-8 rounded-xl border-primary/20 hover:border-primary/50 text-primary bg-background/50 text-base font-semibold"
              onClick={() => {
                setSearchQuery('')
                setSelectedVerdicts(['recommended', 'maybe', 'rejected'])
              }}
            >
              <X className="w-4 h-4" />
              {t('ai-analysis:resumeAnalysis.resetFilters')}
            </Button>
          </div>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={!!inviteDialogData} onOpenChange={(open) => !open && setInviteDialogData(null)}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl bg-card/95 backdrop-blur-xl rounded-[2rem] p-8">
          <DialogHeader>
            <div className="mx-auto h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center text-success mb-4 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <DialogTitle className="text-center text-3xl font-black tracking-tighter">
              {t('ai-analysis:resumeAnalysis.result.inviteCreated')}
            </DialogTitle>
            <DialogDescription className="text-center px-4 text-base font-medium text-muted-foreground mt-2">
              {t('ai-analysis:resumeAnalysis.result.inviteCreatedDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="p-1 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl my-6">
            <div className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur rounded-xl border border-white/10 shadow-lg">
              <div className="grid flex-1 gap-2">
                <Input
                  id="link"
                  defaultValue={inviteDialogData?.link}
                  readOnly
                  className="bg-transparent border-none focus-visible:ring-0 text-sm h-12 font-medium overflow-x-auto"
                />
              </div>
              <Button size="icon" className="h-12 w-12 rounded-xl shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-purple-600 transition-transform active:scale-95" onClick={handleCopyLink}>
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <Button type="button" variant="ghost" className="w-full h-14 rounded-2xl text-base font-bold text-muted-foreground hover:bg-muted/50 transition-colors" onClick={() => setInviteDialogData(null)}>
              {t('common:close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
