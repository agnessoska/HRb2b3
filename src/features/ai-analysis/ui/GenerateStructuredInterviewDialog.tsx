import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { MessageSquare, Sparkles, Briefcase, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AIGenerationModal } from '@/shared/ui/AIGenerationModal'
import { GlassCard } from '@/shared/ui/GlassCard'
import { supabase } from '@/shared/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useGenerateInterviewPlan } from '@/features/structured-interview/api'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { TokenCostBanner } from '@/shared/ui/TokenCostBanner'
import { useTokenCalculation } from '@/shared/hooks/useTokenCalculation'

interface GenerateStructuredInterviewDialogProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  candidateId: string
  vacancyId: string
  disabled?: boolean
  onSuccess?: () => void
  children?: React.ReactNode
}

export function GenerateStructuredInterviewDialog({
  isOpen: externalOpen,
  onOpenChange: externalOnOpenChange,
  candidateId,
  vacancyId,
  disabled = false,
  onSuccess,
  children
}: GenerateStructuredInterviewDialogProps) {
  const { t, i18n } = useTranslation(['ai-analysis', 'common'])
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Controlled mode support
  const isControlled = externalOpen !== undefined
  const open = isControlled ? externalOpen : internalOpen
  const setOpen = (value: boolean) => {
    if (isControlled) {
      externalOnOpenChange?.(value)
    } else {
      setInternalOpen(value)
    }
  }
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [language, setLanguage] = useState<'ru' | 'en' | 'kk'>((i18n.language as 'ru' | 'en' | 'kk') || 'ru')

  // Load vacancy title for display
  const { data: vacancy } = useQuery({
    queryKey: ['vacancy', vacancyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vacancies')
        .select('id, title')
        .eq('id', vacancyId)
        .single()

      if (error) throw error
      return data
    },
    enabled: open && !!vacancyId,
  })

  const generateInterviewMutation = useGenerateInterviewPlan()
  const { mutate: generateInterview, isPending } = generateInterviewMutation
  const { data: hrProfile } = useHrProfile()
  const { data: organization } = useOrganization()
  const { calculation } = useTokenCalculation('structured_interview', additionalInfo)

  const handleGenerate = () => {
    if (!candidateId || !vacancyId) {
      toast.error(t('errors.missingData'))
      return
    }
    
    if (!hrProfile?.id || !organization?.id) {
      toast.error(t('errors.missingProfile'))
      return
    }

    generateInterview(
      {
        candidate_id: candidateId,
        vacancy_id: vacancyId,
        organization_id: organization.id,
        hr_specialist_id: hrProfile.id,
        language: language,
        additional_info: additionalInfo,
      },
      {
        onSuccess: () => {
          toast.success(t('generateInterview.successTitle'), {
            description: t('generateInterview.successDescription'),
          })
          setAdditionalInfo('')
          setOpen(false)
          if (onSuccess) onSuccess()
        },
        onError: (error) => {
          toast.error(t('generateInterview.errorTitle'), {
            description: error.message,
          })
        },
      }
    )
  }

  return (
    <>
      <AIGenerationModal
        isOpen={isPending || (!!generateInterviewMutation.data && !open)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isPending) {
            setOpen(false);
          }
        }}
        isPending={isPending}
        title={t('generateInterview.processingTitle', 'Генерация плана интервью')}
        description={t('generateInterview.processingDescription', 'ИИ анализирует результаты тестов и составляет вопросы...')}
        finalTokens={generateInterviewMutation.data?.total_tokens}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        {children ? (
          <DialogTrigger asChild>{children}</DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <Button disabled={disabled || isPending} className="w-full gap-2" variant="outline">
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              {t('generateInterview.trigger')}
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              {t('generateInterview.title')}
            </DialogTitle>
            <DialogDescription>{t('generateInterview.description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Vacancy Display (informative, not selectable) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {t('generateInterview.vacancy', 'Вакансия')}
              </Label>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <p className="font-medium">{vacancy?.title || t('common:loading')}</p>
              </div>
            </div>

            {/* Info Block */}
            <GlassCard className="border-none">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{t('generateInterview.whatIs.title', 'Что это?')}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('generateInterview.whatIs.description', 'Структурированное интервью создается на основе психометрических данных. ИИ предложит конкретные вопросы для проверки рисков и сильных сторон кандидата.')}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-semibold">
                {t('generateDocument.resultLanguage.label', 'Язык документа')}
              </Label>
              <Select value={language} onValueChange={(val) => setLanguage(val as 'ru' | 'en' | 'kk')}>
                <SelectTrigger id="language" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">{t('languages.ru', 'Русский')}</SelectItem>
                  <SelectItem value="en">{t('languages.en', 'English')}</SelectItem>
                  <SelectItem value="kk">{t('languages.kk', 'Қазақша')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <Label htmlFor="additional-info" className="text-sm font-semibold">
                {t('generateDocument.additionalInfo.label', 'Дополнительные акценты')}
              </Label>
              <Textarea
                id="additional-info"
                placeholder={t('generateInterview.additionalInfo.placeholder', 'Например: Сфокусируйтесь на опыте управления командой или проверке стрессоустойчивости')}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>

            <TokenCostBanner
              operationType="structured_interview"
              inputString={additionalInfo}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              {t('common:cancel')}
            </Button>
            <Button onClick={handleGenerate} disabled={isPending || !calculation?.hasEnough} className="gap-2">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('generateInterview.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
