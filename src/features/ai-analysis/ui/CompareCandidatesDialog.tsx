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
  Languages
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
        isOpen={isPending || (!!compareMutation.data && !isOpen)}
        onOpenChange={(open) => {
          if (!open && !isPending) {
            onOpenChange(false);
          }
        }}
        isPending={isPending}
        title={t('compareCandidates.processingTitle')}
        description={t('compareCandidates.processingDescription')}
        finalTokens={compareMutation.data?.total_tokens}
      />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t('compareCandidates.title')}
          </DialogTitle>
          <DialogDescription>{t('compareCandidates.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Информационный блок */}
          <GlassCard className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    {t('compareCandidates.whatIs.title')}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {t('compareCandidates.whatIs.description')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{t('compareCandidates.benefits.objective')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
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
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold">
                {t('compareCandidates.selectCandidates')} ({selectedCandidates.length}/10)
              </Label>
              <span className="text-xs text-muted-foreground">
                {t('compareCandidates.minMaxUpdated')}
              </span>
            </div>

            {/* Доступные кандидаты (все тесты пройдены) */}
            {eligibleCandidates.length > 0 && (
              <div className="space-y-2">
                {eligibleCandidates.map((candidate) => (
                  <div 
                    key={candidate.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
                      selectedCandidates.includes(candidate.id) 
                        ? 'bg-primary/5 border-primary' 
                        : 'bg-card'
                    }`}
                    onClick={() => handleSelectCandidate(candidate.id, candidate.tests_completed)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={candidate.id}
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={() => handleSelectCandidate(candidate.id, candidate.tests_completed)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Label 
                        htmlFor={candidate.id}
                        className="cursor-pointer font-medium"
                      >
                        {candidate.full_name}
                      </Label>
                    </div>
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {candidate.tests_completed}/6
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Недоступные кандидаты (не все тесты пройдены) */}
            {ineligibleCandidates.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                  <span>{t('compareCandidates.incomplete')}</span>
                </div>
                {ineligibleCandidates.map((candidate) => (
                  <div 
                    key={candidate.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 opacity-60 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox disabled checked={false} />
                      <Label className="cursor-not-allowed text-muted-foreground">
                        {candidate.full_name}
                      </Label>
                    </div>
                    <Badge variant="warning" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {candidate.tests_completed}/6
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {candidates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t('compareCandidates.noCandidates')}</p>
              </div>
            )}
          </div>
          {/* Выбор языка результата */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              {t('resumeAnalysis.resultLanguage.label')}
            </Label>
            <Select value={resultLanguage} onValueChange={(value) => setResultLanguage(value as 'ru' | 'en' | 'kk')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">{t('languages.ru')}</SelectItem>
                <SelectItem value="en">{t('languages.en')}</SelectItem>
                <SelectItem value="kk">{t('languages.kk')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
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
            className="gap-2"
          >
            {isPending ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
