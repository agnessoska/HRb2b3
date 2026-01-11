import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { generateIdealProfile } from '../api/generateIdealProfile'
import { useSettingsStore } from '@/app/store/settings'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import type { Database } from '@/shared/types/database'
import { 
  Sparkles, 
  Target, 
  CheckCircle2, 
  Zap,
  Brain,
  Users,
  Activity,
  Heart,
  Lightbulb,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AIGenerationModal } from '@/shared/ui/AIGenerationModal'
import { GlassCard } from '@/shared/ui/GlassCard'
import { AIBorder } from '@/shared/ui/AIBorder'
import { TokenCostBanner } from '@/shared/ui/TokenCostBanner'
import { useTokenCalculation } from '@/shared/hooks/useTokenCalculation'
import { HelpCircle } from '@/shared/ui/HelpCircle'

interface IdealProfileGeneratorProps {
  vacancy: Database['public']['Tables']['vacancies']['Row']
}

export function IdealProfileGenerator({ vacancy }: IdealProfileGeneratorProps) {
  const { t } = useTranslation('vacancies')
  const queryClient = useQueryClient()
  const { data: hrProfile } = useHrProfile()
  const { language } = useSettingsStore()
  const { calculation } = useTokenCalculation('ideal_profile_generation', vacancy.description + (vacancy.requirements || ''))

  const generateIdealProfileMutation = useMutation({
    mutationFn: generateIdealProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancy', vacancy.id] })
    },
    onError: (error) => {
      console.error('Failed to generate ideal profile:', error)
    },
  })
  const { mutate, isPending } = generateIdealProfileMutation

  const handleGenerate = () => {
    if (!hrProfile || !vacancy) return
    mutate({
      vacancy_id: vacancy.id,
      organization_id: vacancy.organization_id,
      hr_specialist_id: hrProfile.id,
      language: language as 'ru' | 'kk' | 'en',
    })
  }

  const tests = [
    { 
      icon: Brain, 
      label: t('idealProfile.generator.testsIncluded.bigFive'),
      color: 'text-violet-500'
    },
    { 
      icon: Users, 
      label: t('idealProfile.generator.testsIncluded.mbti'),
      color: 'text-blue-500'
    },
    { 
      icon: Activity, 
      label: t('idealProfile.generator.testsIncluded.disc'),
      color: 'text-emerald-500'
    },
    { 
      icon: Heart, 
      label: t('idealProfile.generator.testsIncluded.eq'),
      color: 'text-rose-500'
    },
    { 
      icon: Lightbulb, 
      label: t('idealProfile.generator.testsIncluded.softSkills'),
      color: 'text-amber-500'
    },
    { 
      icon: TrendingUp, 
      label: t('idealProfile.generator.testsIncluded.motivation'),
      color: 'text-cyan-500'
    },
  ]

  const benefits = t('idealProfile.generator.whyNeed.benefits', { returnObjects: true }) as string[]

  return (
    <>
      <AIGenerationModal
        isOpen={isPending}
        onOpenChange={() => {}}
        isPending={isPending}
        title={t('idealProfile.generator.processingTitle')}
        description={t('idealProfile.generator.processingDescription')}
        finalTokens={generateIdealProfileMutation.data?.total_tokens}
      />

      <div className="space-y-8">
        {/* Главный информационный блок */}
        <GlassCard className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">
                  {t('idealProfile.generator.whatIs.title')}
                </h2>
                <HelpCircle topicId="ideal_profile" />
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t('idealProfile.generator.whatIs.description')}
              </p>
            </div>
          </div>

          {/* Преимущества */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              {t('idealProfile.generator.whyNeed.title')}
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {Array.isArray(benefits) && benefits.map((benefit, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Как работает */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            {t('idealProfile.generator.howWorks.title')}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative p-6 rounded-xl border bg-card hover:shadow-md transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                1
              </div>
              <Brain className="h-8 w-8 text-primary mb-3" />
              <p className="text-sm font-medium">{t('idealProfile.generator.howWorks.step1')}</p>
            </div>
            <div className="relative p-6 rounded-xl border bg-card hover:shadow-md transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                2
              </div>
              <Target className="h-8 w-8 text-primary mb-3" />
              <p className="text-sm font-medium">{t('idealProfile.generator.howWorks.step2')}</p>
            </div>
            <div className="relative p-6 rounded-xl border bg-card hover:shadow-md transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                3
              </div>
              <Activity className="h-8 w-8 text-primary mb-3" />
              <p className="text-sm font-medium">{t('idealProfile.generator.howWorks.step3')}</p>
            </div>
          </div>
        </div>

        {/* Что входит в профиль */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t('idealProfile.generator.testsIncluded.title')}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tests.map((test, idx) => {
              const Icon = test.icon
              return (
                <div 
                  key={idx}
                  className="flex items-center gap-3 p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors"
                >
                  <Icon className={`h-6 w-6 ${test.color}`} />
                  <span className="text-sm font-medium">{test.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Стоимость и генерация */}
        <AIBorder>
          <div className="p-6 space-y-6">
            {/* Информация о токенах */}
            <TokenCostBanner
              operationType="ideal_profile_generation"
              inputString={vacancy.description + (vacancy.requirements || '')}
            />

            {/* CTA кнопка */}
            <Button
              onClick={handleGenerate}
              disabled={isPending || !calculation?.hasEnough}
              size="lg"
              className="w-full h-14 text-base gap-3 shadow-lg hover:shadow-xl transition-all"
            >
              {isPending ? (
                <>
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {t('idealProfile.generator.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  {t('idealProfile.generator.cta')}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </AIBorder>
      </div>
    </>
  )
}
