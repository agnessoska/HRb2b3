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
import { useCompareCandidates } from '../api/compareCandidates'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { toast } from 'sonner'

// Assuming a basic candidate type for now
interface Candidate {
  id: string
  full_name: string
}

interface CompareCandidatesDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  vacancyId: string
  candidates: Candidate[]
}

export const CompareCandidatesDialog = ({
  isOpen,
  onOpenChange,
  vacancyId,
  candidates,
}: CompareCandidatesDialogProps) => {
  const { t } = useTranslation('ai-analysis')
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const { data: hrProfile } = useHrProfile()
  const { data: organization } = useOrganization()
  const { mutate: compare, isPending } = useCompareCandidates()

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    )
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
        language: 'ru', // Or get from i18n state
      },
      {
        onSuccess: () => {
          setSelectedCandidates([])
          onOpenChange(false)
        },
      }
    )
  }

  const isValidSelection = selectedCandidates.length >= 2 && selectedCandidates.length <= 5

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('compareCandidates.title')}</DialogTitle>
          <DialogDescription>{t('compareCandidates.description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center space-x-2">
                <Checkbox
                  id={candidate.id}
                  checked={selectedCandidates.includes(candidate.id)}
                  onCheckedChange={() => handleSelectCandidate(candidate.id)}
                />
                <Label htmlFor={candidate.id}>{candidate.full_name}</Label>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCandidates([])
              onOpenChange(false)
            }}
          >
            {t('common:cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!isValidSelection || isPending}>
            {isPending ? t('compareCandidates.loading') : t('compareCandidates.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
