import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

interface EQResultsProps {
  results: Record<string, number>
}

export const EQResults = ({ results }: EQResultsProps) => {
  const { t } = useTranslation('tests')
  const competencies = [
    {
      key: 'self_awareness',
      name: t('psychometric.eq.selfAwareness.name'),
      description: t('psychometric.eq.selfAwareness.description'),
      icon: '🧠',
    },
    {
      key: 'self_management',
      name: t('psychometric.eq.selfManagement.name'),
      description: t('psychometric.eq.selfManagement.description'),
      icon: '⚖️',
    },
    {
      key: 'social_awareness',
      name: t('psychometric.eq.socialAwareness.name'),
      description: t('psychometric.eq.socialAwareness.description'),
      icon: '👥',
    },
    {
      key: 'relationship_management',
      name: t('psychometric.eq.relationshipManagement.name'),
      description: t('psychometric.eq.relationshipManagement.description'),
      icon: '🤝',
    },
  ]

  const getColor = (value: number) => {
    if (value >= 75) return 'bg-emerald-500 text-emerald-500'
    if (value >= 50) return 'bg-amber-500 text-amber-500'
    return 'bg-blue-500 text-blue-500'
  }

  const getLevel = (value: number) => {
    if (value >= 75) return t('results.levelHigh')
    if (value >= 50) return t('results.levelMedium')
    return t('results.levelNeedsDevelopment')
  }

  const averageEQ = Math.round(Object.values(results).reduce((sum, val) => sum + val, 0) / 4)

  return (
    <div className="space-y-8">
      {/* Общий уровень EQ */}
      <Card className="p-8">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            {t('results.yourOverallEQLevel')}
          </p>
          <div className="relative inline-block">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-secondary"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(averageEQ / 100) * 439.6} 439.6`}
                className={getColor(averageEQ).replace('bg-', 'text-')}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold">{averageEQ}%</div>
                <div className="text-sm text-muted-foreground">{getLevel(averageEQ)}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Детализация по компетенциям */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('results.competenciesBreakdown')}</h2>

        {competencies.map((comp) => {
          const value = results[comp.key as keyof typeof results]

          return (
            <Card key={comp.key} className="p-4">
              <div className="space-y-3">
                {/* Заголовок */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-3xl">{comp.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{comp.name}</h3>
                      <p className="text-sm text-muted-foreground">{comp.description}</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold ml-4">{value}%</div>
                </div>

                {/* Progress bar */}
                <div className="h-8 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getColor(value)} transition-all duration-500 flex items-center justify-end pr-3`}
                    style={{ width: `${value}%` }}
                  >
                    <span className="text-white text-sm font-medium">{value}%</span>
                  </div>
                </div>

                {/* Уровень */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{getLevel(value)}</span>
                  <span className="text-xs text-muted-foreground">
                    {value >= 75 && t('results.excellentlyDeveloped')}
                    {value >= 50 && value < 75 && t('results.potentialForGrowth')}
                    {value < 50 && t('results.recommendedDevelopment')}
                  </span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
