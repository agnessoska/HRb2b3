import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useOrganization } from '@/shared/hooks/useOrganization'
import {
  type DocumentType,
  useGenerateDocument,
} from '@/features/ai-analysis/api/generateDocument'
import { AIGenerationModal } from '@/shared/ui/AIGenerationModal'

interface GenerateDocumentDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  candidateId: string
  vacancyId?: string
  documentType: DocumentType
  onDocumentTypeChange: (type: DocumentType) => void
  additionalInfo: string
  onAdditionalInfoChange: (info: string) => void
}

export const GenerateDocumentDialog = ({
  isOpen,
  onOpenChange,
  candidateId,
  vacancyId,
  documentType,
  onDocumentTypeChange,
  additionalInfo,
  onAdditionalInfoChange,
}: GenerateDocumentDialogProps) => {
  const { t, i18n } = useTranslation(['ai-analysis', 'common'])
  const { data: hrProfile } = useHrProfile()
  const { data: organization } = useOrganization()
  const { mutate: generateDocument, isPending } = useGenerateDocument()

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
        language: i18n.language as 'ru' | 'kk' | 'en',
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <>
      <AIGenerationModal
        isOpen={isPending}
        onOpenChange={() => {}}
        isPending={isPending}
        title={t('generateDocument.processingTitle', 'Генерация документа')}
        description={t('generateDocument.processingDescription', 'ИИ составляет документ на основе профиля кандидата и вакансии...')}
      />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('generateDocument.title')}</DialogTitle>
          <DialogDescription>{t('generateDocument.description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t('generateDocument.documentType.label')}</Label>
            <RadioGroup
              value={documentType}
              onValueChange={(value) => onDocumentTypeChange(value as DocumentType)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interview_invitation" id="r1" />
                <Label htmlFor="r1">{t('generateDocument.documentType.interview_invitation')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="job_offer" id="r2" />
                <Label htmlFor="r2">{t('generateDocument.documentType.job_offer')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejection_letter" id="r3" />
                <Label htmlFor="r3">{t('generateDocument.documentType.rejection_letter')}</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="additional-info">
              {t('generateDocument.additionalInfo.label')}
            </Label>
            <Textarea
              id="additional-info"
              placeholder={t('generateDocument.additionalInfo.placeholder')}
              value={additionalInfo}
              onChange={(e) => onAdditionalInfoChange(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:cancel')}
          </Button>
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? t('common:generating') : t('common:generate')}
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
