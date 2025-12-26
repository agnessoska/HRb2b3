import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Brain, Heart, Users, Sparkles, Shield, ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface BigFiveResultsProps {
  results: Record<string, number>
}

export const BigFiveResults = ({ results }: BigFiveResultsProps) => {
  const { t } = useTranslation(['tests', 'test-interpretations'])
  const scales = [
    {
      key: 'openness',
      name: t('test-interpretations:psychometric.bigFive.openness.name'),
      description: t('test-interpretations:psychometric.bigFive.openness.description'),
      interpretation: t('test-interpretations:psychometric.bigFive.openness.interpretation'),
      tips: t('test-interpretations:psychometric.bigFive.openness.tips'),
      value: results.openness,
      type: 'higher_is_better',
      icon: Sparkles,
      color: 'bg-purple-500',
      gradient: 'from-purple-500/20 to-purple-500/5',
      fill: '#a855f7',
    },
    {
      key: 'conscientiousness',
      name: t('test-interpretations:psychometric.bigFive.conscientiousness.name'),
      description: t('test-interpretations:psychometric.bigFive.conscientiousness.description'),
      interpretation: t('test-interpretations:psychometric.bigFive.conscientiousness.interpretation'),
      tips: t('test-interpretations:psychometric.bigFive.conscientiousness.tips'),
      value: results.conscientiousness,
      type: 'higher_is_better',
      icon: Shield,
      color: 'bg-blue-500',
      gradient: 'from-blue-500/20 to-blue-500/5',
      fill: '#3b82f6',
    },
    {
      key: 'extraversion',
      name: t('test-interpretations:psychometric.bigFive.extraversion.name'),
      description: t('test-interpretations:psychometric.bigFive.extraversion.description'),
      interpretation: t('test-interpretations:psychometric.bigFive.extraversion.interpretation'),
      tips: t('test-interpretations:psychometric.bigFive.extraversion.tips'),
      value: results.extraversion,
      type: 'optimal',
      optimalValue: 50,
      icon: Users,
      color: 'bg-yellow-500',
      gradient: 'from-yellow-500/20 to-yellow-500/5',
      fill: '#eab308',
    },
    {
      key: 'agreeableness',
      name: t('test-interpretations:psychometric.bigFive.agreeableness.name'),
      description: t('test-interpretations:psychometric.bigFive.agreeableness.description'),
      interpretation: t('test-interpretations:psychometric.bigFive.agreeableness.interpretation'),
      tips: t('test-interpretations:psychometric.bigFive.agreeableness.tips'),
      value: results.agreeableness,
      type: 'optimal',
      optimalValue: 65,
      icon: Heart,
      color: 'bg-green-500',
      gradient: 'from-green-500/20 to-green-500/5',
      fill: '#22c55e',
    },
    {
      key: 'neuroticism',
      name: t('test-interpretations:psychometric.bigFive.neuroticism.name'),
      description: t('test-interpretations:psychometric.bigFive.neuroticism.description'),
      interpretation: t('test-interpretations:psychometric.bigFive.neuroticism.interpretation'),
      tips: t('test-interpretations:psychometric.bigFive.neuroticism.tips'),
      value: results.neuroticism,
      type: 'lower_is_better',
      icon: Brain,
      color: 'bg-red-500',
      gradient: 'from-red-500/20 to-red-500/5',
      fill: '#ef4444',
    },
  ]

  const getInterpretation = (scale: (typeof scales)[0]) => {
    if (scale.key === 'openness') {
      if (scale.value >= 67) return t('test-interpretations:psychometric.bigFive.openness.high')
      if (scale.value >= 34) return t('test-interpretations:psychometric.bigFive.openness.medium')
      return t('test-interpretations:psychometric.bigFive.openness.low')
    }
    if (scale.key === 'conscientiousness') {
      if (scale.value >= 67) return t('test-interpretations:psychometric.bigFive.conscientiousness.high')
      if (scale.value >= 34) return t('test-interpretations:psychometric.bigFive.conscientiousness.medium')
      return t('test-interpretations:psychometric.bigFive.conscientiousness.low')
    }
    if (scale.key === 'extraversion') {
      if (scale.value >= 67) return t('test-interpretations:psychometric.bigFive.extraversion.high')
      if (scale.value >= 34) return t('test-interpretations:psychometric.bigFive.extraversion.medium')
      return t('test-interpretations:psychometric.bigFive.extraversion.low')
    }
    if (scale.key === 'agreeableness') {
      if (scale.value >= 71) return t('test-interpretations:psychometric.bigFive.agreeableness.high')
      if (scale.value >= 31) return t('test-interpretations:psychometric.bigFive.agreeableness.medium')
      return t('test-interpretations:psychometric.bigFive.agreeableness.low')
    }
    if (scale.key === 'neuroticism') {
      if (scale.value >= 71) return t('test-interpretations:psychometric.bigFive.neuroticism.high')
      if (scale.value >= 31) return t('test-interpretations:psychometric.bigFive.neuroticism.medium')
      return t('test-interpretations:psychometric.bigFive.neuroticism.low')
    }
  }

  const getLevel = (value: number) => {
    if (value >= 70) return t('tests:results.highLevel')
    if (value >= 35) return t('tests:results.mediumLevel')
    return t('tests:results.lowLevel')
  }

  return (
    <div className="space-y-8">
      {/* Описание теста */}
      <Card className="p-6 bg-gradient-to-br from-card to-secondary/30 border-none shadow-sm">
        <p className="text-muted-foreground leading-relaxed">
          {t('test-interpretations:testDescriptions.bigFive')}
        </p>
      </Card>

      {/* Детальная разбивка - Masonry Layout */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {scales.map((scale) => (
          <Card key={scale.key} className={cn("overflow-hidden border-none shadow-sm bg-gradient-to-br break-inside-avoid mb-4", scale.gradient)}>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={scale.key} className="border-none">
                <AccordionTrigger className="px-6 py-4 hover:no-underline group [&>svg]:hidden">
                  <div className="flex items-center gap-4 w-full">
                    <div className={cn("p-2.5 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm", scale.color.replace('bg-', 'text-'))}>
                      <scale.icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold">{scale.name}</h4>
                        <span className="font-bold text-lg">{scale.value}%</span>
                      </div>
                      
                      <div className="h-2 bg-white/30 rounded-full overflow-hidden w-full backdrop-blur-sm">
                        <div
                          className={cn("h-full transition-all duration-1000 ease-out rounded-full", scale.color)}
                          style={{ width: `${scale.value}%` }}
                        />
                      </div>
                    </div>
                    
                    <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 shrink-0" />
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-6 pt-0">
                  <div className="space-y-4 pt-4 border-t border-black/5">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                        {t('tests:results.level')}: {getLevel(scale.value)}
                      </span>
                      <p className="text-sm font-medium">
                        {getInterpretation(scale)?.split(':')[1] || getInterpretation(scale)}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-1 text-sm">
                      <div className="bg-white/40 p-3 rounded-lg backdrop-blur-sm">
                        <span className="font-semibold block mb-1 text-xs uppercase text-muted-foreground">
                          {t('tests:results.interpretation')}
                        </span>
                        <p className="text-muted-foreground">{scale.interpretation}</p>
                      </div>
                      <div className="bg-white/40 p-3 rounded-lg backdrop-blur-sm">
                        <span className="font-semibold block mb-1 text-xs uppercase text-muted-foreground">
                          {t('tests:results.developmentTip')}
                        </span>
                        <p className="text-muted-foreground">{scale.tips}</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        ))}
      </div>
    </div>
  )
}
