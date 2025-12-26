import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { MessageCircle, Users, BrainCircuit, Shuffle, Rocket, ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface SoftSkillsResultsProps {
  results: Record<string, number>
}

export const SoftSkillsResults = ({ results }: SoftSkillsResultsProps) => {
  const { t } = useTranslation(['tests', 'test-interpretations'])
  const skills = [
    {
      key: 'communication',
      name: t('test-interpretations:psychometric.softSkills.communication.name'),
      shortName: t('test-interpretations:psychometric.softSkills.communication.shortName'),
      description: t('test-interpretations:psychometric.softSkills.communication.description'),
      interpretation: t('test-interpretations:psychometric.softSkills.communication.interpretation'),
      tips: t('test-interpretations:psychometric.softSkills.communication.tips'),
      icon: MessageCircle,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      gradient: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/20',
    },
    {
      key: 'teamwork',
      name: t('test-interpretations:psychometric.softSkills.teamwork.name'),
      shortName: t('test-interpretations:psychometric.softSkills.teamwork.shortName'),
      description: t('test-interpretations:psychometric.softSkills.teamwork.description'),
      interpretation: t('test-interpretations:psychometric.softSkills.teamwork.interpretation'),
      tips: t('test-interpretations:psychometric.softSkills.teamwork.tips'),
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-500',
      gradient: 'from-green-500/20 to-green-500/5',
      borderColor: 'border-green-500/20',
    },
    {
      key: 'critical_thinking',
      name: t('test-interpretations:psychometric.softSkills.criticalThinking.name'),
      shortName: t('test-interpretations:psychometric.softSkills.criticalThinking.shortName'),
      description: t('test-interpretations:psychometric.softSkills.criticalThinking.description'),
      interpretation: t('test-interpretations:psychometric.softSkills.criticalThinking.interpretation'),
      tips: t('test-interpretations:psychometric.softSkills.criticalThinking.tips'),
      icon: BrainCircuit,
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      gradient: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/20',
    },
    {
      key: 'adaptability',
      name: t('test-interpretations:psychometric.softSkills.adaptability.name'),
      shortName: t('test-interpretations:psychometric.softSkills.adaptability.shortName'),
      description: t('test-interpretations:psychometric.softSkills.adaptability.description'),
      interpretation: t('test-interpretations:psychometric.softSkills.adaptability.interpretation'),
      tips: t('test-interpretations:psychometric.softSkills.adaptability.tips'),
      icon: Shuffle,
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      gradient: 'from-amber-500/20 to-amber-500/5',
      borderColor: 'border-amber-500/20',
    },
    {
      key: 'initiative',
      name: t('test-interpretations:psychometric.softSkills.initiative.name'),
      shortName: t('test-interpretations:psychometric.softSkills.initiative.shortName'),
      description: t('test-interpretations:psychometric.softSkills.initiative.description'),
      interpretation: t('test-interpretations:psychometric.softSkills.initiative.interpretation'),
      tips: t('test-interpretations:psychometric.softSkills.initiative.tips'),
      icon: Rocket,
      color: 'bg-red-500',
      textColor: 'text-red-500',
      gradient: 'from-red-500/20 to-red-500/5',
      borderColor: 'border-red-500/20',
    },
  ]

  const getLevel = (value: number) => {
    if (value >= 70) return t('tests:results.highLevel')
    if (value >= 40) return t('tests:results.mediumLevel')
    return t('tests:results.lowLevel')
  }

  return (
    <div className="space-y-8">
      {/* Описание теста */}
      <Card className="p-6 bg-gradient-to-br from-card to-secondary/30 border-none shadow-sm">
        <p className="text-muted-foreground leading-relaxed">
          {t('test-interpretations:testDescriptions.softSkills')}
        </p>
      </Card>

      {/* Главный график */}
      <Card className="p-8 border-none shadow-sm bg-gradient-to-br from-card to-primary/5">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-primary" />
          {t('tests:results.yourSoftSkillsProfile')}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {skills.map((skill) => {
            const value = results[skill.key as keyof typeof results]
            const heightPercent = Math.max(value, 5) // Min height for visibility
            const Icon = skill.icon

            return (
              <div key={skill.key} className="flex flex-col items-center group cursor-default">
                {/* Значение над столбиком (появляется при ховере) */}
                <div className="h-8 flex items-end justify-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-lg font-bold">{value}%</span>
                </div>

                {/* Столбик */}
                <div className="w-full flex flex-col items-center justify-end h-64 relative">
                  <div className="w-full h-full bg-secondary/30 rounded-2xl absolute inset-0 -z-10" />
                  
                  <div 
                    className={cn(
                      "w-full rounded-2xl transition-all duration-1000 ease-out flex items-start justify-center pt-4 relative overflow-hidden group-hover:shadow-lg", 
                      skill.gradient
                    )}
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className={cn("absolute inset-0 opacity-20", skill.color)} />
                    <Icon className={cn("w-6 h-6 z-10 transition-transform duration-300 group-hover:scale-110", skill.textColor)} />
                  </div>
                </div>

                {/* Название */}
                <div className="mt-4 text-center">
                  <p className="text-sm font-semibold truncate w-full px-1">{skill.shortName}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Детальное описание - Masonry Layout */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {skills.map((skill) => {
          const value = results[skill.key as keyof typeof results]
          const Icon = skill.icon

          return (
            <Card key={skill.key} className={cn("overflow-hidden border transition-all duration-300 break-inside-avoid mb-4", skill.borderColor)}>
              <div className={cn("h-1.5 w-full", skill.color)} />
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={skill.key} className="border-none">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline group [&>svg]:hidden">
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn("p-2 rounded-lg bg-background shadow-sm", skill.textColor)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-sm line-clamp-1 flex-1 text-left" title={skill.name}>{skill.name}</h4>
                      </div>

                      <div className="flex items-end justify-between mb-2">
                        <span className="text-3xl font-bold">{value}%</span>
                        <span className="text-xs text-muted-foreground mb-1">
                          {getLevel(value)}
                        </span>
                      </div>

                      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                        <div
                          className={cn("h-full transition-all duration-1000 ease-out rounded-full", skill.color)}
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
                      <p className="text-sm font-medium">{skill.description}</p>
                      
                      <div className="grid gap-4 sm:grid-cols-1 text-sm">
                        <div className="bg-secondary/30 p-3 rounded-lg backdrop-blur-sm">
                          <span className="font-semibold block mb-1 text-xs uppercase text-muted-foreground">
                            {t('tests:results.interpretation')}
                          </span>
                          <p className="text-muted-foreground">
                            {skill.interpretation}
                          </p>
                        </div>
                        <div className="bg-secondary/30 p-3 rounded-lg backdrop-blur-sm">
                          <span className="font-semibold block mb-1 text-xs uppercase text-muted-foreground">
                            {t('tests:results.developmentTip')}
                          </span>
                          <p className="text-muted-foreground">
                            {skill.tips}
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
