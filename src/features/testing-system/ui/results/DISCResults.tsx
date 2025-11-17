import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

interface DISCResultsProps {
  results: Record<string, number>
  dominantStyle: string
}

export const DISCResults = ({ results, dominantStyle }: DISCResultsProps) => {
  const { t } = useTranslation('tests')
  const styles = [
    {
      code: 'D',
      name: t('psychometric.disc.D.name'),
      color: 'bg-red-500',
      description: t('psychometric.disc.D.description'),
      interpretation: {
        high: t('psychometric.disc.D.high'),
        low: t('psychometric.disc.D.low'),
      },
    },
    {
      code: 'I',
      name: t('psychometric.disc.I.name'),
      color: 'bg-yellow-500',
      description: t('psychometric.disc.I.description'),
      interpretation: {
        high: t('psychometric.disc.I.high'),
        low: t('psychometric.disc.I.low'),
      },
    },
    {
      code: 'S',
      name: t('psychometric.disc.S.name'),
      color: 'bg-green-500',
      description: t('psychometric.disc.S.description'),
      interpretation: {
        high: t('psychometric.disc.S.high'),
        low: t('psychometric.disc.S.low'),
      },
    },
    {
      code: 'C',
      name: t('psychometric.disc.C.name'),
      color: 'bg-blue-500',
      description: t('psychometric.disc.C.description'),
      interpretation: {
        high: t('psychometric.disc.C.high'),
        low: t('psychometric.disc.C.low'),
      },
    },
  ]

  return (
    <div className="space-y-8">
      {/* Доминирующий стиль */}
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">{t('results.yourDominantStyle')}</p>
        <h2 className="text-3xl font-bold">{styles.find((s) => s.code === dominantStyle)?.name}</h2>
        <p className="text-muted-foreground mt-2">{styles.find((s) => s.code === dominantStyle)?.description}</p>
      </Card>

      {/* Столбчатая диаграмма */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">{t('results.yourDISCProfile')}</h3>

        <div className="grid grid-cols-4 gap-4">
          {styles.map((style) => {
            const value = results[style.code as keyof typeof results]
            const heightPercent = (value / 100) * 100

            return (
              <div key={style.code} className="flex flex-col items-center space-y-3">
                {/* Столбик */}
                <div className="w-full flex flex-col items-center">
                  <div className="text-2xl font-bold mb-2">{value}%</div>

                  <div className="w-full h-64 bg-secondary rounded-lg relative overflow-hidden">
                    <div
                      className={`absolute bottom-0 left-0 right-0 ${style.color} transition-all duration-700 flex items-end justify-center pb-2`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {value >= 20 && (
                        <span className="text-white font-medium text-lg">{value}%</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Название */}
                <div className="text-center">
                  <div
                    className={`w-12 h-12 rounded-full ${style.color} text-white flex items-center justify-center text-2xl font-bold mx-auto mb-2`}
                  >
                    {style.code}
                  </div>
                  <p className="font-semibold">{style.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Интерпретации */}
      <div className="grid gap-4 md:grid-cols-2">
        {styles.map((style) => {
          const value = results[style.code as keyof typeof results]
          const isHigh = value >= 60

          return (
            <Card key={style.code} className="p-4">
              <div className="flex items-start space-x-3">
                <div
                  className={`w-10 h-10 rounded-full ${style.color} text-white flex items-center justify-center font-bold flex-shrink-0`}
                >
                  {style.code}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{style.name}</h4>
                  <p className="text-sm text-muted-foreground">{isHigh ? style.interpretation.high : style.interpretation.low}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
