import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Brain, Scale, Users, Handshake, ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface EQResultsProps {
  results: Record<string, number>
}

export const EQResults = ({ results }: EQResultsProps) => {
  const { t } = useTranslation(['tests', 'test-interpretations'])
  const competencies = [
    {
      key: 'self_awareness',
      name: t('test-interpretations:psychometric.eq.selfAwareness.name'),
      description: t('test-interpretations:psychometric.eq.selfAwareness.description'),
      interpretation: t('test-interpretations:psychometric.eq.selfAwareness.interpretation'),
      tips: t('test-interpretations:psychometric.eq.selfAwareness.tips'),
      icon: Brain,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-500',
      gradient: 'from-indigo-500/20 to-indigo-500/5',
      borderColor: 'border-indigo-500/20',
    },
    {
      key: 'self_management',
      name: t('test-interpretations:psychometric.eq.selfManagement.name'),
      description: t('test-interpretations:psychometric.eq.selfManagement.description'),
      interpretation: t('test-interpretations:psychometric.eq.selfManagement.interpretation'),
      tips: t('test-interpretations:psychometric.eq.selfManagement.tips'),
      icon: Scale,
      color: 'bg-teal-500',
      textColor: 'text-teal-500',
      gradient: 'from-teal-500/20 to-teal-500/5',
      borderColor: 'border-teal-500/20',
    },
    {
      key: 'social_awareness',
      name: t('test-interpretations:psychometric.eq.socialAwareness.name'),
      description: t('test-interpretations:psychometric.eq.socialAwareness.description'),
      interpretation: t('test-interpretations:psychometric.eq.socialAwareness.interpretation'),
      tips: t('test-interpretations:psychometric.eq.socialAwareness.tips'),
      icon: Users,
      color: 'bg-rose-500',
      textColor: 'text-rose-500',
      gradient: 'from-rose-500/20 to-rose-500/5',
      borderColor: 'border-rose-500/20',
    },
    {
      key: 'relationship_management',
      name: t('test-interpretations:psychometric.eq.relationshipManagement.name'),
      description: t('test-interpretations:psychometric.eq.relationshipManagement.description'),
      interpretation: t('test-interpretations:psychometric.eq.relationshipManagement.interpretation'),
      tips: t('test-interpretations:psychometric.eq.relationshipManagement.tips'),
      icon: Handshake,
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      gradient: 'from-amber-500/20 to-amber-500/5',
      borderColor: 'border-amber-500/20',
    },
  ]

  const getColor = (value: number) => {
    if (value >= 75) return 'text-emerald-600'
    if (value >= 50) return 'text-amber-600'
    return 'text-red-600'
  }

  const getLevel = (value: number) => {
    if (value >= 75) return t('tests:results.levelHigh')
    if (value >= 50) return t('tests:results.levelMedium')
    return t('tests:results.levelNeedsDevelopment')
  }

  const averageEQ = Math.round(Object.values(results).reduce((sum, val) => sum + val, 0) / 4)

  return (
    <div className="space-y-8">
      {/* Описание теста */}
      <Card className="p-6 bg-gradient-to-br from-card to-secondary/30 border-none shadow-sm">
        <p className="text-muted-foreground leading-relaxed">
          {t('test-interpretations:testDescriptions.eq')}
        </p>
      </Card>

      {/* Общий уровень EQ */}
      <Card className="p-8 border-none shadow-sm bg-gradient-to-br from-card to-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            <div className="text-center md:text-left space-y-2 max-w-md md:pr-4 w-full">
              <h2 className="text-xl md:text-2xl font-bold break-words">{t('tests:results.yourOverallEQLevel')}</h2>
              <p className="text-sm md:text-base text-muted-foreground">{t('tests:results.eqDescription')}</p>
            </div>

            <div className="relative flex items-center justify-center flex-shrink-0">
              {/* SVG Circle Chart */}
              <div className="relative w-40 h-40 md:w-48 md:h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-secondary"
                  />
                  {/* Value circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (averageEQ / 100) * 282.7}
                    className={cn(averageEQ >= 75 ? 'text-emerald-500' : averageEQ >= 50 ? 'text-amber-500' : 'text-blue-500', "transition-all duration-1000 ease-out")}
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl md:text-5xl font-black tracking-tighter">{averageEQ}</span>
                  <span className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">{getLevel(averageEQ)}</span>
                </div>
              </div>
            </div>
        </div>
      </Card>

      {/* Grid компетенций - Masonry Layout */}
      <div className="columns-1 md:columns-2 gap-4 space-y-4">
        {competencies.map((comp) => {
          const value = results[comp.key as keyof typeof results]
          const Icon = comp.icon

          return (
            <Card key={comp.key} className={cn("overflow-hidden border transition-all duration-300 break-inside-avoid mb-4", comp.borderColor)}>
              <div className={cn("h-1.5 w-full", comp.color)} />
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={comp.key} className="border-none">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline group [&>svg]:hidden">
                    <div className="w-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2.5 rounded-xl bg-background shadow-sm", comp.textColor)}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-lg leading-tight">{comp.name}</h3>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-2xl font-bold">{value}%</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 mb-2">
                        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn("h-full transition-all duration-1000 ease-out rounded-full", comp.color)}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className={cn("font-medium", getColor(value))}>{getLevel(value)}</span>
                          <span className="text-muted-foreground">
                            {value >= 75 && t('tests:results.excellentlyDeveloped')}
                            {value >= 50 && value < 75 && t('tests:results.potentialForGrowth')}
                            {value < 50 && t('tests:results.recommendedDevelopment')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-center mt-2">
                         <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 shrink-0" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6 pt-0">
                    <div className="space-y-4 pt-4 border-t border-black/5">
                      <div className="grid gap-4 sm:grid-cols-1 text-sm">
                        <div className="bg-white/40 p-3 rounded-lg backdrop-blur-sm">
                          <span className="font-semibold block mb-1 text-xs uppercase text-muted-foreground">
                            {t('tests:results.interpretation')}
                          </span>
                          <p className="text-muted-foreground">
                            {comp.interpretation}
                          </p>
                        </div>
                        <div className="bg-white/40 p-3 rounded-lg backdrop-blur-sm">
                          <span className="font-semibold block mb-1 text-xs uppercase text-muted-foreground">
                            {t('tests:results.developmentTip')}
                          </span>
                          <p className="text-muted-foreground">
                            {comp.tips}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
