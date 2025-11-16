# ТЗ: Воронка найма и Real-time чат - Production Ready

**Дата создания:** 16 ноября 2025  
**Версия:** 1.0  
**Языки:** Русский (ru), Казахский (kk), Английский (en)

---

## 📋 СОДЕРЖАНИЕ

1. [Обзор функционала](#1-обзор-функционала)
2. [Воронка найма (Kanban)](#2-воронка-найма-kanban)
3. [Real-time чат](#3-real-time-чат)
4. [База данных и Realtime](#4-база-данных-и-realtime)
5. [Интеграция и навигация](#5-интеграция-и-навигация)
6. [Переводы (i18n)](#6-переводы-i18n)
7. [Производительность](#7-производительность)
8. [Чеклист реализации](#8-чеклист-реализации)

---

## 1. ОБЗОР ФУНКЦИОНАЛА

### 1.1 Цели

**Воронка найма:**
- Визуальное управление процессом подбора
- Drag & Drop для перемещения кандидатов между этапами
- Быстрый доступ к профилям и действиям
- Статистика по каждому этапу

**Real-time чат:**
- Мгновенная коммуникация HR ↔ Кандидат
- Уведомления о новых сообщениях
- Отметки о прочтении
- История переписки

### 1.2 Основные сценарии использования

**Сценарий 1: HR управляет процессом найма**
1. HR открывает воронку вакансии
2. Видит всех кандидатов по этапам
3. Перетаскивает кандидата на следующий этап
4. Открывает профиль кандидата
5. Отправляет сообщение в чат

**Сценарий 2: Кандидат получает обратную связь**
1. Кандидат получает уведомление о новом сообщении
2. Открывает чат с HR
3. Читает сообщение (приглашение на интервью)
4. Отвечает и подтверждает время

**Сценарий 3: HR отклоняет кандидата**
1. HR перетаскивает кандидата в "Отклонён"
2. Система предлагает отправить письмо-отказ
3. HR генерирует и отправляет вежливый отказ
4. Кандидат получает уведомление

---

## 2. ВОРОНКА НАЙМА (KANBAN)

### 2.1 URL и навигация

**URL:** `/hr/vacancy/:vacancyId/funnel`

**Точки входа:**
- Кнопка "К воронке" на карточке вакансии (дашборд)
- Ссылка из профиля кандидата
- Прямая навигация из меню вакансии

### 2.2 Общий Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│  Header                                                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [← Назад] Senior Frontend Developer                              │  │
│  │                                                   [+ Добавить]    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│  Статистика (опционально)                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Всего: 24  |  Новые: 8  |  В работе: 12  |  Наняты: 2          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│  Kanban Board (horizontal scroll)                                      │
│  ┌────────┬────────┬────────┬────────┬────────┬────────┬────────┐     │
│  │Приглш. │Тестир. │Оценён  │Интервью│Оффер   │Нанят   │Отклонён│     │
│  │   (8)  │  (5)   │  (4)   │  (3)   │  (2)   │  (2)   │  (10)  │     │
│  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤     │
│  │[Card 1]│[Card 1]│[Card 1]│[Card 1]│[Card 1]│[Card 1]│[Card 1]│     │
│  │[Card 2]│[Card 2]│[Card 2]│[Card 2]│        │[Card 2]│[Card 2]│     │
│  │[Card 3]│[Card 3]│[Card 3]│        │        │        │[Card 3]│     │
│  │[Card 4]│[Card 4]│        │        │        │        │...     │     │
│  │[Card 5]│        │        │        │        │        │        │     │
│  │...     │        │        │        │        │        │        │     │
│  └────────┴────────┴────────┴────────┴────────┴────────┴────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Статусы воронки

| Код | Название (ru) | Название (kk) | Название (en) | Описание | Цвет |
|-----|---------------|---------------|---------------|----------|------|
| `invited` | Приглашён | Шақырылған | Invited | Кандидат добавлен в воронку | `bg-gray-100` |
| `testing` | Проходит тесты | Тесттен өтуде | Testing | Кандидат проходит психометрические тесты | `bg-blue-100` |
| `evaluated` | Оценён | Бағаланған | Evaluated | Тесты завершены, результаты доступны | `bg-purple-100` |
| `interview` | На интервью | Сұхбатта | Interview | Приглашён на собеседование | `bg-amber-100` |
| `offer` | Оффер | Ұсыныс | Offer | Отправлено предложение о работе | `bg-emerald-100` |
| `hired` | Нанят | Жұмысқа алынды | Hired | Успешно нанят | `bg-green-200` |
| `rejected` | Отклонён | Қабылданбады | Rejected | Отклонён на любом этапе | `bg-red-100` |

**Правила переходов:**
- ✅ Можно перемещать между любыми статусами (гибкость процесса)
- ✅ Специальная обработка для "Отклонён" (предложение отправить письмо)
- ✅ Специальная обработка для "Оффер" (предложение сгенерировать оффер)
- ✅ Нельзя удалить кандидата из воронки (только перевести в "Отклонён")

### 2.4 Компонент Kanban Board

**Технологии:**
- `@dnd-kit/core` - для Drag & Drop
- `@dnd-kit/sortable` - для сортировки внутри колонок
- `@dnd-kit/modifiers` - для ограничений перетаскивания

**Структура компонента:**

```tsx
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { CandidateCard } from './CandidateCard'
import { KanbanColumn } from './KanbanColumn'

interface VacancyFunnelProps {
  vacancyId: string
}

export const VacancyFunnel = ({ vacancyId }: VacancyFunnelProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // Получаем вакансию
  const { data: vacancy } = useQuery({
    queryKey: ['vacancy', vacancyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('vacancies')
        .select('id, title, funnel_counts')
        .eq('id', vacancyId)
        .single()
      return data
    }
  })
  
  // Получаем кандидатов в воронке
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', vacancyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          updated_at,
          compatibility_score,
          candidate:candidates(
            id,
            full_name,
            category:professional_categories(name_ru, name_kk, name_en),
            tests_completed,
            tests_last_updated_at
          )
        `)
        .eq('vacancy_id', vacancyId)
        .order('updated_at', { ascending: false })
      
      return data || []
    }
  })
  
  // Группируем по статусам
  const groupedByStatus = useMemo(() => {
    const groups: Record<string, any[]> = {
      invited: [],
      testing: [],
      evaluated: [],
      interview: [],
      offer: [],
      hired: [],
      rejected: []
    }
    
    applications?.forEach(app => {
      if (groups[app.status]) {
        groups[app.status].push(app)
      }
    })
    
    return groups
  }, [applications])
  
  // Статусы для колонок
  const statuses = [
    { id: 'invited', label: t('funnel.status.invited') },
    { id: 'testing', label: t('funnel.status.testing') },
    { id: 'evaluated', label: t('funnel.status.evaluated') },
    { id: 'interview', label: t('funnel.status.interview') },
    { id: 'offer', label: t('funnel.status.offer') },
    { id: 'hired', label: t('funnel.status.hired') },
    { id: 'rejected', label: t('funnel.status.rejected') }
  ]
  
  // Настройка сенсоров для DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8 // Минимальное расстояние для начала драга
      }
    })
  )
  
  // Мутация для обновления статуса
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      applicationId, 
      newStatus 
    }: { 
      applicationId: string
      newStatus: string 
    }) => {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', vacancyId] })
      queryClient.invalidateQueries({ queryKey: ['vacancy', vacancyId] })
    }
  })
  
  // Обработчики Drag & Drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }
  
  const handleDragOver = (event: DragOverEvent) => {
    // Можно добавить визуальную обратную связь
  }
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    
    if (!over) return
    
    const applicationId = active.id as string
    const newStatus = over.id as string
    
    // Находим application
    const application = applications?.find(app => app.id === applicationId)
    
    if (!application) return
    
    // Если статус не изменился - выходим
    if (application.status === newStatus) return
    
    // Специальная обработка для определённых статусов
    if (newStatus === 'rejected') {
      // Показываем диалог с предложением отправить письмо-отказ
      const shouldSendRejection = await showRejectionDialog(application)
      
      if (shouldSendRejection === null) {
        // Пользователь отменил
        return
      }
      
      // Обновляем статус
      await updateStatusMutation.mutateAsync({ applicationId, newStatus })
      
      if (shouldSendRejection) {
        // Открываем диалог генерации письма-отказа
        openGenerateDocumentDialog({
          candidateId: application.candidate.id,
          vacancyId,
          type: 'rejection_letter'
        })
      }
    } else if (newStatus === 'offer') {
      // Предлагаем сгенерировать оффер
      const shouldGenerateOffer = await showOfferDialog(application)
      
      if (shouldGenerateOffer === null) {
        return
      }
      
      await updateStatusMutation.mutateAsync({ applicationId, newStatus })
      
      if (shouldGenerateOffer) {
        openGenerateDocumentDialog({
          candidateId: application.candidate.id,
          vacancyId,
          type: 'job_offer'
        })
      }
    } else if (newStatus === 'interview') {
      // Предлагаем отправить приглашение
      const shouldSendInvite = await showInterviewDialog(application)
      
      if (shouldSendInvite === null) {
        return
      }
      
      await updateStatusMutation.mutateAsync({ applicationId, newStatus })
      
      if (shouldSendInvite) {
        openGenerateDocumentDialog({
          candidateId: application.candidate.id,
          vacancyId,
          type: 'interview_invitation'
        })
      }
    } else {
      // Обычное обновление статуса
      await updateStatusMutation.mutateAsync({ applicationId, newStatus })
      
      toast.success(t('funnel.statusUpdated'))
    }
  }
  
  // Получаем активную карточку для DragOverlay
  const activeApplication = applications?.find(app => app.id === activeId)
  
  if (isLoading) {
    return <FunnelSkeleton />
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/hr/dashboard?tab=vacancies')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{vacancy?.title}</h1>
              <p className="text-sm text-muted-foreground">
                {t('funnel.recruitmentFunnel')}
              </p>
            </div>
          </div>
          
          <Button onClick={openAddCandidateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            {t('funnel.addCandidate')}
          </Button>
        </div>
      </div>
      
      {/* Статистика (опционально) */}
      {vacancy?.funnel_counts && (
        <div className="border-b bg-muted/50 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">{t('funnel.total')}:</span>
                <span className="ml-2 font-semibold">
                  {applications?.length || 0}
                </span>
              </div>
              {Object.entries(vacancy.funnel_counts).map(([status, count]) => (
                <div key={status}>
                  <span className="text-muted-foreground">
                    {t(`funnel.status.${status}`)}:
                  </span>
                  <span className="ml-2 font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="inline-flex gap-4 min-h-full">
            {statuses.map(status => (
              <KanbanColumn
                key={status.id}
                id={status.id}
                title={status.label}
                count={groupedByStatus[status.id]?.length || 0}
                applications={groupedByStatus[status.id] || []}
                vacancyId={vacancyId}
              />
            ))}
          </div>
          
          {/* Overlay при перетаскивании */}
          <DragOverlay>
            {activeId && activeApplication ? (
              <div className="rotate-3 opacity-80">
                <CandidateCard 
                  application={activeApplication}
                  isDragging
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
```

### 2.5 Компонент Kanban Column

```tsx
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'

interface KanbanColumnProps {
  id: string
  title: string
  count: number
  applications: any[]
  vacancyId: string
}

export const KanbanColumn = ({
  id,
  title,
  count,
  applications,
  vacancyId
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id
  })
  
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-80 flex-shrink-0 bg-muted/30 rounded-lg transition-colors",
        isOver && "ring-2 ring-primary bg-primary/5"
      )}
    >
      {/* Заголовок колонки */}
      <div className="p-3 border-b bg-background rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{title}</h3>
          <Badge variant="secondary" className="ml-2">
            {count}
          </Badge>
        </div>
      </div>
      
      {/* Список карточек */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px]">
        <SortableContext
          items={applications.map(app => app.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              Нет кандидатов
            </div>
          ) : (
            applications.map(application => (
              <SortableCandidateCard
                key={application.id}
                application={application}
                vacancyId={vacancyId}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
```

### 2.6 Карточка кандидата в воронке

```tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableCandidateCardProps {
  application: {
    id: string
    status: string
    created_at: string
    updated_at: string
    compatibility_score: number | null
    candidate: {
      id: string
      full_name: string
      category: {
        name_ru: string
        name_kk: string
        name_en: string
      }
      tests_completed: number
      tests_last_updated_at: string
    }
  }
  vacancyId: string
}

export const SortableCandidateCard = ({ 
  application,
  vacancyId 
}: SortableCandidateCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: application.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <CandidateCard 
        application={application} 
        vacancyId={vacancyId}
        isDragging={isDragging}
      />
    </div>
  )
}

interface CandidateCardProps {
  application: SortableCandidateCardProps['application']
  vacancyId: string
  isDragging?: boolean
}

export const CandidateCard = ({ 
  application, 
  vacancyId,
  isDragging = false 
}: CandidateCardProps) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language as 'ru' | 'kk' | 'en'
  
  const categoryName = application.candidate.category?.[`name_${lang}`]
  
  // Статус актуальности тестов
  const getTestsStatus = () => {
    if (application.candidate.tests_completed === 0) {
      return { badge: 'default', label: t('tests.noTests') }
    }
    
    const daysPassed = differenceInDays(
      new Date(), 
      new Date(application.candidate.tests_last_updated_at)
    )
    const monthsPassed = daysPassed / 30
    
    if (monthsPassed < 1) return { badge: 'success', label: t('tests.current') }
    if (monthsPassed < 2) return { badge: 'warning', label: t('tests.expiring') }
    return { badge: 'destructive', label: t('tests.expired') }
  }
  
  const testsStatus = getTestsStatus()
  
  return (
    <Card className={cn(
      "cursor-move hover:shadow-md transition-shadow",
      isDragging && "shadow-lg"
    )}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold line-clamp-1">
            {application.candidate.full_name}
          </CardTitle>
          <Badge 
            variant={testsStatus.badge as any}
            className="text-xs flex-shrink-0"
          >
            {application.candidate.tests_completed}/6
          </Badge>
        </div>
        {categoryName && (
          <CardDescription className="text-xs line-clamp-1">
            {categoryName}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="p-3 pt-0 space-y-2">
        {/* Совместимость (если есть) */}
        {application.compatibility_score !== null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {t('funnel.compatibility')}:
            </span>
            <span className={cn(
              "font-semibold",
              application.compatibility_score >= 80 && "text-emerald-600",
              application.compatibility_score >= 60 && application.compatibility_score < 80 && "text-amber-600",
              application.compatibility_score < 60 && "text-blue-600"
            )}>
              {application.compatibility_score}%
            </span>
          </div>
        )}
        
        {/* Дата добавления */}
        <div className="text-xs text-muted-foreground">
          {t('funnel.added')}: {format(new Date(application.created_at), 'dd.MM.yyyy')}
        </div>
        
        {/* Действия */}
        <div className="flex gap-1 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/hr/candidate/${application.candidate.id}`)
            }}
          >
            <User className="h-3 w-3 mr-1" />
            {t('funnel.profile')}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/hr/chat?candidateId=${application.candidate.id}`)
            }}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            {t('funnel.chat')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 2.7 Диалоги подтверждения при изменении статуса

**Dialog при переводе в "Отклонён":**

```tsx
const showRejectionDialog = (application: any): Promise<boolean | null> => {
  return new Promise((resolve) => {
    const dialog = (
      <AlertDialog open onOpenChange={() => resolve(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('funnel.rejectCandidate')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('funnel.rejectDescription', { name: application.candidate.full_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 py-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{t('funnel.rejectInfo')}</AlertTitle>
              <AlertDescription>
                {t('funnel.rejectInfoDescription')}
              </AlertDescription>
            </Alert>
          </div>
          
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => resolve(null)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => resolve(false)}
            >
              {t('funnel.rejectWithoutLetter')}
            </Button>
            <AlertDialogAction onClick={() => resolve(true)}>
              {t('funnel.rejectAndSendLetter')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    
    // Рендерим диалог
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(dialog)
  })
}
```

**Dialog при переводе в "Оффер":**

```tsx
const showOfferDialog = (application: any): Promise<boolean | null> => {
  return new Promise((resolve) => {
    const dialog = (
      <AlertDialog open onOpenChange={() => resolve(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('funnel.sendOffer')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('funnel.offerDescription', { name: application.candidate.full_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 py-4">
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>{t('funnel.offerInfo')}</AlertTitle>
              <AlertDescription>
                {t('funnel.offerInfoDescription')}
              </AlertDescription>
            </Alert>
          </div>
          
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => resolve(null)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => resolve(false)}
            >
              {t('funnel.updateStatusOnly')}
            </Button>
            <AlertDialogAction onClick={() => resolve(true)}>
              {t('funnel.generateAndSendOffer')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    
    // Рендерим
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(dialog)
  })
}
```

**Dialog при переводе в "Интервью":**

```tsx
const showInterviewDialog = (application: any): Promise<boolean | null> => {
  return new Promise((resolve) => {
    const dialog = (
      <AlertDialog open onOpenChange={() => resolve(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('funnel.inviteToInterview')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('funnel.interviewDescription', { name: application.candidate.full_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 py-4">
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertTitle>{t('funnel.interviewInfo')}</AlertTitle>
              <AlertDescription>
                {t('funnel.interviewInfoDescription')}
              </AlertDescription>
            </Alert>
          </div>
          
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => resolve(null)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => resolve(false)}
            >
              {t('funnel.updateStatusOnly')}
            </Button>
            <AlertDialogAction onClick={() => resolve(true)}>
              {t('funnel.generateInvitation')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    
    // Рендерим
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(dialog)
  })
}
```

---

## 3. REAL-TIME ЧАТ

### 3.1 URL и навигация

**URL для HR:** `/hr/chat?candidateId={optional}`  
**URL для Кандидата:** `/candidate/chat?hrId={optional}`

**Точки входа:**
- Кнопка "Чат" в карточке кандидата (воронка)
- Иконка чата в header (с badge непрочитанных)
- Ссылка из профиля кандидата
- Прямая навигация из уведомления

### 3.2 Общий Layout чата

**Desktop (>= 768px):**

```
┌─────────────────────────────────────────────────────────────┐
│  Header (с уведомлениями)                                    │
├──────────────────┬──────────────────────────────────────────┤
│  Sidebar (30%)   │  Chat Area (70%)                         │
│                  │                                          │
│  ┌────────────┐  │  ┌────────────────────────────────────┐ │
│  │ Search     │  │  │  Chat Header                       │ │
│  └────────────┘  │  │  Иван Петров                      │ │
│                  │  │  Frontend Developer                │ │
│  [Chat 1]  (2)   │  └────────────────────────────────────┘ │
│  [Chat 2]        │                                          │
│  [Chat 3]  (5)   │  ┌────────────────────────────────────┐ │
│  [Chat 4]        │  │  Messages Area (scroll)            │ │
│  ...             │  │                                     │ │
│                  │  │  [HR message]                      │ │
│                  │  │  [Candidate message]               │ │
│                  │  │  [HR message]                      │ │
│                  │  │  ...                               │ │
│                  │  └────────────────────────────────────┘ │
│                  │                                          │
│                  │  ┌────────────────────────────────────┐ │
│                  │  │  Input Area                        │ │
│                  │  │  [Type a message...] [Send]        │ │
│                  │  └────────────────────────────────────┘ │
└──────────────────┴──────────────────────────────────────────┘
```

**Mobile (< 768px):**

Две отдельные view:
1. **Список чатов** (по умолчанию)
2. **Область чата** (открывается при выборе)

С кнопкой "Назад" для возврата к списку

### 3.3 Архитектура Realtime

**Используем Supabase Realtime для:**
- Мгновенная доставка сообщений
- Обновление статуса "прочитано"
- Обновление счетчиков непрочитанных
- Индикация "печатает..."

**Структура подписок:**

```tsx
// Подписка на новые сообщения в чате
const subscribeToChat = (chatRoomId: string) => {
  const channel = supabase
    .channel(`chat:${chatRoomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${chatRoomId}`
      },
      (payload) => {
        // Добавляем новое сообщение в список
        const newMessage = payload.new
        
        // Обновляем React Query кэш
        queryClient.setQueryData(
          ['chat-messages', chatRoomId],
          (old: any[]) => [...(old || []), newMessage]
        )
        
        // Прокручиваем вниз
        scrollToBottom()
        
        // Если сообщение от другого пользователя - помечаем как прочитано
        if (newMessage.sender_id !== currentUserId) {
          markAsRead(newMessage.id)
        }
      }
    )
    .subscribe()
  
  return () => {
    channel.unsubscribe()
  }
}

// Подписка на обновления списка чатов
const subscribeToChats = () => {
  const channel = supabase
    .channel('chat-rooms')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_rooms',
        filter: userType === 'hr' 
          ? `hr_specialist_id=eq.${currentUserId}`
          : `candidate_id=eq.${currentUserId}`
      },
      (payload) => {
        // Обновляем список чатов
        queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
      }
    )
    .subscribe()
  
  return () => {
    channel.unsubscribe()
  }
}
```

### 3.4 Компонент главной страницы чата

```tsx
interface ChatPageProps {
  userType: 'hr' | 'candidate'
}

export const ChatPage = ({ userType }: ChatPageProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  
  // ID выбранного чата из URL
  const selectedChatId = searchParams.get(
    userType === 'hr' ? 'candidateId' : 'hrId'
  )
  
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showChatArea, setShowChatArea] = useState(false)
  
  // Проверяем ширину экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Загружаем список чатов
  const { data: chatRooms, isLoading } = useQuery({
    queryKey: ['chat-rooms', userType],
    queryFn: async () => {
      const query = supabase
        .from('chat_rooms')
        .select(`
          id,
          created_at,
          last_message_at,
          unread_count_hr,
          unread_count_candidate,
          hr_specialist:hr_specialists(
            id,
            full_name
          ),
          candidate:candidates(
            id,
            full_name,
            category:professional_categories(name_ru, name_kk, name_en)
          )
        `)
        .order('last_message_at', { ascending: false })
      
      if (userType === 'hr') {
        query.eq('hr_specialist_id', user.id)
      } else {
        query.eq('candidate_id', user.id)
      }
      
      const { data } = await query
      return data || []
    }
  })
  
  // Подписываемся на обновления чатов
  useEffect(() => {
    const unsubscribe = subscribeToChats()
    return unsubscribe
  }, [userType])
  
  // Автоматически открываем чат если указан в URL
  useEffect(() => {
    if (selectedChatId && chatRooms) {
      const chatRoom = chatRooms.find(room => 
        userType === 'hr' 
          ? room.candidate.id === selectedChatId
          : room.hr_specialist.id === selectedChatId
      )
      
      if (chatRoom) {
        setActiveChatRoomId(chatRoom.id)
        if (isMobileView) {
          setShowChatArea(true)
        }
      }
    }
  }, [selectedChatId, chatRooms, userType, isMobileView])
  
  const handleChatSelect = (chatRoomId: string) => {
    setActiveChatRoomId(chatRoomId)
    if (isMobileView) {
      setShowChatArea(true)
    }
  }
  
  const handleBackToList = () => {
    setShowChatArea(false)
    setActiveChatRoomId(null)
  }
  
  if (isLoading) {
    return <ChatSkeleton />
  }
  
  // Mobile view
  if (isMobileView) {
    return (
      <div className="h-full flex flex-col">
        {!showChatArea ? (
          <ChatList
            chatRooms={chatRooms}
            userType={userType}
            activeChatRoomId={activeChatRoomId}
            onChatSelect={handleChatSelect}
          />
        ) : (
          <ChatArea
            chatRoomId={activeChatRoomId!}
            userType={userType}
            onBack={handleBackToList}
          />
        )}
      </div>
    )
  }
  
  // Desktop view
  return (
    <div className="h-full flex">
      <div className="w-[30%] border-r flex flex-col">
        <ChatList
          chatRooms={chatRooms}
          userType={userType}
          activeChatRoomId={activeChatRoomId}
          onChatSelect={handleChatSelect}
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        {activeChatRoomId ? (
          <ChatArea
            chatRoomId={activeChatRoomId}
            userType={userType}
          />
        ) : (
          <EmptyChatState />
        )}
      </div>
    </div>
  )
}
```

### 3.5 Компонент списка чатов

```tsx
interface ChatListProps {
  chatRooms: any[]
  userType: 'hr' | 'candidate'
  activeChatRoomId: string | null
  onChatSelect: (chatRoomId: string) => void
}

export const ChatList = ({
  chatRooms,
  userType,
  activeChatRoomId,
  onChatSelect
}: ChatListProps) => {
  const { t, i18n } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const lang = i18n.language as 'ru' | 'kk' | 'en'
  
  // Фильтрация по поиску
  const filteredChats = useMemo(() => {
    if (!searchQuery) return chatRooms
    
    const query = searchQuery.toLowerCase()
    return chatRooms.filter(room => {
      const name = userType === 'hr'
        ? room.candidate.full_name
        : room.hr_specialist.full_name
      
      return name.toLowerCase().includes(query)
    })
  }, [chatRooms, searchQuery, userType])
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">{t('chat.messages')}</h2>
        
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('chat.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2" />
            <p className="text-sm">{t('chat.noChats')}</p>
          </div>
        ) : (
          filteredChats.map(room => (
            <ChatListItem
              key={room.id}
              chatRoom={room}
              userType={userType}
              isActive={room.id === activeChatRoomId}
              onClick={() => onChatSelect(room.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
```

### 3.6 Компонент элемента списка чата

```tsx
interface ChatListItemProps {
  chatRoom: {
    id: string
    last_message_at: string
    unread_count_hr: number
    unread_count_candidate: number
    hr_specialist: {
      id: string
      full_name: string
    }
    candidate: {
      id: string
      full_name: string
      category: {
        name_ru: string
        name_kk: string
        name_en: string
      }
    }
  }
  userType: 'hr' | 'candidate'
  isActive: boolean
  onClick: () => void
}

export const ChatListItem = ({
  chatRoom,
  userType,
  isActive,
  onClick
}: ChatListItemProps) => {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'kk' | 'en'
  
  // Определяем собеседника
  const otherPerson = userType === 'hr' 
    ? chatRoom.candidate 
    : chatRoom.hr_specialist
  
  const unreadCount = userType === 'hr'
    ? chatRoom.unread_count_hr
    : chatRoom.unread_count_candidate
  
  const categoryName = userType === 'hr' && chatRoom.candidate.category
    ? chatRoom.candidate.category[`name_${lang}`]
    : null
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 border-b hover:bg-accent transition-colors text-left",
        isActive && "bg-accent"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Аватар */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-primary" />
        </div>
        
        {/* Контент */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-sm truncate">
              {otherPerson.full_name}
            </p>
            {unreadCount > 0 && (
              <Badge variant="default" className="flex-shrink-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          {categoryName && (
            <p className="text-xs text-muted-foreground truncate mb-1">
              {categoryName}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(chatRoom.last_message_at), {
              addSuffix: true,
              locale: lang === 'ru' ? ru : lang === 'kk' ? kk : enUS
            })}
          </p>
        </div>
      </div>
    </button>
  )
}
```

### 3.7 Компонент области чата

```tsx
interface ChatAreaProps {
  chatRoomId: string
  userType: 'hr' | 'candidate'
  onBack?: () => void
}

export const ChatArea = ({ chatRoomId, userType, onBack }: ChatAreaProps) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  
  // Загружаем данные чат-комнаты
  const { data: chatRoom } = useQuery({
    queryKey: ['chat-room', chatRoomId],
    queryFn: async () => {
      const { data } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          hr_specialist:hr_specialists(
            id,
            full_name
          ),
          candidate:candidates(
            id,
            full_name,
            category:professional_categories(name_ru, name_kk, name_en)
          )
        `)
        .eq('id', chatRoomId)
        .single()
      
      return data
    }
  })
  
  // Загружаем сообщения
  const { data: messages, isLoading } = useQuery({
    queryKey: ['chat-messages', chatRoomId],
    queryFn: async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true })
      
      return data || []
    }
  })
  
  // Подписываемся на новые сообщения
  useEffect(() => {
    const unsubscribe = subscribeToChat(chatRoomId)
    return unsubscribe
  }, [chatRoomId])
  
  // Автопрокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  // Помечаем непрочитанные сообщения как прочитанные
  useEffect(() => {
    if (!messages) return
    
    const unreadMessages = messages.filter(
      msg => msg.sender_id !== user.id && !msg.is_read
    )
    
    if (unreadMessages.length > 0) {
      markMessagesAsRead(unreadMessages.map(m => m.id))
    }
  }, [messages, user.id])
  
  // Отправка сообщения
  const handleSend = async () => {
    if (!messageText.trim() || isSending) return
    
    try {
      setIsSending(true)
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: chatRoomId,
          sender_id: user.id,
          sender_type: userType,
          message_text: messageText.trim(),
          is_read: false
        })
      
      if (error) throw error
      
      setMessageText('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(t('chat.sendError'))
    } finally {
      setIsSending(false)
    }
  }
  
  // Обработка Enter для отправки
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  if (isLoading || !chatRoom) {
    return <ChatAreaSkeleton />
  }
  
  const otherPerson = userType === 'hr' 
    ? chatRoom.candidate 
    : chatRoom.hr_specialist
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {otherPerson.full_name}
              </h3>
              {userType === 'hr' && chatRoom.candidate.category && (
                <p className="text-sm text-muted-foreground truncate">
                  {chatRoom.candidate.category.name_ru}
                </p>
              )}
            </div>
          </div>
          
          {userType === 'hr' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(`/hr/candidate/${chatRoom.candidate.id}`, '_blank')
              }}
            >
              <User className="h-4 w-4 mr-2" />
              {t('chat.viewProfile')}
            </Button>
          )}
        </div>
      </div>
      
      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-3" />
            <p className="text-sm">{t('chat.noMessages')}</p>
            <p className="text-xs mt-1">{t('chat.startConversation')}</p>
          </div>
        ) : (
          <>
            {messages?.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.sender_id === user.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Поле ввода */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder={t('chat.typePlaceholder')}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="resize-none min-h-[40px] max-h-[120px]"
          />
          
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            size="icon"
            className="flex-shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          {t('chat.pressEnter')}
        </p>
      </div>
    </div>
  )
}
```

### 3.8 Компонент сообщения

```tsx
interface ChatMessageProps {
  message: {
    id: string
    created_at: string
    message_text: string
    is_read: boolean
  }
  isOwn: boolean
}

export const ChatMessage = ({ message, isOwn }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex",
      isOwn ? "justify-end" : "justify-start"
    )}>
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-4 py-2",
          isOwn 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.message_text}
        </p>
        
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs",
          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          <span>
            {format(new Date(message.created_at), 'HH:mm')}
          </span>
          
          {isOwn && (
            message.is_read ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )
          )}
        </div>
      </div>
    </div>
  )
}
```

### 3.9 Вспомогательные функции

```tsx
// Отметка сообщений как прочитанных
const markMessagesAsRead = async (messageIds: string[]) => {
  if (messageIds.length === 0) return
  
  const { error } = await supabase
    .from('chat_messages')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString()
    })
    .in('id', messageIds)
  
  if (error) {
    console.error('Error marking messages as read:', error)
  }
}

// Сброс счетчика непрочитанных
const resetUnreadCount = async (chatRoomId: string, userType: 'hr' | 'candidate') => {
  const field = userType === 'hr' ? 'unread_count_hr' : 'unread_count_candidate'
  
  const { error } = await supabase
    .from('chat_rooms')
    .update({ [field]: 0 })
    .eq('id', chatRoomId)
  
  if (error) {
    console.error('Error resetting unread count:', error)
  }
}
```

---

## 4. БАЗА ДАННЫХ И REALTIME

### 4.1 Дополнения к RLS политикам

**Таблица `chat_messages` - обновление для отметки прочтения:**

```sql
-- Участники чата могут обновлять статус прочтения ТОЛЬКО своих непрочитанных
CREATE POLICY "chat_participants_can_mark_as_read"
ON chat_messages FOR UPDATE
TO authenticated
USING (
  chat_room_id IN (
    SELECT id FROM chat_rooms 
    WHERE hr_specialist_id = auth.uid() OR candidate_id = auth.uid()
  )
  AND sender_id != auth.uid()  -- Только чужие сообщения
  AND is_read = false            -- Только непрочитанные
)
WITH CHECK (
  is_read = true                 -- Можно только пометить как прочитано
  AND read_at IS NOT NULL        -- С указанием времени
);
```

### 4.2 Настройка Realtime для чата

**В Supabase Dashboard → Database → Replication:**

Включить Realtime для таблиц:
- ✅ `chat_rooms`
- ✅ `chat_messages`

**RLS политики для Realtime (уже есть в основном ТЗ):**

```sql
-- Для broadcast/presence на chat_rooms
CREATE POLICY "authenticated can read chat room updates"
ON "realtime"."messages"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE 'chat:%'
  AND realtime.messages.extension in ('broadcast', 'presence')
);

CREATE POLICY "authenticated can send chat room updates"
ON "realtime"."messages"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() LIKE 'chat:%'
  AND realtime.messages.extension in ('broadcast', 'presence')
);
```

### 4.3 Индексы для производительности

```sql
-- Для быстрого поиска сообщений чата
CREATE INDEX idx_chat_messages_room_created 
ON chat_messages(chat_room_id, created_at DESC);

-- Для поиска непрочитанных
CREATE INDEX idx_chat_messages_unread 
ON chat_messages(chat_room_id, is_read) 
WHERE is_read = false;

-- Для сортировки списка чатов
CREATE INDEX idx_chat_rooms_last_message 
ON chat_rooms(last_message_at DESC);

-- Для фильтрации по HR/Candidate
CREATE INDEX idx_chat_rooms_hr 
ON chat_rooms(hr_specialist_id, last_message_at DESC);

CREATE INDEX idx_chat_rooms_candidate 
ON chat_rooms(candidate_id, last_message_at DESC);
```

---

## 5. ИНТЕГРАЦИЯ И НАВИГАЦИЯ

### 5.1 Уведомления о новых сообщениях в Header

```tsx
export const Header = () => {
  const { user, userType } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // Получаем общее количество непрочитанных
  const { data: unreadCount } = useQuery({
    queryKey: ['unread-messages-count', userType],
    queryFn: async () => {
      const { data } = await supabase
        .from('chat_rooms')
        .select(userType === 'hr' ? 'unread_count_hr' : 'unread_count_candidate')
        .eq(userType === 'hr' ? 'hr_specialist_id' : 'candidate_id', user.id)
      
      const total = data?.reduce((sum, room) => {
        const count = userType === 'hr' 
          ? room.unread_count_hr 
          : room.unread_count_candidate
        return sum + (count || 0)
      }, 0)
      
      return total || 0
    },
    refetchInterval: 10000 // Обновляем каждые 10 секунд
  })
  
  // Подписываемся на обновления
  useEffect(() => {
    const channel = supabase
      .channel('chat-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: userType === 'hr'
            ? `sender_type=eq.candidate`
            : `sender_type=eq.hr`
        },
        (payload) => {
          // Показываем уведомление
          toast.info(t('chat.newMessageReceived'))
          
          // Обновляем счетчик
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] })
        }
      )
      .subscribe()
    
    return () => {
      channel.unsubscribe()
    }
  }, [userType])
  
  return (
    <header className="border-b">
      <div className="flex items-center justify-between px-4 py-3">
        {/* ... другие элементы header ... */}
        
        <div className="flex items-center gap-4">
          {/* Иконка чата с badge */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate(userType === 'hr' ? '/hr/chat' : '/candidate/chat')}
          >
            <MessageSquare className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
          
          {/* ... остальные элементы ... */}
        </div>
      </div>
    </header>
  )
}
```

### 5.2 Кнопки открытия чата в разных местах

**В карточке кандидата (воронка):**
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={(e) => {
    e.stopPropagation()
    navigate(`/hr/chat?candidateId=${application.candidate.id}`)
  }}
>
  <MessageSquare className="h-3 w-3 mr-1" />
  {t('funnel.chat')}
</Button>
```

**На странице профиля кандидата:**
```tsx
<Button
  onClick={() => navigate(`/hr/chat?candidateId=${candidateId}`)}
>
  <MessageSquare className="h-4 w-4 mr-2" />
  {t('candidate.openChat')}
</Button>
```

**Для кандидата (если есть активные заявки):**
```tsx
// На дашборде кандидата
{applications.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>{t('candidate.yourApplications')}</CardTitle>
    </CardHeader>
    <CardContent>
      {applications.map(app => (
        <div key={app.id} className="flex items-center justify-between p-2">
          <span>{app.vacancy.title}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/candidate/chat?hrId=${app.added_by_hr_id}`)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('candidate.chatWithHR')}
          </Button>
        </div>
      ))}
    </CardContent>
  </Card>
)}
```

### 5.3 Автоматическое создание чат-комнаты

**При покупке кандидата из рынка талантов (уже есть в RPC `acquire_candidate_from_market`):**

```sql
-- Создаем чат-комнату
INSERT INTO chat_rooms (
  id,
  organization_id,
  hr_specialist_id,
  candidate_id,
  last_message_at,
  unread_count_hr,
  unread_count_candidate
)
VALUES (
  gen_random_uuid(),
  v_organization_id,
  p_hr_specialist_id,
  p_candidate_id,
  NOW(),
  0,
  0
)
ON CONFLICT (hr_specialist_id, candidate_id) DO NOTHING;
```

---

## 6. ПЕРЕВОДЫ (I18N)

### 6.1 Файл переводов для воронки

**`public/locales/ru/funnel.json`:**
```json
{
  "recruitmentFunnel": "Воронка найма",
  "addCandidate": "Добавить кандидата",
  "total": "Всего",
  "compatibility": "Совместимость",
  "added": "Добавлен",
  "profile": "Профиль",
  "chat": "Чат",
  "statusUpdated": "Статус обновлён",
  
  "status": {
    "invited": "Приглашён",
    "testing": "Проходит тесты",
    "evaluated": "Оценён",
    "interview": "На интервью",
    "offer": "Оффер",
    "hired": "Нанят",
    "rejected": "Отклонён"
  },
  
  "rejectCandidate": "Отклонить кандидата?",
  "rejectDescription": "Вы собираетесь отклонить кандидата {{name}}",
  "rejectInfo": "Рекомендация",
  "rejectInfoDescription": "Рекомендуем отправить вежливое письмо-отказ. Это помогает поддерживать хорошие отношения и репутацию компании.",
  "rejectWithoutLetter": "Отклонить без письма",
  "rejectAndSendLetter": "Отклонить и отправить письмо",
  
  "sendOffer": "Отправить оффер?",
  "offerDescription": "Вы собираетесь отправить оффер кандидату {{name}}",
  "offerInfo": "AI поможет создать оффер",
  "offerInfoDescription": "Система автоматически создаст профессиональное предложение о работе на основе данных вакансии и профиля кандидата.",
  "updateStatusOnly": "Только обновить статус",
  "generateAndSendOffer": "Сгенерировать оффер",
  
  "inviteToInterview": "Пригласить на интервью?",
  "interviewDescription": "Вы собираетесь пригласить {{name}} на собеседование",
  "interviewInfo": "Приглашение на интервью",
  "interviewInfoDescription": "Система поможет создать профессиональное приглашение с деталями интервью.",
  "generateInvitation": "Сгенерировать приглашение"
}
```

**`public/locales/kk/funnel.json`:**
```json
{
  "recruitmentFunnel": "Жұмысқа қабылдау воронкасы",
  "addCandidate": "Үміткерді қосу",
  "total": "Барлығы",
  "compatibility": "Үйлесімділік",
  "added": "Қосылды",
  "profile": "Профиль",
  "chat": "Чат",
  "statusUpdated": "Мәртебе жаңартылды",
  
  "status": {
    "invited": "Шақырылған",
    "testing": "Тесттен өтуде",
    "evaluated": "Бағаланған",
    "interview": "Сұхбатта",
    "offer": "Ұсыныс",
    "hired": "Жұмысқа алынды",
    "rejected": "Қабылданбады"
  },
  
  "rejectCandidate": "Үміткерді қабылдамау керек пе?",
  "rejectDescription": "Сіз {{name}} үміткерін қабылдамауға жинақтаудасыз",
  "rejectInfo": "Ұсыныс",
  "rejectInfoDescription": "Әдепті бас тарту хатын жіберуді ұсынамыз. Бұл жақсы қарым-қатынас пен компания беделін сақтауға көмектеседі.",
  "rejectWithoutLetter": "Хатсыз қабылдамау",
  "rejectAndSendLetter": "Қабылдамау және хат жіберу",
  
  "sendOffer": "Ұсыныс жіберу керек пе?",
  "offerDescription": "Сіз {{name}} үміткеріне ұсыныс жіберуге дайынсыз",
  "offerInfo": "AI ұсыныс жасауға көмектеседі",
  "offerInfoDescription": "Жүйе вакансия және үміткер профилі деректері негізінде кәсіби жұмыс ұсынысын автоматты түрде жасайды.",
  "updateStatusOnly": "Тек мәртебені жаңарту",
  "generateAndSendOffer": "Ұсыныс жасау",
  
  "inviteToInterview": "Сұхбатқа шақыру керек пе?",
  "interviewDescription": "Сіз {{name}} дегенді сұхбатқа шақыруға дайынсыз",
  "interviewInfo": "Сұхбатқа шақыру",
  "interviewInfoDescription": "Жүйе сұхбат мәліметтерімен кәсіби шақыру жасауға көмектеседі.",
  "generateInvitation": "Шақыру жасау"
}
```

**`public/locales/en/funnel.json`:**
```json
{
  "recruitmentFunnel": "Recruitment Funnel",
  "addCandidate": "Add Candidate",
  "total": "Total",
  "compatibility": "Compatibility",
  "added": "Added",
  "profile": "Profile",
  "chat": "Chat",
  "statusUpdated": "Status updated",
  
  "status": {
    "invited": "Invited",
    "testing": "Testing",
    "evaluated": "Evaluated",
    "interview": "Interview",
    "offer": "Offer",
    "hired": "Hired",
    "rejected": "Rejected"
  },
  
  "rejectCandidate": "Reject candidate?",
  "rejectDescription": "You are about to reject candidate {{name}}",
  "rejectInfo": "Recommendation",
  "rejectInfoDescription": "We recommend sending a polite rejection letter. This helps maintain good relationships and company reputation.",
  "rejectWithoutLetter": "Reject without letter",
  "rejectAndSendLetter": "Reject and send letter",
  
  "sendOffer": "Send offer?",
  "offerDescription": "You are about to send an offer to candidate {{name}}",
  "offerInfo": "AI will help create an offer",
  "offerInfoDescription": "The system will automatically create a professional job offer based on vacancy data and candidate profile.",
  "updateStatusOnly": "Update status only",
  "generateAndSendOffer": "Generate offer",
  
  "inviteToInterview": "Invite to interview?",
  "interviewDescription": "You are about to invite {{name}} to an interview",
  "interviewInfo": "Interview invitation",
  "interviewInfoDescription": "The system will help create a professional invitation with interview details.",
  "generateInvitation": "Generate invitation"
}
```

### 6.2 Файл переводов для чата

**`public/locales/ru/chat.json`:**
```json
{
  "messages": "Сообщения",
  "searchPlaceholder": "Поиск...",
  "noChats": "Нет чатов",
  "noMessages": "Нет сообщений",
  "startConversation": "Начните разговор",
  "typePlaceholder": "Введите сообщение...",
  "pressEnter": "Enter для отправки, Shift+Enter для новой строки",
  "sendError": "Ошибка отправки сообщения",
  "viewProfile": "Профиль",
  "newMessageReceived": "Новое сообщение"
}
```

**`public/locales/kk/chat.json`:**
```json
{
  "messages": "Хабарламалар",
  "searchPlaceholder": "Іздеу...",
  "noChats": "Чаттар жоқ",
  "noMessages": "Хабарламалар жоқ",
  "startConversation": "Әңгімені бастаңыз",
  "typePlaceholder": "Хабарлама жазыңыз...",
  "pressEnter": "Жіберу үшін Enter, жаңа жол үшін Shift+Enter",
  "sendError": "Хабарламаны жіберу қатесі",
  "viewProfile": "Профиль",
  "newMessageReceived": "Жаңа хабарлама"
}
```

**`public/locales/en/chat.json`:**
```json
{
  "messages": "Messages",
  "searchPlaceholder": "Search...",
  "noChats": "No chats",
  "noMessages": "No messages",
  "startConversation": "Start a conversation",
  "typePlaceholder": "Type a message...",
  "pressEnter": "Enter to send, Shift+Enter for new line",
  "sendError": "Error sending message",
  "viewProfile": "Profile",
  "newMessageReceived": "New message received"
}
```

---

## 7. ПРОИЗВОДИТЕЛЬНОСТЬ

### 7.1 Оптимизация запросов

**Использование React Query для кэширования:**

```tsx
// Кэшируем список чатов на 30 секунд
const { data: chatRooms } = useQuery({
  queryKey: ['chat-rooms', userType],
  queryFn: fetchChatRooms,
  staleTime: 30 * 1000,
  cacheTime: 5 * 60 * 1000
})

// Кэшируем сообщения на 10 секунд
const { data: messages } = useQuery({
  queryKey: ['chat-messages', chatRoomId],
  queryFn: fetchMessages,
  staleTime: 10 * 1000
})
```

### 7.2 Виртуализация длинных списков

**Для списка сообщений (если их много):**

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export const VirtualizedMessages = ({ messages }) => {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5
  })
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const message = messages[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <ChatMessage message={message} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### 7.3 Debounce для поиска чатов

```tsx
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

const [searchQuery, setSearchQuery] = useState('')
const debouncedSearch = useDebouncedValue(searchQuery, 300)

const filteredChats = useMemo(() => {
  if (!debouncedSearch) return chatRooms
  
  const query = debouncedSearch.toLowerCase()
  return chatRooms.filter(/* ... */)
}, [chatRooms, debouncedSearch])
```

### 7.4 Оптимизация Realtime подписок

```tsx
// Отписываемся при размонтировании
useEffect(() => {
  const channel = supabase.channel(/* ... */)
  
  return () => {
    channel.unsubscribe()
  }
}, [])

// Используем один канал для всех обновлений чата
const channel = supabase
  .channel(`chat-room:${chatRoomId}`)
  .on('postgres_changes', { /* новые сообщения */ }, handler1)
  .on('postgres_changes', { /* обновления статуса */ }, handler2)
  .subscribe()
```

---

## 8. ЧЕКЛИСТ РЕАЛИЗАЦИИ

### 8.1 Воронка найма

**База данных:**
- [ ] Проверить все статусы в enum (если используется)
- [ ] Создать индексы для производительности
- [ ] Проверить RLS политики для `applications`
- [ ] Проверить триггер `update_vacancy_funnel_counts`

**UI компоненты:**
- [ ] Страница `/hr/vacancy/:id/funnel`
- [ ] Компонент `VacancyFunnel` (основной)
- [ ] Компонент `KanbanColumn`
- [ ] Компонент `SortableCandidateCard`
- [ ] Компонент `CandidateCard`
- [ ] Skeleton для загрузки

**Drag & Drop:**
- [ ] Установить `@dnd-kit/*` пакеты
- [ ] Настроить DndContext
- [ ] Реализовать `handleDragStart`
- [ ] Реализовать `handleDragEnd`
- [ ] Реализовать DragOverlay
- [ ] Добавить визуальную обратную связь

**Диалоги:**
- [ ] Dialog для отклонения кандидата
- [ ] Dialog для отправки оффера
- [ ] Dialog для приглашения на интервью
- [ ] Интеграция с генерацией документов

**Функционал:**
- [ ] Группировка кандидатов по статусам
- [ ] Обновление статуса через мутацию
- [ ] Отображение совместимости
- [ ] Кнопки действий (профиль, чат)
- [ ] Статистика по воронке

### 8.2 Real-time чат

**База данных:**
- [ ] Проверить таблицы `chat_rooms` и `chat_messages`
- [ ] Создать индексы для чата
- [ ] Проверить RLS политики
- [ ] Настроить Realtime в Supabase
- [ ] Проверить политики для Realtime

**UI компоненты:**
- [ ] Страница `/hr/chat` и `/candidate/chat`
- [ ] Компонент `ChatPage` (основной)
- [ ] Компонент `ChatList`
- [ ] Компонент `ChatListItem`
- [ ] Компонент `ChatArea`
- [ ] Компонент `ChatMessage`
- [ ] EmptyChatState
- [ ] Skeleton для загрузки

**Функционал списка чатов:**
- [ ] Загрузка списка чатов
- [ ] Поиск по чатам
- [ ] Отображение аватара
- [ ] Badge с количеством непрочитанных
- [ ] Сортировка по времени последнего сообщения
- [ ] Выделение активного чата

**Функционал области чата:**
- [ ] Загрузка сообщений
- [ ] Отображение сообщений
- [ ] Отправка сообщений
- [ ] Автопрокрутка к последнему сообщению
- [ ] Textarea с auto-resize
- [ ] Enter для отправки, Shift+Enter для новой строки
- [ ] Индикация отправки (loading)
- [ ] Статус "прочитано" (галочки)

**Realtime:**
- [ ] Подписка на новые сообщения
- [ ] Подписка на обновления чатов
- [ ] Обновление React Query кэша
- [ ] Отписка при размонтировании
- [ ] Обработка ошибок подключения

**Уведомления:**
- [ ] Badge в header с количеством непрочитанных
- [ ] Toast при новом сообщении
- [ ] Автоматическая отметка как прочитано
- [ ] Сброс счетчика при открытии чата

**Адаптивность:**
- [ ] Desktop layout (sidebar + chat area)
- [ ] Mobile layout (либо список, либо чат)
- [ ] Кнопка "Назад" на mobile
- [ ] Responsive дизайн

### 8.3 Интеграция

**Навигация:**
- [ ] Кнопка чата в воронке
- [ ] Кнопка чата в профиле кандидата
- [ ] Иконка чата в header
- [ ] Автоматическое открытие чата по URL параметру
- [ ] Навигация с сохранением контекста

**Автоматизация:**
- [ ] Создание чат-комнаты при покупке кандидата
- [ ] Предложение написать при изменении статуса
- [ ] Интеграция с генерацией документов

**Edge Cases:**
- [ ] Отсутствие чатов
- [ ] Отсутствие сообщений
- [ ] Ошибка отправки сообщения
- [ ] Потеря соединения Realtime
- [ ] Дубликаты сообщений (идемпотентность)

### 8.4 Переводы

**Файлы:**
- [ ] `public/locales/ru/funnel.json`
- [ ] `public/locales/kk/funnel.json`
- [ ] `public/locales/en/funnel.json`
- [ ] `public/locales/ru/chat.json`
- [ ] `public/locales/kk/chat.json`
- [ ] `public/locales/en/chat.json`

**Использование:**
- [ ] Все тексты через `t()`
- [ ] Интерполяция переменных
- [ ] Форматирование дат с учетом локали
- [ ] Множественные формы (если нужно)

### 8.5 Производительность

**Оптимизация запросов:**
- [ ] React Query кэширование
- [ ] staleTime и cacheTime настроены
- [ ] Debounce для поиска
- [ ] Pagination/Infinite scroll (если нужно)

**Оптимизация рендера:**
- [ ] useMemo для фильтрации
- [ ] useCallback для обработчиков
- [ ] React.memo для компонентов (если нужно)
- [ ] Виртуализация длинных списков (опционально)

**Индексы БД:**
- [ ] Все необходимые индексы созданы
- [ ] EXPLAIN ANALYZE для медленных запросов
- [ ] Composite индексы для часто используемых фильтров

### 8.6 Тестирование

**Воронка:**
- [ ] Загрузка вакансии и кандидатов
- [ ] Drag & Drop между колонками
- [ ] Обновление статуса в БД
- [ ] Диалоги подтверждения
- [ ] Переходы на профиль/чат
- [ ] Статистика обновляется

**Чат:**
- [ ] Загрузка списка чатов
- [ ] Поиск чатов
- [ ] Загрузка сообщений
- [ ] Отправка сообщения
- [ ] Получение сообщения (Realtime)
- [ ] Отметка как прочитано
- [ ] Счетчики непрочитанных
- [ ] Уведомления в header

**Кросс-браузерность:**
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

**Адаптивность:**
- [ ] Desktop (>= 1024px)
- [ ] Tablet (768-1023px)
- [ ] Mobile (< 768px)

**Языки:**
- [ ] Русский
- [ ] Казахский
- [ ] Английский

---

## ИТОГО

Создано **production-ready ТЗ** для воронки найма и real-time чата:

✅ **Воронка найма (Kanban)**
- 7 статусов с Drag & Drop
- Диалоги подтверждения
- Интеграция с генерацией документов
- Полная статистика

✅ **Real-time чат**
- Supabase Realtime
- Список чатов с поиском
- Область переписки
- Уведомления и счетчики
- Desktop и Mobile layouts

✅ **База данных**
- RLS политики
- Realtime настройки
- Индексы для производительности

✅ **Переводы**
- 3 языка (ru/kk/en)
- Все тексты интернационализированы

✅ **Производительность**
- React Query кэширование
- Debounce для поиска
- Оптимизация Realtime
- Виртуализация (опционально)

**Готово к разработке!** 🚀

---

**Время реализации:** 7-10 дней  
**Сложность:** Средняя (Drag & Drop) + Высокая (Realtime)  
**Зависимости:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`
