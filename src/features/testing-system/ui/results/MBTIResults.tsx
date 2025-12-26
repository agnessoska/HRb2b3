import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Sparkles, Brain, Zap, Users, Heart, Lightbulb, Target, Shield, BookOpen, ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface MBTIResultsProps {
  result: string // например "ENTJ"
  rawScores: Record<string, number>
}

export const MBTIResults = ({ result, rawScores }: MBTIResultsProps) => {
  const { t } = useTranslation(['tests', 'test-interpretations'])
  
  // Определяем иконку и цвет для типа
  const getTypeConfig = (type: string) => {
    // Аналитики (NT)
    if (type.includes('NT')) return { 
      icon: Brain, 
      color: 'bg-purple-500', 
      lightColor: 'bg-purple-500/10',
      textColor: 'text-purple-600',
      gradient: 'from-purple-500/20 to-purple-500/5'
    }
    // Дипломаты (NF)
    if (type.includes('NF')) return { 
      icon: Heart, 
      color: 'bg-green-500', 
      lightColor: 'bg-green-500/10',
      textColor: 'text-green-600',
      gradient: 'from-green-500/20 to-green-500/5'
    }
    // Хранители (SJ)
    if (type.includes('SJ')) return { 
      icon: Shield, 
      color: 'bg-blue-500', 
      lightColor: 'bg-blue-500/10',
      textColor: 'text-blue-600',
      gradient: 'from-blue-500/20 to-blue-500/5'
    }
    // Искатели (SP)
    if (type.includes('SP')) return { 
      icon: Zap, 
      color: 'bg-yellow-500', 
      lightColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-600',
      gradient: 'from-yellow-500/20 to-yellow-500/5'
    }
    return { 
      icon: Sparkles, 
      color: 'bg-gray-500', 
      lightColor: 'bg-gray-500/10',
      textColor: 'text-gray-600',
      gradient: 'from-gray-500/20 to-gray-500/5'
    }
  }

  const config = getTypeConfig(result)
  const TypeIcon = config.icon

  const dichotomies = [
    {
      left: { code: 'E', name: t('test-interpretations:psychometric.mbti.dichotomies.E.name'), description: t('test-interpretations:psychometric.mbti.dichotomies.E.description'), icon: Users },
      right: { code: 'I', name: t('test-interpretations:psychometric.mbti.dichotomies.I.name'), description: t('test-interpretations:psychometric.mbti.dichotomies.I.description'), icon: Lightbulb },
      score: rawScores.EI,
      key: 'E',
    },
    {
      left: { code: 'S', name: t('test-interpretations:psychometric.mbti.dichotomies.S.name'), description: t('test-interpretations:psychometric.mbti.dichotomies.S.description'), icon: BookOpen },
      right: { code: 'N', name: t('test-interpretations:psychometric.mbti.dichotomies.N.name'), description: t('test-interpretations:psychometric.mbti.dichotomies.N.description'), icon: Sparkles },
      score: rawScores.SN,
      key: 'S',
    },
    {
      left: { code: 'T', name: t('test-interpretations:psychometric.mbti.dichotomies.T.name'), description: t('test-interpretations:psychometric.mbti.dichotomies.T.description'), icon: Brain },
      right: { code: 'F', name: t('test-interpretations:psychometric.mbti.dichotomies.F.name'), description: t('test-interpretations:psychometric.mbti.dichotomies.F.description'), icon: Heart },
      score: rawScores.TF,
      key: 'T',
    },
    {
      left: { code: 'J', name: t('test-interpretations:psychometric.mbti.dichotomies.J.name'), description: t('test-interpretations:psychometric.mbti.dichotomies.J.description'), icon: Target },
      right: { code: 'P', name: t('test-interpretations:psychometric.mbti.dichotomies.P.name'), description: t('test-interpretations:psychometric.mbti.dichotomies.P.description'), icon: Zap },
      score: rawScores.JP,
      key: 'J',
    },
  ]

  // Получаем теги из локализации (если есть) или генерируем дефолтные
  const tags = t(`test-interpretations:psychometric.mbti.tags.${result}`, { returnObjects: true }) as string[] || []

  return (
    <div className="space-y-8">
      {/* Описание теста */}
      <Card className="p-6 bg-gradient-to-br from-card to-secondary/30 border-none shadow-sm">
        <p className="text-muted-foreground leading-relaxed">
          {t('test-interpretations:testDescriptions.mbti')}
        </p>
      </Card>

      {/* Hero Card */}
      <Card className={cn("overflow-hidden border-none shadow-lg bg-gradient-to-br", config.gradient)}>
        <div className="p-8 md:p-12 text-center relative">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
            <TypeIcon className="w-96 h-96 absolute -top-20 -left-20" />
            <TypeIcon className="w-96 h-96 absolute -bottom-20 -right-20" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-md backdrop-blur-sm", config.color)}>
              <TypeIcon className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 break-words">
              {result}
            </h1>
            <h2 className="text-xl md:text-3xl font-bold text-muted-foreground mb-6 break-words">
              {t(`test-interpretations:psychometric.mbti.types.${result}`)}
            </h2>

            {tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl">
                {tags.map((tag, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="px-4 py-1.5 text-sm font-medium bg-background/50 backdrop-blur-sm border-none shadow-sm"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-lg leading-relaxed max-w-3xl text-muted-foreground">
              {t(`test-interpretations:psychometric.mbti.descriptions.${result}`)}
            </p>
          </div>
        </div>
      </Card>

      {/* Дихотомии - Masonry Layout */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold px-1">{t('tests:results.dichotomiesBreakdown')}</h3>
        <div className="columns-1 md:columns-2 gap-4 space-y-4">
          {dichotomies.map((dich, index) => {
            const leftPercent = dich.score
            const rightPercent = 100 - dich.score
            const dominant = leftPercent >= 50 ? 'left' : 'right'
            const dominantCode = dominant === 'left' ? dich.left.code : dich.right.code
            const LeftIcon = dich.left.icon
            const RightIcon = dich.right.icon

            return (
              <Card key={index} className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm break-inside-avoid mb-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline group [&>svg]:hidden">
                      <div className="w-full">
                        <div className="flex justify-between items-end mb-4">
                          <div className={cn("flex items-center gap-2", dominant === 'left' ? "opacity-100" : "opacity-50")}>
                            <div className={cn("p-2 rounded-lg bg-background shadow-sm", dominant === 'left' ? config.textColor : "text-muted-foreground")}>
                              <LeftIcon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-lg">{dich.left.code}</div>
                              <div className="text-xs text-muted-foreground font-medium">{dich.left.name}</div>
                            </div>
                          </div>

                          <div className={cn("flex items-center gap-2 flex-row-reverse text-right", dominant === 'right' ? "opacity-100" : "opacity-50")}>
                            <div className={cn("p-2 rounded-lg bg-background shadow-sm", dominant === 'right' ? config.textColor : "text-muted-foreground")}>
                              <RightIcon className="w-5 h-5" />
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{dich.right.code}</div>
                              <div className="text-xs text-muted-foreground font-medium">{dich.right.name}</div>
                            </div>
                          </div>
                        </div>

                        <div className="relative h-4 bg-secondary/50 rounded-full overflow-hidden mb-2">
                          {/* Маркер центра */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-background z-10" />
                          
                          {/* Левый бар */}
                          <div 
                            className={cn("absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out rounded-l-full", 
                              dominant === 'left' ? config.color : "bg-muted-foreground/20"
                            )}
                            style={{ width: `${leftPercent}%` }}
                          />
                          
                          {/* Правый бар */}
                          <div 
                            className={cn("absolute right-0 top-0 bottom-0 transition-all duration-1000 ease-out rounded-r-full", 
                              dominant === 'right' ? config.color : "bg-muted-foreground/20"
                            )}
                            style={{ width: `${rightPercent}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-sm font-medium mb-2">
                          <span className={dominant === 'left' ? config.textColor : "text-muted-foreground"}>
                            {Math.round(leftPercent)}%
                          </span>
                          <span className={dominant === 'right' ? config.textColor : "text-muted-foreground"}>
                            {Math.round(rightPercent)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-center">
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
                              {t(`test-interpretations:psychometric.mbti.dichotomies.${dominantCode}.interpretation`)}
                            </p>
                          </div>
                          <div className="bg-white/40 p-3 rounded-lg backdrop-blur-sm">
                            <span className="font-semibold block mb-1 text-xs uppercase text-muted-foreground">
                              {t('tests:results.developmentTip')}
                            </span>
                            <p className="text-muted-foreground">
                              {t(`test-interpretations:psychometric.mbti.recommendations.${dominantCode}`)}
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
