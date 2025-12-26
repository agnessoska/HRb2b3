import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Target, Crown, Handshake, Bird, Shield, TrendingUp, ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface MotivationResultsProps {
  results: Record<string, number>
}

export const MotivationResults = ({ results }: MotivationResultsProps) => {
  const { t } = useTranslation(['tests', 'test-interpretations'])
  const drivers = [
    {
      key: 'achievement',
      name: t('test-interpretations:psychometric.motivation.achievement.name'),
      description: t('test-interpretations:psychometric.motivation.achievement.description'),
      interpretation: t('test-interpretations:psychometric.motivation.achievement.interpretation'),
      tips: t('test-interpretations:psychometric.motivation.achievement.tips'),
      icon: Target,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
    },
    {
      key: 'power',
      name: t('test-interpretations:psychometric.motivation.power.name'),
      description: t('test-interpretations:psychometric.motivation.power.description'),
      interpretation: t('test-interpretations:psychometric.motivation.power.interpretation'),
      tips: t('test-interpretations:psychometric.motivation.power.tips'),
      icon: Crown,
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      gradient: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/20',
    },
    {
      key: 'affiliation',
      name: t('test-interpretations:psychometric.motivation.affiliation.name'),
      description: t('test-interpretations:psychometric.motivation.affiliation.description'),
      interpretation: t('test-interpretations:psychometric.motivation.affiliation.interpretation'),
      tips: t('test-interpretations:psychometric.motivation.affiliation.tips'),
      icon: Handshake,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      gradient: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/20',
    },
    {
      key: 'autonomy',
      name: t('test-interpretations:psychometric.motivation.autonomy.name'),
      description: t('test-interpretations:psychometric.motivation.autonomy.description'),
      interpretation: t('test-interpretations:psychometric.motivation.autonomy.interpretation'),
      tips: t('test-interpretations:psychometric.motivation.autonomy.tips'),
      icon: Bird,
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      gradient: 'from-amber-500/20 to-amber-500/5',
      borderColor: 'border-amber-500/20',
    },
    {
      key: 'security',
      name: t('test-interpretations:psychometric.motivation.security.name'),
      description: t('test-interpretations:psychometric.motivation.security.description'),
      interpretation: t('test-interpretations:psychometric.motivation.security.interpretation'),
      tips: t('test-interpretations:psychometric.motivation.security.tips'),
      icon: Shield,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-500',
      gradient: 'from-cyan-500/20 to-cyan-500/5',
      borderColor: 'border-cyan-500/20',
    },
    {
      key: 'growth',
      name: t('test-interpretations:psychometric.motivation.growth.name'),
      description: t('test-interpretations:psychometric.motivation.growth.description'),
      interpretation: t('test-interpretations:psychometric.motivation.growth.interpretation'),
      tips: t('test-interpretations:psychometric.motivation.growth.tips'),
      icon: TrendingUp,
      color: 'bg-rose-500',
      textColor: 'text-rose-500',
      gradient: 'from-rose-500/20 to-rose-500/5',
      borderColor: 'border-rose-500/20',
    },
  ]

  const sortedDrivers = [...drivers].sort(
    (a, b) => results[b.key as keyof typeof results] - results[a.key as keyof typeof results]
  )
  const topDrivers = sortedDrivers.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Описание теста */}
      <Card className="p-6 bg-gradient-to-br from-card to-secondary/30 border-none shadow-sm">
        <p className="text-muted-foreground leading-relaxed">
          {t('test-interpretations:testDescriptions.motivation')}
        </p>
      </Card>

      {/* Топ-3 драйвера */}
      <Card className="p-8 border-none shadow-sm bg-gradient-to-br from-card to-primary/5">
        <h3 className="text-xl font-bold mb-8 text-center">{t('tests:results.yourMainDrivers')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topDrivers.map((driver, index) => {
            const value = results[driver.key as keyof typeof results]
            const Icon = driver.icon
            
            return (
              <div key={driver.key} className={cn(
                "relative p-6 rounded-2xl border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group",
                driver.borderColor
              )}>
                {/* Номер приоритета */}
                <div className={cn(
                  "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm",
                  driver.color
                )}>
                  #{index + 1}
                </div>

                <div className="flex flex-col items-center text-center space-y-4 pt-2">
                  <div className={cn("p-4 rounded-full bg-background shadow-md group-hover:scale-110 transition-transform", driver.textColor)}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold mb-1">{value}%</div>
                    <div className="font-semibold text-lg">{driver.name}</div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {driver.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Полный профиль - Masonry Layout */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">{t('tests:results.fullMotivationalProfile')}</h3>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {drivers.map((driver) => {
            const value = results[driver.key as keyof typeof results]
            const Icon = driver.icon

            return (
              <Card key={driver.key} className={cn("overflow-hidden border transition-all duration-300 break-inside-avoid mb-4", driver.borderColor)}>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={driver.key} className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline group [&>svg]:hidden">
                      <div className="w-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn("p-2 rounded-lg bg-background shadow-sm", driver.textColor)}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h4 className="font-semibold text-sm line-clamp-1 flex-1 text-left" title={driver.name}>{driver.name}</h4>
                        </div>

                        <div className="flex items-end justify-between mb-2">
                          <span className="text-2xl font-bold">{value}%</span>
                          <span className="text-xs text-muted-foreground mb-1">
                            {value >= 70 ? t('tests:results.high') : value >= 40 ? t('tests:results.medium') : t('tests:results.low')}
                          </span>
                        </div>

                        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                          <div
                            className={cn("h-full transition-all duration-1000 ease-out rounded-full", driver.color)}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-center mt-2">
                           <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 shrink-0" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-6 pb-6 pt-0">
                      <div className="space-y-4 pt-4 border-t border-black/5">
                        <div className="grid gap-4 sm:grid-cols-1 text-sm">
                          <div className="bg-secondary/30 p-3 rounded-lg backdrop-blur-sm">
                            <span className="font-semibold block mb-1 text-xs uppercase text-muted-foreground">
                              {t('tests:results.interpretation')}
                            </span>
                            <p className="text-muted-foreground">
                              {driver.interpretation}
                            </p>
                          </div>
                          <div className="bg-secondary/30 p-3 rounded-lg backdrop-blur-sm">
                            <span className="font-semibold block mb-1 text-xs uppercase text-muted-foreground">
                              {t('tests:results.developmentTip')}
                            </span>
                            <p className="text-muted-foreground">
                              {driver.tips}
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
    </div>
  )
}
