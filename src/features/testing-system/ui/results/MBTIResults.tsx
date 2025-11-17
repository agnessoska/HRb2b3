import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

interface MBTIResultsProps {
  result: string // например "ENTJ"
  rawScores: Record<string, number>
}

export const MBTIResults = ({ result, rawScores }: MBTIResultsProps) => {
  const { t } = useTranslation('tests')
  const dichotomies = [
    {
      left: { code: 'E', name: t('psychometric.mbti.dichotomies.E.name'), description: t('psychometric.mbti.dichotomies.E.description') },
      right: { code: 'I', name: t('psychometric.mbti.dichotomies.I.name'), description: t('psychometric.mbti.dichotomies.I.description') },
      score: rawScores.EI,
    },
    {
      left: { code: 'S', name: t('psychometric.mbti.dichotomies.S.name'), description: t('psychometric.mbti.dichotomies.S.description') },
      right: { code: 'N', name: t('psychometric.mbti.dichotomies.N.name'), description: t('psychometric.mbti.dichotomies.N.description') },
      score: rawScores.SN,
    },
    {
      left: { code: 'T', name: t('psychometric.mbti.dichotomies.T.name'), description: t('psychometric.mbti.dichotomies.T.description') },
      right: { code: 'F', name: t('psychometric.mbti.dichotomies.F.name'), description: t('psychometric.mbti.dichotomies.F.description') },
      score: rawScores.TF,
    },
    {
      left: { code: 'J', name: t('psychometric.mbti.dichotomies.J.name'), description: t('psychometric.mbti.dichotomies.J.description') },
      right: { code: 'P', name: t('psychometric.mbti.dichotomies.P.name'), description: t('psychometric.mbti.dichotomies.P.description') },
      score: rawScores.JP,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Большая карточка с типом */}
      <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">{t('results.yourPersonalityType')}</p>
          <h1 className="text-6xl font-bold tracking-tight">{result}</h1>
          <p className="text-lg text-muted-foreground">{t(`psychometric.mbti.types.${result}`)}</p>
        </div>
      </Card>

      {/* Дихотомии */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('results.dichotomiesBreakdown')}</h2>

        {dichotomies.map((dich, index) => {
          const leftPercent = dich.score
          const rightPercent = 100 - dich.score
          const dominant = leftPercent >= 50 ? 'left' : 'right'

          return (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                {/* Заголовки */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 text-left">
                    <h3 className={`font-semibold ${dominant === 'left' ? 'text-primary' : 'text-muted-foreground'}`}>
                      {dich.left.code} - {dich.left.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{dich.left.description}</p>
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className={`font-semibold ${dominant === 'right' ? 'text-primary' : 'text-muted-foreground'}`}>
                      {dich.right.code} - {dich.right.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{dich.right.description}</p>
                  </div>
                </div>

                {/* Двойной progress bar */}
                <div className="relative h-12">
                  {/* Центральная линия */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border z-10" />

                  {/* Левая часть */}
                  <div className="absolute left-0 top-0 bottom-0 right-1/2 flex items-center justify-end pr-1">
                    <div className="h-8 bg-secondary rounded-l-full overflow-hidden w-full">
                      <div
                        className={`h-full ${
                          dominant === 'left' ? 'bg-primary' : 'bg-muted'
                        } transition-all duration-500 ml-auto flex items-center justify-start pl-3`}
                        style={{ width: `${leftPercent}%` }}
                      >
                        {leftPercent >= 20 && (
                          <span
                            className={`text-sm font-medium ${
                              dominant === 'left' ? 'text-primary-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {Math.round(leftPercent)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Правая часть */}
                  <div className="absolute right-0 top-0 bottom-0 left-1/2 flex items-center justify-start pl-1">
                    <div className="h-8 bg-secondary rounded-r-full overflow-hidden w-full">
                      <div
                        className={`h-full ${
                          dominant === 'right' ? 'bg-primary' : 'bg-muted'
                        } transition-all duration-500 flex items-center justify-end pr-3`}
                        style={{ width: `${rightPercent}%` }}
                      >
                        {rightPercent >= 20 && (
                          <span
                            className={`text-sm font-medium ${
                              dominant === 'right' ? 'text-primary-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {Math.round(rightPercent)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Описание типа */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">{t('results.typeDescription', { type: result })}</h2>
        <div className="prose prose-sm max-w-none">{t(`psychometric.mbti.descriptions.${result}`)}</div>
      </Card>
    </div>
  )
}
