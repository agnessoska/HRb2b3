import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Mail, XCircle, Sparkles, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useOrganization } from '@/shared/hooks/useOrganization'
import {
  type DocumentType,
  useGenerateDocument,
} from '@/features/ai-analysis/api/generateDocument'
import { AIGenerationModal } from '@/shared/ui/AIGenerationModal'
import { GlassCard } from '@/shared/ui/GlassCard'
import { TokenCostBanner } from '@/shared/ui/TokenCostBanner'
import { useTokenCalculation } from '@/shared/hooks/useTokenCalculation'

interface GenerateDocumentDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  candidateId: string
  vacancyId?: string
  onSuccess?: () => void
}

const documentTypeIcons = {
  interview_invitation: Mail,
  rejection_letter: XCircle,
}

const documentTypeColors = {
  interview_invitation: 'text-blue-600 dark:text-blue-400',
  rejection_letter: 'text-amber-600 dark:text-amber-400',
}

const documentTypeBgColors = {
  interview_invitation: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  rejection_letter: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
}

export const GenerateDocumentDialog = ({
  isOpen,
  onOpenChange,
  candidateId,
  vacancyId,
  onSuccess,
}: GenerateDocumentDialogProps) => {
  const { t } = useTranslation(['ai-analysis', 'common'])
  const { data: hrProfile } = useHrProfile()
  const { data: organization } = useOrganization()
  const generateDocumentMutation = useGenerateDocument()
  const { mutate: generateDocument, isPending } = generateDocumentMutation
  
  const [documentType, setDocumentType] = useState<DocumentType>('interview_invitation')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [language, setLanguage] = useState<'ru' | 'en' | 'kk'>('ru')
  const { calculation } = useTokenCalculation(documentType, additionalInfo)

  const handleGenerate = () => {
    if (!candidateId || !hrProfile || !organization) {
      toast.error(t('errors.missingData'))
      return
    }

    generateDocument(
      {
        candidate_id: candidateId,
        vacancy_id: vacancyId,
        hr_specialist_id: hrProfile.id,
        organization_id: organization.id,
        document_type: documentType,
        additional_info: additionalInfo,
        language: language,
      },
      {
        onSuccess: () => {
          setAdditionalInfo('')
          onOpenChange(false)
          if (onSuccess) onSuccess()
        },
      }
    )
  }

  const DocumentIcon = documentTypeIcons[documentType]

  return (
    <>
      <AIGenerationModal
        isOpen={isPending || (!!generateDocumentMutation.data && !isOpen)}
        onOpenChange={(open) => {
          if (!open && !isPending) {
            onOpenChange(false);
          }
        }}
        isPending={isPending}
        title={t('generateDocument.processingTitle', 'Генерация документа')}
        description={t('generateDocument.processingDescription', 'ИИ составляет документ на основе профиля кандидата и вакансии...')}
        finalTokens={generateDocumentMutation.data?.total_tokens}
      />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              {t('generateDocument.title')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Info Block */}
            <GlassCard className="border-none">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{t('generateDocument.whatIs.title', 'Что это?')}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('generateDocument.whatIs.description', 'AI создаст персонализированный документ на основе профиля кандидата, результатов тестов и описания вакансии. Документ можно отредактировать и отправить кандидату.')}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Document Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">{t('generateDocument.documentType.label')}</Label>
              <RadioGroup
                value={documentType}
                onValueChange={(value) => setDocumentType(value as DocumentType)}
                className="grid gap-3"
              >
                {(['interview_invitation', 'rejection_letter'] as const).map((type) => {
                  const Icon = documentTypeIcons[type]
                  const isSelected = documentType === type
                  
                  return (
                    <label
                      key={type}
                      htmlFor={type}
                      className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? documentTypeBgColors[type] + ' shadow-sm'
                          : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30'
                      }`}
                    >
                      <RadioGroupItem value={type} id={type} className="shrink-0" />
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/80 dark:bg-white/10' : 'bg-muted'
                      }`}>
                        <Icon className={`h-5 w-5 ${isSelected ? documentTypeColors[type] : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{t(`generateDocument.documentType.${type}`)}</p>
                      </div>
                    </label>
                  )
                })}
              </RadioGroup>
            </div>

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
                {t('generateDocument.additionalInfo.label')}
              </Label>
              <Textarea
                id="additional-info"
                placeholder={t('generateDocument.additionalInfo.placeholder')}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {t('generateDocument.additionalInfo.hint', 'Например: дата интервью, условия зарплаты, особые пожелания')}
              </p>
            </div>

            {/* Cost Info */}
            <TokenCostBanner operationType={documentType} inputString={additionalInfo} />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t('common:cancel')}
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isPending || !calculation?.hasEnough}
              className="gap-2"
            >
              <DocumentIcon className="h-4 w-4" />
              {t('common:generate')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
