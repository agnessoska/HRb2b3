import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface DISCResultsProps {
  results: Record<string, number>
  dominantStyle: string
}

export const DISCResults = ({ results, dominantStyle }: DISCResultsProps) => {
  const { t } = useTranslation(['tests', 'test-interpretations'])
  const [activeSegment, setActiveSegment] = useState<string | null>(null)

  const styles = [
    {
      code: 'D',
      name: t('test-interpretations:psychometric.disc.D.name'),
      color: 'bg-red-500',
      textColor: 'text-red-500',
      strokeColor: '#ef4444',
      gradient: 'from-red-500/20 to-red-500/5',
      borderColor: 'border-red-500/20',
      description: t('test-interpretations:psychometric.disc.D.description'),
      interpretation: {
        high: t('test-interpretations:psychometric.disc.D.high'),
        low: t('test-interpretations:psychometric.disc.D.low'),
      },
      detailedInterpretation: t('test-interpretations:psychometric.disc.D.interpretation'),
      tips: t('test-interpretations:psychometric.disc.D.tips'),
    },
    {
      code: 'I',
      name: t('test-interpretations:psychometric.disc.I.name'),
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      strokeColor: '#eab308',
      gradient: 'from-yellow-500/20 to-yellow-500/5',
      borderColor: 'border-yellow-500/20',
      description: t('test-interpretations:psychometric.disc.I.description'),
      interpretation: {
        high: t('test-interpretations:psychometric.disc.I.high'),
        low: t('test-interpretations:psychometric.disc.I.low'),
      },
      detailedInterpretation: t('test-interpretations:psychometric.disc.I.interpretation'),
      tips: t('test-interpretations:psychometric.disc.I.tips'),
    },
    {
      code: 'S',
      name: t('test-interpretations:psychometric.disc.S.name'),
      color: 'bg-green-500',
      textColor: 'text-green-500',
      strokeColor: '#22c55e',
      gradient: 'from-green-500/20 to-green-500/5',
      borderColor: 'border-green-500/20',
      description: t('test-interpretations:psychometric.disc.S.description'),
      interpretation: {
        high: t('test-interpretations:psychometric.disc.S.high'),
        low: t('test-interpretations:psychometric.disc.S.low'),
      },
      detailedInterpretation: t('test-interpretations:psychometric.disc.S.interpretation'),
      tips: t('test-interpretations:psychometric.disc.S.tips'),
    },
    {
      code: 'C',
      name: t('test-interpretations:psychometric.disc.C.name'),
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      strokeColor: '#3b82f6',
      gradient: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/20',
      description: t('test-interpretations:psychometric.disc.C.description'),
      interpretation: {
        high: t('test-interpretations:psychometric.disc.C.high'),
        low: t('test-interpretations:psychometric.disc.C.low'),
      },
      detailedInterpretation: t('test-interpretations:psychometric.disc.C.interpretation'),
      tips: t('test-interpretations:psychometric.disc.C.tips'),
    },
  ]

  // Calculate percentages for donut
  const total = Object.values(results).reduce((sum, val) => sum + val, 0)
  
  // Calculate segments for SVG
  const calculateSegments = () => {
    let cumulativePercent = 0
    return styles.map(style => {
      const value = results[style.code as keyof typeof results]
      const percent = value / total
      
      // Calculate coordinates
      const startAngle = cumulativePercent * 360
      const endAngle = (cumulativePercent + percent) * 360
      
      // Convert to radians
      const startRad = (startAngle - 90) * Math.PI / 180
      const endRad = (endAngle - 90) * Math.PI / 180
      
      // Radius
      const r = 40
      const cx = 50
      const cy = 50
      
      // Calculate path points
      const x1 = cx + r * Math.cos(startRad)
      const y1 = cy + r * Math.sin(startRad)
      const x2 = cx + r * Math.cos(endRad)
      const y2 = cy + r * Math.sin(endRad)
      
      // Determine large arc flag
      const largeArcFlag = percent > 0.5 ? 1 : 0
      
      // Create SVG path command
      const pathData = [
        `M ${cx} ${cy}`,
        `L ${x1} ${y1}`,
        `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
      
      cumulativePercent += percent
      
      return {
        ...style,
        pathData,
        value,
        percent
      }
    })
  }

  const segments = calculateSegments()

  return (
    <div className="space-y-8">
      {/* Описание теста */}
      <Card className="p-6 bg-gradient-to-br from-card to-secondary/30 border-none shadow-sm">
        <p className="text-muted-foreground leading-relaxed">
          {t('test-interpretations:testDescriptions.disc')}
        </p>
      </Card>

      {/* Доминирующий стиль и Диаграмма */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-transparent border-none shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          
          <div className="relative z-10">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">{t('tests:results.yourDominantStyle')}</p>
            
            <div className="w-32 h-32 rounded-full flex items-center justify-center text-6xl font-black bg-background shadow-lg mb-6 mx-auto border-4 border-muted/20">
              <span className={styles.find((s) => s.code === dominantStyle)?.textColor}>
                {dominantStyle}
              </span>
            </div>

            <h2 className="text-3xl font-bold mb-2">{styles.find((s) => s.code === dominantStyle)?.name}</h2>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto">{styles.find((s) => s.code === dominantStyle)?.description}</p>
          </div>
        </Card>

        {/* Интерактивный Pie Chart */}
        <Card className="p-8 flex items-center justify-center border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              {segments.map((segment) => (
                <g key={segment.code}>
                  <path
                    d={segment.pathData}
                    fill={segment.strokeColor}
                    className={cn(
                      "transition-all duration-300 origin-center cursor-pointer",
                      activeSegment === segment.code ? "scale-110 opacity-100" : "hover:scale-105 opacity-90 hover:opacity-100"
                    )}
                    onMouseEnter={() => setActiveSegment(segment.code)}
                    onMouseLeave={() => setActiveSegment(null)}
                    onClick={() => setActiveSegment(activeSegment === segment.code ? null : segment.code)}
                  />
                </g>
              ))}
              {/* Белый центр для эффекта Donut */}
              <circle cx="50" cy="50" r="25" fill="currentColor" className="text-card pointer-events-none" />
            </svg>
            
            {/* Легенда или активный сегмент в центре */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeSegment ? (
                <div className="text-center animate-in fade-in zoom-in duration-200">
                  <span className={cn("text-4xl font-bold", styles.find(s => s.code === activeSegment)?.textColor)}>
                    {activeSegment}
                  </span>
                  <span className="text-xs font-medium block text-muted-foreground">
                    {Math.round(results[activeSegment as keyof typeof results])}%
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold tracking-tight text-muted-foreground/50">DISC</span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Детальная разбивка - Masonry Layout */}
      <div className="columns-1 md:columns-2 lg:columns-4 gap-4 space-y-4">
        {styles.map((style) => {
          const value = results[style.code as keyof typeof results]
          const isHigh = value >= 60
          const isActive = activeSegment === style.code

          return (
            <Card 
              key={style.code} 
              className={cn(
                "overflow-hidden border transition-all duration-300 break-inside-avoid mb-4", 
                style.borderColor,
                isActive ? "ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.02]" : "hover:shadow-md"
              )}
              onMouseEnter={() => setActiveSegment(style.code)}
              onMouseLeave={() => setActiveSegment(null)}
            >
              <div className={cn("h-2 w-full", style.color)} />
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={style.code} className="border-none">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline group [&>svg]:hidden">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-sm", style.color)}>
                          {style.code}
                        </div>
                        <span className="text-2xl font-bold">{value}%</span>
                      </div>
                      
                      <h4 className="font-semibold text-lg mb-2 text-left">{style.name}</h4>
                      
                      <div className="space-y-2 mb-4">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn("h-full transition-all duration-500", style.color)}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed text-left line-clamp-2">
                        {isHigh ? style.interpretation.high : style.interpretation.low}
                      </p>
                      
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
                            {style.detailedInterpretation}
                          </p>
                        </div>
                        <div className="bg-secondary/30 p-3 rounded-lg backdrop-blur-sm">
                          <span className="font-semibold block mb-1 text-xs uppercase text-muted-foreground">
                            {t('tests:results.developmentTip')}
                          </span>
                          <p className="text-muted-foreground">
                            {style.tips}
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
