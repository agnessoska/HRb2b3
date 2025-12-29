# План реализации модуля "AI-Ассистент для HR"

## 1. База данных (Supabase)
### Таблица `ai_assistant_conversations`
- `id`: uuid (PK)
- `created_at`: timestamptz
- `updated_at`: timestamptz (триггер)
- `organization_id`: uuid (FK -> organizations)
- `hr_specialist_id`: uuid (FK -> hr_specialists)
- `title`: text (генерируется AI после первого сообщения)
- `context_type`: enum ('global', 'vacancy', 'candidate')
- `context_entity_id`: uuid (nullable)

### Таблица `ai_assistant_messages`
- `id`: uuid (PK)
- `created_at`: timestamptz
- `conversation_id`: uuid (FK -> ai_assistant_conversations)
- `role`: enum ('user', 'assistant')
- `content`: text
- `tokens_used`: integer
- `metadata`: jsonb (источники данных)

### RLS и Безопасность
- Доступ только для аутентифицированных HR из той же организации.
- Добавление индексов по `organization_id` и `conversation_id`.

## 2. Edge Function `ai-assistant`
### Сбор контекста (Context Builder)
- Данные организации: название, описание культуры.
- Вакансии: список активных вакансий с основными требованиями.
- Кандидаты: топ-20 активных кандидатов и их прогресс по тестам.
- Контекстная сущность: полная информация о вакансии или кандидате, если диалог открыт в контексте.

### Стриминг (SSE)
- Реализация через `TransformStream` для передачи чанков текста клиенту.
- Обработка прерываний и ошибок.

### Логирование и Биллинг
- Подсчет токенов (input + output).
- Вызов RPC `deduct_tokens` для списания с баланса организации.
- Запись в `ai_operations_log`.

## 3. Frontend (React + TS)
### Состояние (Zustand)
- `useAIAssistantStore`: управление видимостью панели, текущим `conversation_id`, списком сообщений и статусом загрузки.

### UI Компоненты (FSD: features/ai-assistant)
- `AIAssistantButton`: Floating Action Button с иконкой `Sparkles`.
- `AIAssistantPanel`: Боковая панель (Sheet) с историей диалогов и окном чата.
- `AIAssistantMessage`: Отображение сообщений с поддержкой Markdown (через `react-markdown`).
- `AIAssistantInput`: Текстовое поле с поддержкой `Enter` для отправки.

### API Layer
- Использование `fetch` с `ReadableStream` для обработки стриминга на фронтенде.

## 4. Локализация (i18next)
- Файлы `public/locales/{ru,en,kk}/ai-assistant.json`.
- Подсказки (suggestions) для HR на трех языках.

## 5. График работ (Этапы)
1.  **Бэкенд:** Миграции + Edge Function.
2.  **Фронтенд API:** Типы, Store, методы взаимодействия со стримингом.
3.  **Интерфейс:** Базовая панель чата и кнопка.
4.  **Полировка:** Контекстные кнопки, переводы, анимации.