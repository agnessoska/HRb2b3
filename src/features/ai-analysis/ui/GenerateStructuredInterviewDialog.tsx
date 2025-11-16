import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useGenerateStructuredInterview } from '../api/generateStructuredInterview'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface GenerateStructuredInterviewDialogProps {
  candidateId: string
  vacancyId: string
  disabled: boolean
}

export function GenerateStructuredInterviewDialog({
  candidateId,
  vacancyId,
  disabled,
}: GenerateStructuredInterviewDialogProps) {
  const { t, i18n } = useTranslation('ai-analysis')
  const [isOpen, setIsOpen] = useState(false)

  const { mutate: generateInterview, isPending } = useGenerateStructuredInterview()

  const handleGenerate = () => {
    generateInterview(
      {
        candidate_id: candidateId,
        vacancy_id: vacancyId,
        language: i18n.language as 'ru' | 'kk' | 'en',
      },
      {
        onSuccess: () => {
          toast.success(t('generateInterview.successTitle'), {
            description: t('generateInterview.successDescription'),
          })
          setIsOpen(false)
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled || isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            t('generateInterview.trigger')
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('generateInterview.title')}</DialogTitle>
          <DialogDescription>{t('generateInterview.description')}</DialogDescription>
        </DialogHeader>
        <div className="py-4">{t('generateInterview.confirmation')}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
            {t('common:cancel')}
          </Button>
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('generateInterview.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
