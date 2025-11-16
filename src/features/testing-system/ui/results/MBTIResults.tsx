import { Card } from '@/components/ui/card'

interface MBTIResultsProps {
  result: string // например "ENTJ"
  rawScores: Record<string, number>
}

// Mock functions, replace with real data/logic
const getTypeName = (type: string) => {
  const names: Record<string, string> = {
    ENTJ: 'Командир',
    INTJ: 'Стратег',
    ENTP: 'Полемист',
    INTP: 'Ученый',
    ENFJ: 'Тренер',
    INFJ: 'Активист',
    ENFP: 'Борец',
    INFP: 'Посредник',
    ESTJ: 'Менеджер',
    ISTJ: 'Администратор',
    ESFJ: 'Консул',
    ISFJ: 'Защитник',
    ESTP: 'Делец',
    ISTP: 'Виртуоз',
    ESFP: 'Развлекатель',
    ISFP: 'Артист',
  }
  return names[type] || 'Неизвестный тип'
}

const getTypeDescription = (type: string) => {
  // Replace with real, detailed descriptions
  return `Описание для типа ${type} будет добавлено позже. Это энергичные и решительные лидеры, которые любят брать на себя ответственность и решать сложные задачи.`
}

export const MBTIResults = ({ result, rawScores }: MBTIResultsProps) => {
  const dichotomies = [
    {
      left: { code: 'E', name: 'Экстраверсия', description: 'Энергия из внешнего мира' },
      right: { code: 'I', name: 'Интроверсия', description: 'Энергия изнутри' },
      score: rawScores.EI,
    },
    {
      left: { code: 'S', name: 'Сенсорика', description: 'Конкретность, факты' },
      right: { code: 'N', name: 'Интуиция', description: 'Абстракция, концепции' },
      score: rawScores.SN,
    },
    {
      left: { code: 'T', name: 'Мышление', description: 'Логика, объективность' },
      right: { code: 'F', name: 'Чувство', description: 'Эмоции, субъективность' },
      score: rawScores.TF,
    },
    {
      left: { code: 'J', name: 'Суждение', description: 'Планирование, структура' },
      right: { code: 'P', name: 'Восприятие', description: 'Гибкость, спонтанность' },
      score: rawScores.JP,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Большая карточка с типом */}
      <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Ваш тип личности</p>
          <h1 className="text-6xl font-bold tracking-tight">{result}</h1>
          <p className="text-lg text-muted-foreground">{getTypeName(result)}</p>
        </div>
      </Card>

      {/* Дихотомии */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Детализация по дихотомиям</h2>

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
        <h2 className="text-xl font-semibold mb-4">Описание типа {result}</h2>
        <div className="prose prose-sm max-w-none">{getTypeDescription(result)}</div>
      </Card>
    </div>
  )
}
