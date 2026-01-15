import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCompareCandidates } from '../api/compareCandidates'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { toast } from 'sonner'
import { AIGenerationModal } from '@/shared/ui/AIGenerationModal'
import { GlassCard } from '@/shared/ui/GlassCard'
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Target,
  TrendingUp,
  Info,
  Languages,
  Loader2
} from 'lucide-react'
import { TokenCostBanner } from '@/shared/ui/TokenCostBanner'
import { useTokenCalculation } from '@/shared/hooks/useTokenCalculation'

interface Candidate {
  id: string
  full_name: string
  tests_completed: number
}

interface CompareCandidatesDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  vacancyId: string
  candidates: Candidate[]
  onComparisonCreated?: (comparisonId: string) => void
}

export const CompareCandidatesDialog = ({
  isOpen,
  onOpenChange,
  vacancyId,
  candidates,
  onComparisonCreated,
}: CompareCandidatesDialogProps) => {
  const { t } = useTranslation('ai-analysis')
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [resultLanguage, setResultLanguage] = useState<'ru' | 'en' | 'kk'>('ru')
  const { data: hrProfile } = useHrProfile()
  const { data: organization } = useOrganization()
  const compareMutation = useCompareCandidates()
  const { mutate: compare, isPending } = compareMutation
  const { calculation } = useTokenCalculation('candidate_comparison', undefined, selectedCandidates.length || 2)

  const handleSelectCandidate = (candidateId: string, testsCompleted: number) => {
    if (testsCompleted < 6) {
      toast.warning(t('compareCandidates.testIncomplete'))
      return
    }

    setSelectedCandidates((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId)
      }
      
      if (prev.length >= 10) {
        toast.warning(t('compareCandidates.maxLimit'))
        return prev
      }
      
      return [...prev, candidateId]
    })
  }

  const handleSubmit = () => {
    if (isPending) return

    if (!hrProfile || !organization) {
        toast.error(t('compareCandidates.errorProfile'))
        return
    }
    
    compare(
      {
        vacancy_id: vacancyId,
        candidate_ids: selectedCandidates,
        organization_id: organization.id,
        hr_specialist_id: hrProfile.id,
        language: resultLanguage,
      },
      {
        onSuccess: (data) => {
          toast.success('Сравнение успешно создано!')
          setSelectedCandidates([])
          
          if (onComparisonCreated && data?.result?.id) {
            onComparisonCreated(data.result.id)
          }
          
          setTimeout(() => {
            onOpenChange(false)
          }, 500)
        },
      }
    )
  }

  const eligibleCandidates = candidates.filter(c => c.tests_completed === 6)
  const ineligibleCandidates = candidates.filter(c => c.tests_completed < 6)
  const isValidSelection = selectedCandidates.length >= 2 && selectedCandidates.length <= 10

  return (
    <>
      <AIGenerationModal
        isOpen={isPending || (!!compareMutation.data && !isOpen) || compareMutation.isError}
        onOpenChange={(open) => {
          if (!open && !isPending) {
            if (compareMutation.isError) compareMutation.reset();
            onOpenChange(false);
          }
        }}
        isPending={isPending}
        isError={compareMutation.isError}
        error={compareMutation.error?.message}
        title={t('compareCandidates.processingTitle')}
        description={t('compareCandidates.processingDescription')}
        finalTokens={compareMutation.data?.total_tokens}
      />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col rounded-[2.5rem] border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="flex items-center gap-3 text-3xl font-black tracking-tighter">
            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
              <Users className="h-6 w-6 text-white" />
            </div>
            {t('compareCandidates.title')}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">{t('compareCandidates.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-8 p-8 custom-scrollbar">
          {/* Информационный блок */}
          <GlassCard className="p-6 bg-primary/5 border-primary/10 rounded-3xl">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-base mb-1 tracking-tight">
                    {t('compareCandidates.whatIs.title')}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('compareCandidates.whatIs.description')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-primary/10">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <span>{t('compareCandidates.benefits.objective')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <span>{t('compareCandidates.benefits.ranking')}</span>
                </div>
              </div>

              <TokenCostBanner
                operationType="candidate_comparison"
                multiplier={selectedCandidates.length || 2}
              />
            </div>
          </GlassCard>

          {/* Выбор кандидатов */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t('compareCandidates.selectCandidates')}
              </Label>
              <Badge variant="outline" className="font-bold text-primary border-primary/20 bg-primary/5">
                {selectedCandidates.length} / 10
              </Badge>
            </div>

            {/* Доступные кандидаты (все тесты пройдены) */}
            {eligibleCandidates.length > 0 && (
              <div className="space-y-2">
                {eligibleCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`group flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedCandidates.includes(candidate.id)
                        ? 'bg-primary/5 border-primary ring-4 ring-primary/10 shadow-xl shadow-primary/5'
                        : 'bg-background/50 border-border/50 hover:border-primary/30 hover:bg-background'
                    }`}
                    onClick={() => handleSelectCandidate(candidate.id, candidate.tests_completed)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={candidate.id}
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={() => handleSelectCandidate(candidate.id, candidate.tests_completed)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-5 w-5 rounded-md"
                      />
                      <Label 
                        htmlFor={candidate.id}
                        className="cursor-pointer font-bold text-sm transition-colors"
                      >
                        {candidate.full_name}
                      </Label>
                    </div>
                    <Badge variant="success" className="gap-1 h-6">
                      <CheckCircle2 className="h-3 w-3" />
                      {candidate.tests_completed}/6
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Недоступные кандидаты (не все тесты пройдены) */}
            {ineligibleCandidates.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70 px-1">
                  <Info className="h-3 w-3" />
                  <span>{t('compareCandidates.incomplete')}</span>
                </div>
                <div className="space-y-2">
                  {ineligibleCandidates.map((candidate) => (
                    <div 
                      key={candidate.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-dashed border-border bg-muted/20 opacity-60 cursor-not-allowed grayscale"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox disabled checked={false} />
                        <Label className="cursor-not-allowed text-xs font-medium">
                          {candidate.full_name}
                        </Label>
                      </div>
                      <Badge variant="warning" className="gap-1 h-5 text-[10px]">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {candidate.tests_completed}/6
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {candidates.length === 0 && (
              <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm text-muted-foreground font-medium">{t('compareCandidates.noCandidates')}</p>
              </div>
            )}
          </div>
          
          {/* Выбор языка результата */}
          <div className="space-y-3 pt-4 border-t border-border/50">
            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Languages className="h-4 w-4" />
              {t('resumeAnalysis.resultLanguage.label')}
            </Label>
            <Select value={resultLanguage} onValueChange={(value) => setResultLanguage(value as 'ru' | 'en' | 'kk')}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                <SelectItem value="ru" className="rounded-lg">🇷🇺 {t('languages.ru')}</SelectItem>
                <SelectItem value="en" className="rounded-lg">🇺🇸 {t('languages.en')}</SelectItem>
                <SelectItem value="kk" className="rounded-lg">🇰🇿 {t('languages.kk')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="border-t border-border/50 p-8 bg-muted/20 backdrop-blur-md">
          <Button
            variant="ghost"
            className="rounded-xl px-8 font-bold hover:bg-accent/50"
            onClick={() => {
              setSelectedCandidates([])
              onOpenChange(false)
            }}
          >
            {t('common:cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValidSelection || isPending || !calculation?.hasEnough}
            className="gap-2 rounded-xl px-10 font-bold shadow-xl shadow-primary/30 h-12"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('compareCandidates.loading')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t('compareCandidates.submit')}
              </>
            )}
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
