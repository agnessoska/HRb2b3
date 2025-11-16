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
import { useTranslation } from 'react-i18next'
import { useGenerateFullAnalysis } from '../api/generateFullAnalysis'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGetVacancies } from '@/features/vacancy-management/api/getVacancies'

interface GenerateFullAnalysisDialogProps {
  candidateId: string
  testsCompleted: number
}

export function GenerateFullAnalysisDialog({ candidateId, testsCompleted }: GenerateFullAnalysisDialogProps) {
  const { t } = useTranslation('ai-analysis')
  const { data: hrProfile } = useHrProfile()
  const { data: organization } = useOrganization()
  const { data: vacanciesData } = useGetVacancies()
  const [open, setOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [selectedVacancies, setSelectedVacancies] = useState<string[]>([])

  const { mutate: generateAnalysis, isPending } = useGenerateFullAnalysis({
    onSuccess: () => {
      // TODO: Add toast notification and refetch data
      setOpen(false)
    },
    onError: (error) => {
      // TODO: Add toast notification
      console.error('Failed to generate full analysis:', error)
    },
  })

  const handleGenerate = () => {
    if (!hrProfile || !organization || selectedVacancies.length === 0) return

    generateAnalysis({
      candidate_id: candidateId,
      vacancy_ids: selectedVacancies,
      organization_id: organization.id,
      hr_specialist_id: hrProfile.id,
      language: 'ru', // Or get from i18n state
    })
  }

  const vacancies = vacanciesData ?? []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={testsCompleted < 6}>
          {t('generateFullAnalysis.trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('generateFullAnalysis.title')}</DialogTitle>
          <DialogDescription>{t('generateFullAnalysis.description')}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2">
            <p className="text-sm font-medium">{t('generateFullAnalysis.selectVacancies')}</p>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={popoverOpen}
                        className="w-full justify-between"
                    >
                        {selectedVacancies.length > 0
                            ? `${t('generateFullAnalysis.selected', { count: selectedVacancies.length })}`
                            : t('generateFullAnalysis.selectPlaceholder')}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput placeholder={t('generateFullAnalysis.searchPlaceholder')} />
                        <CommandEmpty>{t('generateFullAnalysis.noVacanciesFound')}</CommandEmpty>
                        <CommandGroup>
                            {vacancies.map((vacancy) => (
                                <CommandItem
                                    key={vacancy.id}
                                    value={vacancy.id}
                                    onSelect={(currentValue) => {
                                        setSelectedVacancies(
                                            selectedVacancies.includes(currentValue)
                                                ? selectedVacancies.filter((id) => id !== currentValue)
                                                : [...selectedVacancies, currentValue]
                                        )
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            selectedVacancies.includes(vacancy.id) ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {vacancy.title}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t('common:cancel')}
          </Button>
          <Button onClick={handleGenerate} disabled={isPending || selectedVacancies.length === 0}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('generateFullAnalysis.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
