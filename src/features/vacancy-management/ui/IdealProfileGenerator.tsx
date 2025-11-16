import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { generateIdealProfile } from '../api/generateIdealProfile'
import { useSettingsStore } from '@/app/store/settings'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import type { Database } from '@/shared/types/database'
import { Loader2, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface IdealProfileGeneratorProps {
  vacancy: Database['public']['Tables']['vacancies']['Row']
}

export function IdealProfileGenerator({ vacancy }: IdealProfileGeneratorProps) {
  const { t } = useTranslation('vacancies')
  const queryClient = useQueryClient()
  const { data: hrProfile } = useHrProfile()
  const { language } = useSettingsStore()

  const { mutate, isPending } = useMutation({
    mutationFn: generateIdealProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancy', vacancy.id] })
    },
    onError: (error) => {
      // Here you could add a toast notification to show the error
      console.error('Failed to generate ideal profile:', error)
    },
  })

  const handleGenerate = () => {
    if (!hrProfile || !vacancy) return
    mutate({
      vacancy_id: vacancy.id,
      organization_id: vacancy.organization_id,
      hr_specialist_id: hrProfile.id,
      language: language as 'ru' | 'kk' | 'en',
    })
  }

  return (
    <div className="mt-6 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h3 className="text-lg font-semibold">{t('ideal_profile.generator.title')}</h3>
      <p className="text-sm text-muted-foreground mt-2">
        {t('ideal_profile.generator.description')}
      </p>
      <Button onClick={handleGenerate} disabled={isPending} className="mt-4 gap-2">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('ideal_profile.generator.generating')}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {t('ideal_profile.generator.cta')}
          </>
        )}
      </Button>
    </div>
  )
}
