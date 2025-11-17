import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

interface BigFiveResultsProps {
  results: Record<string, number>
}

export const BigFiveResults = ({ results }: BigFiveResultsProps) => {
  const { t } = useTranslation('tests')
  const scales = [
    {
      key: 'openness',
      name: t('psychometric.bigFive.openness.name'),
      description: t('psychometric.bigFive.openness.description'),
      value: results.openness,
      type: 'higher_is_better',
    },
    {
      key: 'conscientiousness',
      name: t('psychometric.bigFive.conscientiousness.name'),
      description: t('psychometric.bigFive.conscientiousness.description'),
      value: results.conscientiousness,
      type: 'higher_is_better',
    },
    {
      key: 'extraversion',
      name: t('psychometric.bigFive.extraversion.name'),
      description: t('psychometric.bigFive.extraversion.description'),
      value: results.extraversion,
      type: 'optimal',
      optimalValue: 50,
    },
    {
      key: 'agreeableness',
      name: t('psychometric.bigFive.agreeableness.name'),
      description: t('psychometric.bigFive.agreeableness.description'),
      value: results.agreeableness,
      type: 'optimal',
      optimalValue: 65,
    },
    {
      key: 'neuroticism',
      name: t('psychometric.bigFive.neuroticism.name'),
      description: t('psychometric.bigFive.neuroticism.description'),
      value: results.neuroticism,
      type: 'lower_is_better',
    },
  ]

  const getColor = (scale: (typeof scales)[0]) => {
    if (scale.type === 'higher_is_better') {
      if (scale.value >= 67) return 'bg-emerald-500'
      if (scale.value >= 34) return 'bg-amber-500'
      return 'bg-blue-500'
    }

    if (scale.type === 'lower_is_better') {
      if (scale.value <= 33) return 'bg-emerald-500'
      if (scale.value <= 66) return 'bg-amber-500'
      return 'bg-blue-500'
    }

    // optimal
    if (scale.type === 'optimal' && scale.optimalValue) {
      const diff = Math.abs(scale.value - scale.optimalValue)
      if (diff <= 10) return 'bg-emerald-500'
      if (diff <= 20) return 'bg-amber-500'
    }
    return 'bg-blue-500'
  }

  const getInterpretation = (scale: (typeof scales)[0]) => {
    if (scale.key === 'openness') {
      if (scale.value >= 67) return t('psychometric.bigFive.openness.high')
      if (scale.value >= 34) return t('psychometric.bigFive.openness.medium')
      return t('psychometric.bigFive.openness.low')
    }
    if (scale.key === 'conscientiousness') {
      if (scale.value >= 67) return t('psychometric.bigFive.conscientiousness.high')
      if (scale.value >= 34) return t('psychometric.bigFive.conscientiousness.medium')
      return t('psychometric.bigFive.conscientiousness.low')
    }
    if (scale.key === 'extraversion') {
      if (scale.value >= 67) return t('psychometric.bigFive.extraversion.high')
      if (scale.value >= 34) return t('psychometric.bigFive.extraversion.medium')
      return t('psychometric.bigFive.extraversion.low')
    }
    if (scale.key === 'agreeableness') {
      if (scale.value >= 71) return t('psychometric.bigFive.agreeableness.high')
      if (scale.value >= 31) return t('psychometric.bigFive.agreeableness.medium')
      return t('psychometric.bigFive.agreeableness.low')
    }
    if (scale.key === 'neuroticism') {
      if (scale.value >= 71) return t('psychometric.bigFive.neuroticism.high')
      if (scale.value >= 31) return t('psychometric.bigFive.neuroticism.medium')
      return t('psychometric.bigFive.neuroticism.low')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{t('results.yourResults')}</h2>

      <div className="space-y-4">
        {scales.map((scale) => (
          <Card key={scale.key} className="p-4">
            <div className="space-y-3">
              {/* Заголовок шкалы */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{scale.name}</h3>
                  <p className="text-sm text-muted-foreground">{scale.description}</p>
                </div>
                <div className="text-2xl font-bold ml-4">{scale.value}%</div>
              </div>

              {/* Progress bar */}
              <div className="relative">
                <div className="h-8 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getColor(scale)} transition-all duration-500 flex items-center justify-end pr-3`}
                    style={{ width: `${scale.value}%` }}
                  >
                    <span className="text-white text-sm font-medium">{scale.value}%</span>
                  </div>
                </div>

                {/* Маркер оптимума (если есть) */}
                {scale.type === 'optimal' && scale.optimalValue && (
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-border"
                    style={{ left: `${scale.optimalValue}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                      {t('results.optimal')}
                    </div>
                  </div>
                )}
              </div>

              {/* Интерпретация */}
              <p className="text-sm">{getInterpretation(scale)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
