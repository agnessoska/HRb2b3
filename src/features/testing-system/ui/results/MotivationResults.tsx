import { Card } from '@/components/ui/card'

interface MotivationResultsProps {
  results: Record<string, number>
}

export const MotivationResults = ({ results }: MotivationResultsProps) => {
  const drivers = [
    {
      key: 'achievement',
      name: 'Достижение',
      icon: '🎯',
      color: 'bg-emerald-500',
      description: 'Стремление к успеху, результативность',
    },
    {
      key: 'power',
      name: 'Власть',
      icon: '👑',
      color: 'bg-purple-500',
      description: 'Влияние, контроль, лидерство',
    },
    {
      key: 'affiliation',
      name: 'Принадлежность',
      icon: '🤝',
      color: 'bg-blue-500',
      description: 'Социальные связи, принятие',
    },
    {
      key: 'autonomy',
      name: 'Автономность',
      icon: '🦅',
      color: 'bg-amber-500',
      description: 'Независимость, самостоятельность',
    },
    {
      key: 'security',
      name: 'Безопасность',
      icon: '🛡️',
      color: 'bg-cyan-500',
      description: 'Стабильность, предсказуемость',
    },
    {
      key: 'growth',
      name: 'Рост',
      icon: '📈',
      color: 'bg-rose-500',
      description: 'Развитие, обучение, самосовершенствование',
    },
  ]

  const sortedDrivers = [...drivers].sort(
    (a, b) => results[b.key as keyof typeof results] - results[a.key as keyof typeof results]
  )
  const topDrivers = sortedDrivers.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Топ-3 драйвера */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ваши главные драйверы мотивации</h3>
        <div className="grid grid-cols-3 gap-4">
          {topDrivers.map((driver, index) => {
            const value = results[driver.key as keyof typeof results]
            return (
              <div key={driver.key} className="text-center space-y-2">
                <div className="text-4xl">{driver.icon}</div>
                <div className="text-2xl font-bold">{value}%</div>
                <div className="font-medium">{driver.name}</div>
                <div className={`inline-block px-3 py-1 rounded-full text-white text-sm ${driver.color}`}>
                  #{index + 1} приоритет
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Полная диаграмма */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Полный мотивационный профиль</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {drivers.map((driver) => {
            const value = results[driver.key as keyof typeof results]

            return (
              <div key={driver.key} className="flex flex-col items-center space-y-2">
                {/* Иконка */}
                <div className="text-3xl">{driver.icon}</div>

                {/* Столбик */}
                <div className="w-full flex flex-col items-center">
                  <div className="text-xl font-bold mb-1">{value}%</div>

                  <div className="w-full h-40 bg-secondary rounded-lg relative overflow-hidden">
                    <div
                      className={`absolute bottom-0 left-0 right-0 ${driver.color} transition-all duration-700 flex items-end justify-center pb-2`}
                      style={{ height: `${value}%` }}
                    >
                      {value >= 25 && <span className="text-white font-medium text-sm">{value}%</span>}
                    </div>
                  </div>
                </div>

                {/* Название */}
                <p className="text-sm font-medium text-center">{driver.name}</p>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Интерпретации */}
      <div className="grid gap-3 md:grid-cols-2">
        {drivers.map((driver) => {
          const value = results[driver.key as keyof typeof results]

          return (
            <Card key={driver.key} className="p-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl flex-shrink-0">{driver.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{driver.name}</h4>
                    <span className="font-bold text-lg">{value}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{driver.description}</p>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${driver.color} transition-all duration-500`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
