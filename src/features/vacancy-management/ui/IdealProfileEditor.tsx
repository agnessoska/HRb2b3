import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { useForm, Controller } from 'react-hook-form'
import type { Control, Path, FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Database } from '@/shared/types/database'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'

type Vacancy = Database['public']['Tables']['vacancies']['Row']

// Схема валидации Zod, соответствующая структуре ideal_profile
const idealProfileSchema = z.object({
  big_five: z.object({
    openness: z.number().min(0).max(100),
    conscientiousness: z.number().min(0).max(100),
    extraversion: z.number().min(0).max(100),
    agreeableness: z.number().min(0).max(100),
    neuroticism: z.number().min(0).max(100),
  }),
  mbti: z.string().length(4),
  disc: z.string().max(4),
  eq: z.object({
    self_awareness: z.number().min(0).max(100),
    self_management: z.number().min(0).max(100),
    social_awareness: z.number().min(0).max(100),
    relationship_management: z.number().min(0).max(100),
  }),
  soft_skills: z.object({
    communication: z.number().min(0).max(100),
    teamwork: z.number().min(0).max(100),
    critical_thinking: z.number().min(0).max(100),
    adaptability: z.number().min(0).max(100),
    initiative: z.number().min(0).max(100),
  }),
  motivation: z.object({
    achievement: z.number().min(0).max(100),
    power: z.number().min(0).max(100),
    affiliation: z.number().min(0).max(100),
    autonomy: z.number().min(0).max(100),
    security: z.number().min(0).max(100),
    growth: z.number().min(0).max(100),
  }),
})

type IdealProfileFormValues = z.infer<typeof idealProfileSchema>

interface IdealProfileEditorProps {
  vacancy: Vacancy
  onSave: (data: IdealProfileFormValues) => void
  isLoading: boolean
}

// Вспомогательный компонент для рендеринга слайдера
const ProfileSlider = <T extends IdealProfileFormValues>({
  control,
  name,
  label,
}: {
  control: Control<T>
  name: Path<T>
  label: string
}) => (
  <div className="grid gap-4">
    <Label htmlFor={name} className="text-sm font-medium">
      {label}
    </Label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = typeof field.value === 'number' ? field.value : 0
        return (
          <div className="flex items-center gap-4">
            <Slider
              id={name}
              min={0}
              max={100}
              step={1}
              value={[value]}
              onValueChange={(val) => field.onChange(val[0])}
              className="w-full"
            />
            <span className="w-12 text-center text-sm font-semibold">{value}</span>
          </div>
        )
      }}
    />
  </div>
)

export const IdealProfileEditor = ({ vacancy, onSave, isLoading }: IdealProfileEditorProps) => {
  const { t } = useTranslation('vacancies')
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<IdealProfileFormValues>({
    resolver: zodResolver(idealProfileSchema),
    defaultValues: vacancy.ideal_profile
      ? (vacancy.ideal_profile as unknown as IdealProfileFormValues)
      : undefined,
  })

  const onSubmit = (data: IdealProfileFormValues) => {
    onSave(data)
  }

  const onError = (errors: FieldErrors<IdealProfileFormValues>) => {
    // Можно добавить логирование ошибок в сервис мониторинга
    console.error('Form validation errors:', errors)
  }

  if (!vacancy.ideal_profile) {
    return <div>{t('idealProfile.noProfileData')}</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
      <Accordion type="multiple" defaultValue={['big_five']} className="w-full">
        <AccordionItem value="big_five">
          <AccordionTrigger className="text-lg font-semibold">
            {t('idealProfile.bigFive.title')}
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <ProfileSlider
              control={control}
              name="big_five.openness"
              label={t('idealProfile.bigFive.openness')}
            />
            <ProfileSlider
              control={control}
              name="big_five.conscientiousness"
              label={t('idealProfile.bigFive.conscientiousness')}
            />
            <ProfileSlider
              control={control}
              name="big_five.extraversion"
              label={t('idealProfile.bigFive.extraversion')}
            />
            <ProfileSlider
              control={control}
              name="big_five.agreeableness"
              label={t('idealProfile.bigFive.agreeableness')}
            />
            <ProfileSlider
              control={control}
              name="big_five.neuroticism"
              label={t('idealProfile.bigFive.neuroticism')}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="eq">
          <AccordionTrigger className="text-lg font-semibold">{t('idealProfile.eq.title')}</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <ProfileSlider
              control={control}
              name="eq.self_awareness"
              label={t('idealProfile.eq.self_awareness')}
            />
            <ProfileSlider
              control={control}
              name="eq.self_management"
              label={t('idealProfile.eq.self_management')}
            />
            <ProfileSlider
              control={control}
              name="eq.social_awareness"
              label={t('idealProfile.eq.social_awareness')}
            />
            <ProfileSlider
              control={control}
              name="eq.relationship_management"
              label={t('idealProfile.eq.relationship_management')}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="soft_skills">
          <AccordionTrigger className="text-lg font-semibold">
            {t('idealProfile.softSkills.title')}
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <ProfileSlider
              control={control}
              name="soft_skills.communication"
              label={t('idealProfile.softSkills.communication')}
            />
            <ProfileSlider
              control={control}
              name="soft_skills.teamwork"
              label={t('idealProfile.softSkills.teamwork')}
            />
            <ProfileSlider
              control={control}
              name="soft_skills.critical_thinking"
              label={t('idealProfile.softSkills.critical_thinking')}
            />
            <ProfileSlider
              control={control}
              name="soft_skills.adaptability"
              label={t('idealProfile.softSkills.adaptability')}
            />
            <ProfileSlider
              control={control}
              name="soft_skills.initiative"
              label={t('idealProfile.softSkills.initiative')}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="motivation">
          <AccordionTrigger className="text-lg font-semibold">
            {t('idealProfile.motivation.title')}
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <ProfileSlider
              control={control}
              name="motivation.achievement"
              label={t('idealProfile.motivation.achievement')}
            />
            <ProfileSlider
              control={control}
              name="motivation.power"
              label={t('idealProfile.motivation.power')}
            />
            <ProfileSlider
              control={control}
              name="motivation.affiliation"
              label={t('idealProfile.motivation.affiliation')}
            />
            <ProfileSlider
              control={control}
              name="motivation.autonomy"
              label={t('idealProfile.motivation.autonomy')}
            />
            <ProfileSlider
              control={control}
              name="motivation.security"
              label={t('idealProfile.motivation.security')}
            />
            <ProfileSlider
              control={control}
              name="motivation.growth"
              label={t('idealProfile.motivation.growth')}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="disc">
          <AccordionTrigger className="text-lg font-semibold">{t('idealProfile.disc.title')}</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div className="grid gap-4">
              <Label htmlFor="disc" className="text-sm font-medium">
                {t('idealProfile.disc.type')}
              </Label>
              <Controller
                name="disc"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="disc"
                    maxLength={4}
                    placeholder={t('idealProfile.disc.placeholder')}
                    className="max-w-xs"
                  />
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mbti">
          <AccordionTrigger className="text-lg font-semibold">{t('idealProfile.mbti.title')}</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div className="grid gap-4">
              <Label htmlFor="mbti" className="text-sm font-medium">
                {t('idealProfile.mbti.type')}
              </Label>
              <Controller
                name="mbti"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="mbti"
                    maxLength={4}
                    placeholder={t('idealProfile.mbti.placeholder')}
                    className="max-w-xs"
                  />
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty || isLoading}>
          {isLoading ? t('idealProfile.saving') : t('idealProfile.saveChanges')}
        </Button>
      </div>
    </form>
  )
}
