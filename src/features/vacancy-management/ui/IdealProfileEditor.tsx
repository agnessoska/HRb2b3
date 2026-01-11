import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useForm, Controller } from 'react-hook-form'
import type { Control, Path, FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Database } from '@/shared/types/database'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Target } from 'lucide-react'
import { HelpCircle } from '@/shared/ui/HelpCircle'

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
  description,
  scaleType,
  t,
}: {
  control: Control<T>
  name: Path<T>
  label: string
  description: string
  scaleType: 'higher_is_better' | 'lower_is_better' | 'optimal'
  t: (key: string) => string
}) => {
  const getScaleTypeIcon = () => {
    switch (scaleType) {
      case 'higher_is_better':
        return <TrendingUp className="h-3 w-3" />
      case 'lower_is_better':
        return <TrendingDown className="h-3 w-3" />
      case 'optimal':
        return <Target className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-3 rounded-lg border bg-card/50 p-4">
      {/* Header шкалы */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
        </Label>
        <Badge variant="secondary" className="flex w-fit items-center gap-1 text-xs">
          {getScaleTypeIcon()}
          {t(`idealProfile.scaleTypes.${scaleType}`)}
        </Badge>
      </div>

      {/* Описание шкалы */}
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>

      {/* Slider */}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const value = typeof field.value === 'number' ? field.value : 0
          return (
            <div className="space-y-2">
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

              {/* Интерпретация текущего значения */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>0-35: {t('idealProfile.valueRanges.low')}</span>
                <span>36-65: {t('idealProfile.valueRanges.medium')}</span>
                <span>66-100: {t('idealProfile.valueRanges.high')}</span>
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}

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
            <div className="flex flex-col items-start gap-1 text-left">
              <div className="flex items-center gap-2">
                <span>{t('idealProfile.bigFive.title')}</span>
                <HelpCircle topicId="ideal_profile" iconClassName="h-4 w-4" />
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                {t('idealProfile.testDescriptions.bigFive')}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <ProfileSlider
              control={control}
              name="big_five.openness"
              label={t('idealProfile.bigFive.openness')}
              description={t('idealProfile.scaleDescriptions.bigFive.openness')}
              scaleType="higher_is_better"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="big_five.conscientiousness"
              label={t('idealProfile.bigFive.conscientiousness')}
              description={t('idealProfile.scaleDescriptions.bigFive.conscientiousness')}
              scaleType="higher_is_better"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="big_five.extraversion"
              label={t('idealProfile.bigFive.extraversion')}
              description={t('idealProfile.scaleDescriptions.bigFive.extraversion')}
              scaleType="optimal"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="big_five.agreeableness"
              label={t('idealProfile.bigFive.agreeableness')}
              description={t('idealProfile.scaleDescriptions.bigFive.agreeableness')}
              scaleType="optimal"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="big_five.neuroticism"
              label={t('idealProfile.bigFive.neuroticism')}
              description={t('idealProfile.scaleDescriptions.bigFive.neuroticism')}
              scaleType="lower_is_better"
              t={t}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="eq">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex flex-col items-start gap-1 text-left">
              <div className="flex items-center gap-2">
                <span>{t('idealProfile.eq.title')}</span>
                <HelpCircle topicId="ideal_profile" iconClassName="h-4 w-4" />
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                {t('idealProfile.testDescriptions.eq')}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <ProfileSlider
              control={control}
              name="eq.self_awareness"
              label={t('idealProfile.eq.self_awareness')}
              description={t('idealProfile.scaleDescriptions.eq.self_awareness')}
              scaleType="higher_is_better"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="eq.self_management"
              label={t('idealProfile.eq.self_management')}
              description={t('idealProfile.scaleDescriptions.eq.self_management')}
              scaleType="higher_is_better"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="eq.social_awareness"
              label={t('idealProfile.eq.social_awareness')}
              description={t('idealProfile.scaleDescriptions.eq.social_awareness')}
              scaleType="higher_is_better"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="eq.relationship_management"
              label={t('idealProfile.eq.relationship_management')}
              description={t('idealProfile.scaleDescriptions.eq.relationship_management')}
              scaleType="higher_is_better"
              t={t}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="soft_skills">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex flex-col items-start gap-1 text-left">
              <div className="flex items-center gap-2">
                <span>{t('idealProfile.softSkills.title')}</span>
                <HelpCircle topicId="ideal_profile" iconClassName="h-4 w-4" />
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                {t('idealProfile.testDescriptions.softSkills')}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <ProfileSlider
              control={control}
              name="soft_skills.communication"
              label={t('idealProfile.softSkills.communication')}
              description={t('idealProfile.scaleDescriptions.softSkills.communication')}
              scaleType="higher_is_better"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="soft_skills.teamwork"
              label={t('idealProfile.softSkills.teamwork')}
              description={t('idealProfile.scaleDescriptions.softSkills.teamwork')}
              scaleType="higher_is_better"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="soft_skills.critical_thinking"
              label={t('idealProfile.softSkills.critical_thinking')}
              description={t('idealProfile.scaleDescriptions.softSkills.critical_thinking')}
              scaleType="higher_is_better"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="soft_skills.adaptability"
              label={t('idealProfile.softSkills.adaptability')}
              description={t('idealProfile.scaleDescriptions.softSkills.adaptability')}
              scaleType="higher_is_better"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="soft_skills.initiative"
              label={t('idealProfile.softSkills.initiative')}
              description={t('idealProfile.scaleDescriptions.softSkills.initiative')}
              scaleType="higher_is_better"
              t={t}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="motivation">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex flex-col items-start gap-1 text-left">
              <div className="flex items-center gap-2">
                <span>{t('idealProfile.motivation.title')}</span>
                <HelpCircle topicId="ideal_profile" iconClassName="h-4 w-4" />
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                {t('idealProfile.testDescriptions.motivation')}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <ProfileSlider
              control={control}
              name="motivation.achievement"
              label={t('idealProfile.motivation.achievement')}
              description={t('idealProfile.scaleDescriptions.motivation.achievement')}
              scaleType="higher_is_better"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="motivation.power"
              label={t('idealProfile.motivation.power')}
              description={t('idealProfile.scaleDescriptions.motivation.power')}
              scaleType="optimal"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="motivation.affiliation"
              label={t('idealProfile.motivation.affiliation')}
              description={t('idealProfile.scaleDescriptions.motivation.affiliation')}
              scaleType="optimal"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="motivation.autonomy"
              label={t('idealProfile.motivation.autonomy')}
              description={t('idealProfile.scaleDescriptions.motivation.autonomy')}
              scaleType="optimal"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="motivation.security"
              label={t('idealProfile.motivation.security')}
              description={t('idealProfile.scaleDescriptions.motivation.security')}
              scaleType="optimal"
              t={t}
            />
            <ProfileSlider
              control={control}
              name="motivation.growth"
              label={t('idealProfile.motivation.growth')}
              description={t('idealProfile.scaleDescriptions.motivation.growth')}
              scaleType="higher_is_better"
              t={t}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="disc">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex flex-col items-start gap-1 text-left">
              <div className="flex items-center gap-2">
                <span>{t('idealProfile.disc.title')}</span>
                <HelpCircle topicId="ideal_profile" iconClassName="h-4 w-4" />
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                {t('idealProfile.testDescriptions.disc')}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div className="space-y-3 rounded-lg border bg-card/50 p-4">
              <Label htmlFor="disc" className="text-sm font-medium">
                {t('idealProfile.disc.type')}
              </Label>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('idealProfile.disc.styles').split(' | ').map((style, index) => (
                  <span key={index}>
                    {style}
                    {index < 3 && <br />}
                  </span>
                ))}
              </p>
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
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex flex-col items-start gap-1 text-left">
              <div className="flex items-center gap-2">
                <span>{t('idealProfile.mbti.title')}</span>
                <HelpCircle topicId="ideal_profile" iconClassName="h-4 w-4" />
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                {t('idealProfile.testDescriptions.mbti')}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div className="space-y-3 rounded-lg border bg-card/50 p-4">
              <Label htmlFor="mbti" className="text-sm font-medium">
                {t('idealProfile.mbti.type')}
              </Label>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('idealProfile.mbti.dichotomies').split(' | ').map((dichotomy, index) => (
                  <span key={index}>
                    {dichotomy}
                    {index < 3 && <br />}
                  </span>
                ))}
              </p>
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
