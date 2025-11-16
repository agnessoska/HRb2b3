import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

interface SoftSkillsResultsProps {
  results: Record<string, number>
}

export const SoftSkillsResults = ({ results }: SoftSkillsResultsProps) => {
  const { t } = useTranslation('tests')
  const skills = [
    {
      key: 'communication',
      name: t('psychometric.softSkills.communication.name'),
      shortName: t('psychometric.softSkills.communication.shortName'),
      icon: '💬',
      color: 'bg-blue-500',
    },
    {
      key: 'teamwork',
      name: t('psychometric.softSkills.teamwork.name'),
      shortName: t('psychometric.softSkills.teamwork.shortName'),
      icon: '👥',
      color: 'bg-green-500',
    },
    {
      key: 'critical_thinking',
      name: t('psychometric.softSkills.criticalThinking.name'),
      shortName: t('psychometric.softSkills.criticalThinking.shortName'),
      icon: '🧠',
      color: 'bg-purple-500',
    },
    {
      key: 'adaptability',
      name: t('psychometric.softSkills.adaptability.name'),
      shortName: t('psychometric.softSkills.adaptability.shortName'),
      icon: '🔄',
      color: 'bg-amber-500',
    },
    {
      key: 'initiative',
      name: t('psychometric.softSkills.initiative.name'),
      shortName: t('psychometric.softSkills.initiative.shortName'),
      icon: '🚀',
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Столбчатая диаграмма */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">{t('results.yourSoftSkillsProfile')}</h3>

        <div className="grid grid-cols-5 gap-3">
          {skills.map((skill) => {
            const value = results[skill.key as keyof typeof results]
            const heightPercent = value

            return (
              <div key={skill.key} className="flex flex-col items-center space-y-2">
                {/* Иконка */}
                <div className="text-3xl">{skill.icon}</div>

                {/* Столбик */}
                <div className="w-full flex flex-col items-center">
                  <div className="text-xl font-bold mb-1">{value}%</div>

                  <div className="w-full h-48 bg-secondary rounded-lg relative overflow-hidden">
                    <div
                      className={`absolute bottom-0 left-0 right-0 ${skill.color} transition-all duration-700`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                </div>

                {/* Название */}
                <p className="text-sm font-medium text-center leading-tight">{skill.shortName}</p>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Детальное описание */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t('results.breakdown')}</h3>

        {skills.map((skill) => {
          const value = results[skill.key as keyof typeof results]

          return (
            <div key={skill.key} className="flex items-center space-x-3 p-3 rounded-lg border">
              <div className="text-2xl">{skill.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{skill.name}</span>
                  <span className="font-bold">{value}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${skill.color} transition-all duration-500`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
