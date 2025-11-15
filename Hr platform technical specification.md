# Техническое задание: HR Platform v2.0 (Полная переработка)

**Дата создания:** 15 ноября 2025  
**Версия:** 2.0 - Full Rewrite

---

## 📋 СОДЕРЖАНИЕ

### ЧАСТЬ 1: ОБЩАЯ ИНФОРМАЦИЯ И АРХИТЕКТУРА
1. [Введение и принципы](#1-введение-и-принципы)
2. [Технологический стек](#2-технологический-стек)
3. [Архитектура базы данных](#3-архитектура-базы-данных)
4. [Архитектура приложения](#4-архитектура-приложения)

### ЧАСТЬ 2: ДЕТАЛЬНОЕ ОПИСАНИЕ МОДУЛЕЙ
5. [Система аутентификации и организаций](#5-система-аутентификации-и-организаций)
6. [Система тестирования](#6-система-тестирования)
7. [Система AI-анализа](#7-система-ai-анализа)
8. [Рынок талантов](#8-рынок-талантов)

### ЧАСТЬ 3: ЭТАПЫ РАЗРАБОТКИ
9. [Этапы разработки](#9-этапы-разработки)
10. [Дизайн и UI/UX](#10-дизайн-и-uiux)

---

## 1. ВВЕДЕНИЕ И ПРИНЦИПЫ

### 1.1 О проекте

HR Platform v2.0 - это комплексная платформа для автоматизации процессов подбора персонала с интеграцией психометрического тестирования и AI-анализа. Платформа обслуживает три категории пользователей:

1. **Организации с HR-отделами** - крупные компании (банки, корпорации)
2. **Рекрутинговые агентства и частные рекрутеры** - малый и средний бизнес
3. **Кандидаты (соискатели)** - профессионалы, ищущие работу

### 1.2 Ключевые принципы разработки

#### Простота превыше всего
- **"Дешево и сердито"** - избегаем избыточной сложности
- **"Всё идеальное - просто"** - элегантные решения вместо громоздких
- Минимум зависимостей, максимум использования нативных возможностей платформ

#### Продуманная архитектура
- Все user flows и бизнес-логика продуманы **до начала разработки**
- Никаких "узких мест" и недодуманных моментов
- Каждый этап разработки полностью завершает свою часть (production-ready)

#### Удобное администрирование
- **Единственная админ-панель: Supabase Dashboard**
- Все настройки, токены, промпты, модели AI хранятся в БД
- Таблицы спроектированы для удобного просмотра статистики
- Простое управление через Table Editor

#### Модульность и масштабируемость
- Feature-Sliced Design (FSD) архитектура
- Каждый модуль максимально независим
- Возможность добавления новых функций без переделки существующих

#### Интернационализация с первого дня
- Полная поддержка 3 языков: Русский (ru), Казахский (kk), Английский (en)
- react-i18next с отдельными файлами для каждого модуля
- AI-промпты на русском с указанием желаемого языка ответа

#### White-Label
- Минимальная кастомизация: логотип + название организации
- Логотип отображается в header для HR и для кандидатов
- Все брендинговые элементы загружаются из профиля организации

---

## 2. ТЕХНОЛОГИЧЕСКИЙ СТЕК

### 2.1 Frontend

| Технология | Версия | Назначение |
|------------|--------|------------|
| **React** | 18.x | UI библиотека |
| **TypeScript** | 5.x | Типизация |
| **Vite** | 5.x | Сборщик и dev-сервер |
| **Tailwind CSS** | 3.4.17 | Стилизация (точная версия!) |
| **shadcn/ui** | latest | UI компоненты |
| **React Router** | 6.x | Маршрутизация |
| **Zustand** | 4.x | State management |
| **react-i18next** | latest | Интернационализация |
| **Tiptap** | latest | Rich-text редактор |
| **marked** | latest | Markdown → HTML |
| **@tanstack/react-query** | 5.x | Server state management |
| **jsPDF** | latest | Генерация PDF |
| **@dnd-kit/core** | latest | Drag & Drop для воронки |

### 2.2 Backend

| Технология | Назначение |
|------------|------------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | База данных (через Supabase) |
| **Supabase Auth** | Аутентификация |
| **Supabase Storage** | Хранение файлов (логотипы) |
| **Supabase Edge Functions** | Serverless функции для AI |
| **Supabase Realtime** | Real-time чат |

### 2.3 Внешние API

| Сервис | Назначение |
|--------|------------|
| **Anthropic Claude API** | AI-анализ, генерация отчетов |
| **Google Gemini API** | Альтернативная AI-модель |
| **Robokassa** | Приём платежей |

### 2.4 Деплой

- **Frontend:** Vercel (автоматический деплой из GitHub)
- **Backend:** Supabase (hosted)
- **CI/CD:** GitHub Actions

---

## 3. АРХИТЕКТУРА БАЗЫ ДАННЫХ

### 3.1 Общие принципы БД

1. **Читаемость**: Все таблицы и поля имеют понятные названия на английском
2. **Статистика**: Структура позволяет легко получать аналитику через Supabase Dashboard
3. **Денормализация где нужно**: Например, счетчики `tests_completed` в таблице кандидатов обновляются триггерами
4. **JSONB для гибкости**: Используем JSONB для данных, которые могут меняться (результаты тестов, настройки)
5. **Мягкое удаление**: Где критично - используем `deleted_at` вместо физического удаления

### 3.2 Схема базы данных

#### 3.2.1 Таблица: `organizations`

**Описание:** Организации (компании, рекрутинговые агентства)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK, primary key |
| `created_at` | timestamptz | Дата создания |
| `name` | text | Название организации |
| `brand_logo_url` | text | URL логотипа (Supabase Storage) |
| `token_balance` | integer | Баланс токенов (для AI операций) |
| `owner_id` | uuid | FK → auth.users (владелец организации) |

**Индексы:**
- PK на `id`
- Index на `owner_id`

**RLS Политики:**
```sql
-- HR в организации могут видеть свою организацию
CREATE POLICY "organization_members_can_view_own_org"
ON organizations FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT organization_id FROM hr_specialists 
    WHERE user_id = auth.uid()
  )
);

-- Владелец может обновлять организацию
CREATE POLICY "organization_owner_can_update"
ON organizations FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());
```

---

#### 3.2.2 Таблица: `hr_specialists`

**Описание:** HR-специалисты (сотрудники организаций)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK, = user_id из auth.users |
| `user_id` | uuid | FK → auth.users |
| `organization_id` | uuid | FK → organizations |
| `created_at` | timestamptz | Дата регистрации |
| `full_name` | text | ФИО |
| `role` | text | 'owner' или 'member' |
| `is_active` | boolean | Активен ли специалист |

**Индексы:**
- PK на `id`
- Index на `user_id`
- Index на `organization_id`

**RLS Политики:**
```sql
-- HR видит всех в своей организации
CREATE POLICY "hr_can_view_colleagues"
ON hr_specialists FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists 
    WHERE user_id = auth.uid()
  )
);

-- HR может обновлять свой профиль
CREATE POLICY "hr_can_update_own_profile"
ON hr_specialists FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

---

#### 3.2.3 Таблица: `professional_categories`

**Описание:** Категории профессий для кандидатов

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `name_ru` | text | Название на русском |
| `name_kk` | text | Название на казахском |
| `name_en` | text | Название на английском |
| `sort_order` | integer | Порядок сортировки |

**Заполнение:** Справочник заполняется вручную через SQL или Supabase Table Editor

**Примеры категорий:**
- IT и технологии
- Финансы и банковское дело
- Маркетинг и продажи
- HR и управление персоналом
- Медицина и здравоохранение
- Образование
- и т.д. (около 20-30 категорий)

**RLS Политики:**
```sql
-- Все могут читать категории
CREATE POLICY "categories_public_read"
ON professional_categories FOR SELECT
TO authenticated, anon
USING (true);
```

---

#### 3.2.4 Таблица: `candidates`

**Описание:** Кандидаты (соискатели)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK, = user_id из auth.users |
| `user_id` | uuid | FK → auth.users |
| `created_at` | timestamptz | Дата регистрации |
| `updated_at` | timestamptz | Последнее обновление профиля |
| `full_name` | text | ФИО |
| `phone` | text | Телефон |
| `category_id` | uuid | FK → professional_categories |
| `experience` | text | Опыт работы (текстовое поле) |
| `education` | text | Образование |
| `about` | text | О себе |
| `tests_completed` | integer | Количество пройденных тестов (обновляется триггером) |
| `tests_last_updated_at` | timestamptz | Дата последнего обновления тестов |
| `is_public` | boolean | Показывать в "Рынке талантов" |
| `invited_by_hr_id` | uuid | FK → hr_specialists (NULL если свободная регистрация) |
| `invited_by_organization_id` | uuid | FK → organizations (NULL если свободная регистрация) |

**Индексы:**
- PK на `id`
- Index на `user_id`
- Index на `category_id`
- Index на `invited_by_organization_id`
- Index на `is_public` (для рынка талантов)

**RLS Политики:**
```sql
-- Кандидат видит свой профиль
CREATE POLICY "candidates_can_view_own_profile"
ON candidates FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Кандидат обновляет свой профиль
CREATE POLICY "candidates_can_update_own_profile"
ON candidates FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- HR видит кандидатов своей организации (приглашенных или купленных)
CREATE POLICY "hr_can_view_organization_candidates"
ON candidates FOR SELECT
TO authenticated
USING (
  invited_by_organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
  OR id IN (
    SELECT candidate_id FROM applications 
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
  )
);

-- HR видит публичных кандидатов в рынке талантов
CREATE POLICY "hr_can_view_public_candidates"
ON candidates FOR SELECT
TO authenticated
USING (
  is_public = true 
  AND EXISTS (SELECT 1 FROM hr_specialists WHERE user_id = auth.uid())
);
```

---

#### 3.2.5 Таблица: `candidate_skills`

**Описание:** Навыки кандидатов (связь многие-ко-многим через словарь)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `candidate_id` | uuid | FK → candidates |
| `canonical_skill` | text | Каноническое название навыка (английский) |
| `created_at` | timestamptz | Когда добавлен |

**Индексы:**
- PK на `id`
- Composite index на `(candidate_id, canonical_skill)` - уникальный
- Index на `canonical_skill` (для поиска)

**RLS Политики:**
```sql
-- Кандидат управляет своими навыками
CREATE POLICY "candidates_manage_own_skills"
ON candidate_skills FOR ALL
TO authenticated
USING (candidate_id = auth.uid());

-- HR видит навыки своих кандидатов
CREATE POLICY "hr_can_view_candidate_skills"
ON candidate_skills FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates 
    WHERE invited_by_organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
    OR id IN (
      SELECT candidate_id FROM applications 
      WHERE organization_id IN (
        SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
      )
    )
  )
);
```

---

#### 3.2.6 Таблица: `skills_dictionary`

**Описание:** Словарь навыков с переводами и синонимами

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `name` | text | Название навыка (любой язык) |
| `canonical_name` | text | Каноническое имя (английский) |
| `language` | text | Код языка ('ru', 'kk', 'en') |
| `category` | text | Категория (hard/soft/technical/other) |

**Примеры записей:**
```sql
-- JavaScript на разных языках
('JavaScript', 'javascript', 'en', 'technical')
('JavaScript', 'javascript', 'ru', 'technical')
('JavaScript', 'javascript', 'kk', 'technical')

-- Синонимы
('JS', 'javascript', 'en', 'technical')
('джаваскрипт', 'javascript', 'ru', 'technical')

-- Коммуникация
('Communication', 'communication', 'en', 'soft')
('Коммуникабельность', 'communication', 'ru', 'soft')
('Қарым-қатынас', 'communication', 'kk', 'soft')
```

**Индексы:**
- PK на `id`
- Index на `canonical_name`
- GIN index на `name` для полнотекстового поиска
- Index на `(canonical_name, language)` для быстрого перевода

**RLS Политики:**
```sql
-- Все могут читать словарь
CREATE POLICY "skills_dictionary_public_read"
ON skills_dictionary FOR SELECT
TO authenticated, anon
USING (true);
```

**Заполнение:** Словарь наполняется заранее (около 5000+ записей) через SQL-скрипт, покрывающий:
- IT навыки (языки программирования, фреймворки, инструменты)
- Soft skills (коммуникация, лидерство, работа в команде)
- Отраслевые навыки (финансы, маркетинг, медицина и т.д.)
- Инструменты и софт (Excel, Photoshop, SAP и т.д.)

---

#### 3.2.7 Таблица: `invitation_tokens`

**Описание:** Токены для приглашения кандидатов

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `token` | text | Уникальный токен (генерируется на клиенте) |
| `created_at` | timestamptz | Дата создания |
| `created_by_hr_id` | uuid | FK → hr_specialists |
| `organization_id` | uuid | FK → organizations |
| `is_used` | boolean | Использован ли токен |
| `used_at` | timestamptz | Когда использован |
| `used_by_candidate_id` | uuid | FK → candidates (кто использовал) |
| `expires_at` | timestamptz | Срок действия (опционально) |

**Индексы:**
- PK на `id`
- Unique index на `token`
- Index на `organization_id`
- Index на `created_by_hr_id`

**RLS Политики:**
```sql
-- HR видит токены своей организации
CREATE POLICY "hr_can_view_organization_tokens"
ON invitation_tokens FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR создает токены для своей организации
CREATE POLICY "hr_can_create_tokens"
ON invitation_tokens FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- Публичное чтение для валидации при регистрации
CREATE POLICY "public_can_validate_tokens"
ON invitation_tokens FOR SELECT
TO anon
USING (true);
```

---

#### 3.2.8 Таблица: `vacancies`

**Описание:** Вакансии организаций

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Дата создания |
| `updated_at` | timestamptz | Последнее обновление |
| `organization_id` | uuid | FK → organizations |
| `created_by_hr_id` | uuid | FK → hr_specialists |
| `title` | text | Название должности |
| `description` | text | Описание вакансии |
| `requirements` | text | Требования (текстовое поле) |
| `salary_min` | integer | Зарплата от (опционально) |
| `salary_max` | integer | Зарплата до (опционально) |
| `location` | text | Локация (опционально) |
| `employment_type` | text | Тип занятости (full-time/part-time/remote) |
| `ideal_profile` | jsonb | Идеальный психометрический профиль (AI-генерируется) |
| `status` | text | Статус (active/closed/archived) |
| `funnel_counts` | jsonb | Счетчики воронки {invited: 10, testing: 5, ...} |

**Структура `ideal_profile` (jsonb):**
```json
{
  "skills": ["javascript", "react", "typescript"],
  "big_five": {
    "openness": 75,
    "conscientiousness": 80,
    "extraversion": 60,
    "agreeableness": 70,
    "neuroticism": 30
  },
  "mbti": "ENTJ",
  "disc": "D",
  "eq": {
    "self_awareness": 75,
    "self_management": 80,
    "social_awareness": 70,
    "relationship_management": 75
  },
  "soft_skills": {
    "communication": 80,
    "teamwork": 75,
    "critical_thinking": 85,
    "adaptability": 70,
    "initiative": 80
  },
  "motivation": {
    "achievement": 80,
    "power": 60,
    "affiliation": 50,
    "autonomy": 70,
    "security": 40,
    "growth": 85
  }
}
```

**Индексы:**
- PK на `id`
- Index на `organization_id`
- Index на `status`
- Index на `created_by_hr_id`

**RLS Политики:**
```sql
-- HR видит вакансии своей организации
CREATE POLICY "hr_can_view_organization_vacancies"
ON vacancies FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR создает вакансии для своей организации
CREATE POLICY "hr_can_create_vacancies"
ON vacancies FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR обновляет вакансии своей организации
CREATE POLICY "hr_can_update_organization_vacancies"
ON vacancies FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);
```

---

#### 3.2.9 Таблица: `vacancy_skills`

**Описание:** Требуемые навыки для вакансий (многие-ко-многим)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `vacancy_id` | uuid | FK → vacancies |
| `canonical_skill` | text | Каноническое название навыка |
| `is_required` | boolean | Обязательный навык или желательный |
| `created_at` | timestamptz | Когда добавлен |

**Индексы:**
- PK на `id`
- Composite index на `(vacancy_id, canonical_skill)` - уникальный
- Index на `vacancy_id`

**RLS Политики:**
```sql
-- HR управляет навыками своих вакансий
CREATE POLICY "hr_can_manage_vacancy_skills"
ON vacancy_skills FOR ALL
TO authenticated
USING (
  vacancy_id IN (
    SELECT id FROM vacancies 
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
  )
);
```

---

#### 3.2.10 Таблица: `applications`

**Описание:** Связь кандидат-вакансия (воронка найма)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Дата добавления в воронку |
| `updated_at` | timestamptz | Последнее обновление |
| `candidate_id` | uuid | FK → candidates |
| `vacancy_id` | uuid | FK → vacancies |
| `organization_id` | uuid | FK → organizations |
| `status` | text | Статус в воронке (см. ниже) |
| `added_by_hr_id` | uuid | FK → hr_specialists |
| `compatibility_score` | integer | Балл совместимости из "Рынка талантов" |

**Возможные статусы:**
- `invited` - Приглашён
- `testing` - Проходит тесты
- `evaluated` - Оценён (тесты пройдены)
- `interview` - На интервью
- `offer` - Оффер отправлен
- `hired` - Нанят
- `rejected` - Отклонён

**Индексы:**
- PK на `id`
- Composite index на `(candidate_id, vacancy_id)` - уникальный
- Index на `organization_id`
- Index на `vacancy_id`
- Index на `status`

**RLS Политики:**
```sql
-- HR видит applications своей организации
CREATE POLICY "hr_can_view_organization_applications"
ON applications FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR создает applications для своей организации
CREATE POLICY "hr_can_create_applications"
ON applications FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR обновляет applications своей организации
CREATE POLICY "hr_can_update_applications"
ON applications FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- Кандидат видит свои applications
CREATE POLICY "candidates_can_view_own_applications"
ON applications FOR SELECT
TO authenticated
USING (candidate_id = auth.uid());
```

---

### 3.3 Продолжение схемы БД в следующей части

Схема БД продолжается в **Части 2** документа с таблицами:
- `tests` - Справочник тестов
- `test_questions` - Вопросы тестов
- `test_scales` - Шкалы тестов
- `candidate_test_results` - Результаты тестов
- `ai_prompts` - Промпты для AI
- `ai_models` - Настройки моделей AI
- `ai_operations` - Лог AI операций
- `generated_documents` - Сгенерированные документы
- `resume_analysis_results` - Результаты анализа резюме
- `chat_rooms` - Комнаты чата
- `chat_messages` - Сообщения чата
- `payment_transactions` - Транзакции Robokassa
- `token_costs` - Стоимость операций в токенах

---

## 4. АРХИТЕКТУРА ПРИЛОЖЕНИЯ

### 4.1 Структура проекта (FSD)

```
hr-platform/
├── public/                          # Статические файлы
│   ├── locales/                     # Переводы i18n
│   │   ├── ru/                      # Русский
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   ├── dashboard.json
│   │   │   ├── candidates.json
│   │   │   ├── vacancies.json
│   │   │   ├── tests.json
│   │   │   ├── ai-analysis.json
│   │   │   └── talent-market.json
│   │   ├── kk/                      # Казахский (та же структура)
│   │   └── en/                      # Английский (та же структура)
│   └── favicon.ico
│
├── src/
│   ├── app/                         # Инициализация приложения
│   │   ├── providers/               # React провайдеры
│   │   │   ├── SupabaseProvider.tsx
│   │   │   ├── QueryProvider.tsx
│   │   │   ├── I18nProvider.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── router/                  # Конфигурация маршрутов
│   │   │   └── index.tsx
│   │   ├── store/                   # Zustand stores
│   │   │   ├── auth.ts
│   │   │   ├── settings.ts
│   │   │   └── chat.ts
│   │   └── index.tsx                # Entry point
│   │
│   ├── pages/                       # Страницы приложения
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register-by-token/
│   │   ├── hr/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── vacancy/
│   │   │   ├── candidate-profile/
│   │   │   └── talent-market/
│   │   ├── candidate/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── test/
│   │   │   └── results/
│   │   └── public/
│   │       └── document-viewer/
│   │
│   ├── widgets/                     # Сложные составные блоки
│   │   ├── header/
│   │   ├── hr-dashboard-tabs/
│   │   ├── candidate-dashboard-stats/
│   │   └── vacancy-funnel/
│   │
│   ├── features/                    # Бизнес-функции
│   │   ├── auth/
│   │   │   ├── ui/
│   │   │   └── api/
│   │   ├── vacancy-management/
│   │   │   ├── ui/
│   │   │   └── api/
│   │   ├── candidate-management/
│   │   │   ├── ui/
│   │   │   └── api/
│   │   ├── testing-system/
│   │   │   ├── ui/
│   │   │   └── api/
│   │   ├── ai-analysis/
│   │   │   ├── ui/
│   │   │   └── api/
│   │   ├── talent-market/
│   │   │   ├── ui/
│   │   │   └── api/
│   │   ├── chat/
│   │   │   ├── ui/
│   │   │   └── api/
│   │   └── payments/
│   │       ├── ui/
│   │       └── api/
│   │
│   ├── entities/                    # Бизнес-сущности
│   │   ├── organization/
│   │   │   ├── model/
│   │   │   ├── ui/
│   │   │   └── api/
│   │   ├── hr-specialist/
│   │   ├── candidate/
│   │   ├── vacancy/
│   │   ├── test/
│   │   └── skill/
│   │
│   └── shared/                      # Общий код
│       ├── ui/                      # shadcn/ui компоненты + кастомные
│       │   ├── button.tsx
│       │   ├── input.tsx
│       │   ├── dialog.tsx
│       │   ├── layouts/
│       │   │   ├── DashboardLayout.tsx
│       │   │   └── AuthLayout.tsx
│       │   └── ...
│       ├── lib/                     # Утилиты
│       │   ├── supabase.ts
│       │   ├── i18n.ts
│       │   ├── utils.ts
│       │   └── constants.ts
│       ├── hooks/                   # React hooks
│       │   ├── useAuth.ts
│       │   ├── useTranslation.ts
│       │   └── useOrganization.ts
│       ├── types/                   # TypeScript типы
│       │   ├── database.ts          # Supabase types
│       │   ├── api.ts
│       │   └── common.ts
│       └── api/                     # API клиенты
│           ├── supabase/
│           └── anthropic/
│
├── supabase/                        # Supabase проект
│   ├── migrations/                  # SQL миграции
│   ├── functions/                   # Edge Functions
│   │   ├── analyze-resumes/
│   │   ├── generate-full-analysis/
│   │   ├── generate-ideal-profile/
│   │   ├── generate-document/
│   │   ├── generate-structured-interview/
│   │   └── compare-candidates/
│   └── config.toml
│
├── .env.example                     # Пример переменных окружения
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

### 4.2 Ключевые принципы организации кода

1. **FSD (Feature-Sliced Design):**
   - Четкое разделение по слоям: app → pages → widgets → features → entities → shared
   - Каждый модуль максимально независим

2. **Colocation:**
   - Связанные файлы (компонент, стили, тесты) находятся рядом
   - API функции рядом с UI компонентами

3. **Naming conventions:**
   - Файлы компонентов: PascalCase.tsx (e.g., `CandidateCard.tsx`)
   - API файлы: camelCase.ts (e.g., `getCandidates.ts`)
   - Хуки: useXxx.ts (e.g., `useAuth.ts`)

4. **Export strategy:**
   - Public API через index.ts в каждой папке
   - Скрываем внутренние детали реализации

---

**КОНЕЦ ЧАСТИ 1**

Часть 2 содержит:
- Продолжение схемы БД (оставшиеся таблицы)
- Детальное описание всех 6 психометрических тестов
- Систему скоринга в "Рынке талантов"
- Триггеры и RPC функции
- Edge Functions для AI

# Техническое задание: HR Platform v2.0 - ЧАСТЬ 2

**Продолжение Части 1**

---

## 3.3 Продолжение схемы базы данных

### 3.3.1 Таблица: `tests`

**Описание:** Справочник психометрических тестов

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `code` | text | Уникальный код теста (big_five, mbti, disc, eq, soft_skills, motivation) |
| `name_ru` | text | Название на русском |
| `name_kk` | text | Название на казахском |
| `name_en` | text | Название на английском |
| `description_ru` | text | Описание на русском |
| `description_kk` | text | Описание на казахском |
| `description_en` | text | Описание на английском |
| `test_type` | text | Тип теста (scale/dichotomy/style) |
| `total_questions` | integer | Общее количество вопросов |
| `time_limit_minutes` | integer | Ограничение по времени (NULL = без ограничения) |
| `sort_order` | integer | Порядок отображения |
| `is_active` | boolean | Активен ли тест |

**Типы тестов (`test_type`):**
- `scale` - Шкальные тесты (Big Five, EQ, Soft Skills, Motivation)
- `dichotomy` - Дихотомии (MBTI)
- `style` - Стили (DISC)

**Заполнение:** 6 записей для каждого теста

**RLS Политики:**
```sql
-- Все могут читать активные тесты
CREATE POLICY "tests_public_read"
ON tests FOR SELECT
TO authenticated, anon
USING (is_active = true);
```

---

### 3.3.2 Таблица: `test_scales`

**Описание:** Шкалы для тестов (субшкалы)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `test_id` | uuid | FK → tests |
| `code` | text | Код шкалы (openness, extraversion, etc.) |
| `name_ru` | text | Название на русском |
| `name_kk` | text | Название на казахском |
| `name_en` | text | Название на английском |
| `description_ru` | text | Описание на русском |
| `description_kk` | text | Описание на казахском |
| `description_en` | text | Описание на английском |
| `min_value` | integer | Минимальное значение (обычно 0) |
| `max_value` | integer | Максимальное значение (обычно 100) |
| `optimal_value` | integer | Оптимальное значение (для скоринга, NULL если нет) |
| `scale_type` | text | Тип шкалы для скоринга (optimal/higher_is_better/lower_is_better) |
| `sort_order` | integer | Порядок отображения |

**Типы шкал (`scale_type`):**
- `optimal` - Есть оптимальное значение, отклонение в любую сторону хуже (например, Agreeableness - слишком высокая = слишком податливый, слишком низкая = конфликтный)
- `higher_is_better` - Чем выше, тем лучше (например, Conscientiousness, большинство EQ шкал)
- `lower_is_better` - Чем ниже, тем лучше (например, Neuroticism)

**Примеры записей для Big Five:**
```sql
-- Openness - higher is better
(test_id, 'openness', 'Открытость опыту', 'Тәжірибеге ашықтық', 'Openness', ..., 0, 100, NULL, 'higher_is_better', 1)

-- Conscientiousness - higher is better
(test_id, 'conscientiousness', 'Добросовестность', 'Адалдық', 'Conscientiousness', ..., 0, 100, NULL, 'higher_is_better', 2)

-- Extraversion - optimal
(test_id, 'extraversion', 'Экстраверсия', 'Экстраверсия', 'Extraversion', ..., 0, 100, 50, 'optimal', 3)

-- Agreeableness - optimal
(test_id, 'agreeableness', 'Доброжелательность', 'Ілтипаттылық', 'Agreeableness', ..., 0, 100, 65, 'optimal', 4)

-- Neuroticism - lower is better
(test_id, 'neuroticism', 'Нейротизм', 'Нейротизм', 'Neuroticism', ..., 0, 100, NULL, 'lower_is_better', 5)
```

**RLS Политики:**
```sql
-- Все могут читать шкалы
CREATE POLICY "test_scales_public_read"
ON test_scales FOR SELECT
TO authenticated, anon
USING (true);
```

---

### 3.3.3 Таблица: `test_questions`

**Описание:** Вопросы для тестов

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `test_id` | uuid | FK → tests |
| `question_number` | integer | Порядковый номер вопроса |
| `text_ru` | text | Текст вопроса на русском |
| `text_kk` | text | Текст вопроса на казахском |
| `text_en` | text | Текст вопроса на английском |
| `scale_code` | text | Код шкалы (для scale/dichotomy типов) |
| `reverse_scored` | boolean | Обратный подсчет баллов |
| `options` | jsonb | Варианты ответов (для scale типов) |

**Структура `options` для шкальных тестов (Big Five, EQ, Soft Skills, Motivation):**
```json
{
  "ru": [
    "Совершенно не согласен",
    "Скорее не согласен",
    "Нейтрально",
    "Скорее согласен",
    "Полностью согласен"
  ],
  "kk": [
    "Мүлдем келіспеймін",
    "Келіспеймін",
    "Бейтарап",
    "Келісемін",
    "Толығымен келісемін"
  ],
  "en": [
    "Strongly disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly agree"
  ],
  "values": [0, 25, 50, 75, 100]
}
```

**Структура `options` для MBTI (дихотомия):**
```json
{
  "ru": ["Да", "Нет"],
  "kk": ["Иә", "Жоқ"],
  "en": ["Yes", "No"],
  "values": ["E", "I"]  // для вопроса E/I шкалы
}
```

**Структура `options` для DISC:**
```json
{
  "ru": [
    "Очень похоже на меня",
    "Похоже на меня",
    "Не очень похоже на меня",
    "Совсем не похоже на меня"
  ],
  "kk": [...],
  "en": [...],
  "values": [3, 2, 1, 0]
}
```

**Индексы:**
- PK на `id`
- Index на `test_id`
- Composite index на `(test_id, question_number)` - уникальный

**RLS Политики:**
```sql
-- Все могут читать вопросы
CREATE POLICY "test_questions_public_read"
ON test_questions FOR SELECT
TO authenticated, anon
USING (true);
```

---

### 3.3.4 Таблица: `candidate_test_results`

**Описание:** Результаты прохождения тестов кандидатами

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `candidate_id` | uuid | FK → candidates |
| `test_id` | uuid | FK → tests |
| `started_at` | timestamptz | Начало теста |
| `completed_at` | timestamptz | Завершение теста |
| `answers` | jsonb | Ответы кандидата |
| `raw_scores` | jsonb | Сырые баллы по шкалам |
| `normalized_scores` | jsonb | Нормализованные баллы (0-100) |
| `detailed_result` | text | Итоговый результат (для MBTI/DISC) |
| `retake_available_at` | timestamptz | Когда можно пересдать |

**Структура `answers` (jsonb):**
```json
{
  "1": 75,  // номер вопроса: выбранное значение
  "2": 50,
  "3": 100,
  ...
}
```

**Структура `raw_scores` (jsonb) для Big Five:**
```json
{
  "openness": 75,
  "conscientiousness": 85,
  "extraversion": 60,
  "agreeableness": 70,
  "neuroticism": 30
}
```

**Структура `normalized_scores` (jsonb) - то же самое, но нормализовано 0-100:**
```json
{
  "openness": 75,
  "conscientiousness": 85,
  "extraversion": 60,
  "agreeableness": 70,
  "neuroticism": 30
}
```

**Структура `detailed_result` для MBTI:**
```
"ENTJ"
```

**Структура `detailed_result` для DISC:**
```
"D"  // или "I", "S", "C", или комбинация "DI"
```

**Индексы:**
- PK на `id`
- Composite index на `(candidate_id, test_id)` - уникальный
- Index на `candidate_id`
- Index на `test_id`

**RLS Политики:**
```sql
-- Кандидат видит свои результаты
CREATE POLICY "candidates_can_view_own_results"
ON candidate_test_results FOR SELECT
TO authenticated
USING (candidate_id = auth.uid());

-- Кандидат создает свои результаты (при прохождении)
CREATE POLICY "candidates_can_create_own_results"
ON candidate_test_results FOR INSERT
TO authenticated
WITH CHECK (candidate_id = auth.uid());

-- HR видит результаты своих кандидатов
CREATE POLICY "hr_can_view_candidate_results"
ON candidate_test_results FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates 
    WHERE invited_by_organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
    OR id IN (
      SELECT candidate_id FROM applications 
      WHERE organization_id IN (
        SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
      )
    )
  )
);
```

---

### 3.3.5 Таблица: `ai_prompts`

**Описание:** Промпты для различных AI операций

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `operation_type` | text | Тип операции (см. ниже) |
| `version` | text | Версия промпта (v1, v2, ...) |
| `prompt_text` | text | Текст промпта |
| `is_active` | boolean | Активна ли эта версия |
| `created_at` | timestamptz | Дата создания |
| `updated_at` | timestamptz | Дата обновления |

**Типы операций (`operation_type`):**
- `resume_analysis` - Анализ резюме
- `full_analysis` - Полный анализ кандидата
- `candidate_comparison` - Сравнение кандидатов
- `ideal_profile_generation` - Генерация идеального профиля вакансии
- `interview_invitation` - Приглашение на интервью
- `job_offer` - Оффер
- `rejection_letter` - Отказ
- `structured_interview` - Структурированное интервью

**Индексы:**
- PK на `id`
- Composite index на `(operation_type, version)` - уникальный
- Index на `operation_type`
- Index на `is_active`

**RLS Политики:**
```sql
-- Edge Functions читают промпты (через service role)
-- HR не видят промпты (это внутренняя логика)
```

**Примечание:** Промпты редактируются через Supabase Table Editor администратором системы

---

### 3.3.6 Таблица: `ai_models`

**Описание:** Настройка моделей AI для разных операций

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `operation_type` | text | Тип операции (из списка выше) |
| `provider` | text | Провайдер (anthropic/google) |
| `model_name` | text | Название модели (claude-sonnet-4-5-20250514, gemini-1.5-flash) |
| `is_active` | boolean | Используется ли эта модель для операции |
| `max_tokens` | integer | Максимум токенов для ответа |
| `temperature` | numeric | Температура (0.0 - 1.0) |
| `created_at` | timestamptz | Дата добавления |

**Примеры записей:**
```sql
('resume_analysis', 'anthropic', 'claude-sonnet-4-5-20250514', true, 4000, 0.3, ...)
('full_analysis', 'anthropic', 'claude-sonnet-4-5-20250514', true, 8000, 0.5, ...)
('ideal_profile_generation', 'google', 'gemini-1.5-flash', true, 2000, 0.3, ...)
```

**Индексы:**
- PK на `id`
- Composite index на `(operation_type, is_active)` - для быстрого поиска активной модели

**RLS Политики:**
```sql
-- Edge Functions читают модели (через service role)
```

**Примечание:** Администратор может в любой момент переключить модель для операции через Table Editor

---

### 3.3.7 Таблица: `token_costs`

**Описание:** Стоимость операций в токенах

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `operation_type` | text | Тип операции |
| `cost_tokens` | integer | Стоимость в токенах (для не-AI операций) |
| `description_ru` | text | Описание на русском |
| `description_kk` | text | Описание на казахском |
| `description_en` | text | Описание на английском |
| `is_active` | boolean | Активна ли эта цена |

**Примеры записей:**
```sql
-- AI операции списывают реальные токены по 1:1, не нуждаются в записях здесь

-- Не-AI операции:
('create_invitation_token', 500, 'Создание пригласительной ссылки', ..., true)
('acquire_candidate_from_market', 1000, 'Покупка кандидата из Рынка талантов', ..., true)
```

**Индексы:**
- PK на `id`
- Unique index на `operation_type`

**RLS Политики:**
```sql
-- Все могут читать стоимости
CREATE POLICY "token_costs_public_read"
ON token_costs FOR SELECT
TO authenticated
USING (is_active = true);
```

---

### 3.3.8 Таблица: `ai_operations_log`

**Описание:** Лог всех AI операций для аудита и статистики

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Дата операции |
| `organization_id` | uuid | FK → organizations |
| `hr_specialist_id` | uuid | FK → hr_specialists (кто инициировал) |
| `operation_type` | text | Тип операции |
| `model_used` | text | Использованная модель |
| `prompt_version` | text | Версия промпта |
| `input_tokens` | integer | Токены на вход |
| `output_tokens` | integer | Токены на выход |
| `total_tokens` | integer | Всего токенов |
| `success` | boolean | Успешна ли операция |
| `error_message` | text | Сообщение об ошибке (если есть) |
| `metadata` | jsonb | Дополнительные данные (ID кандидата, вакансии и т.д.) |

**Индексы:**
- PK на `id`
- Index на `organization_id`
- Index на `created_at` (для временных запросов)
- Index на `operation_type`

**RLS Политики:**
```sql
-- Владелец организации видит лог своей организации
CREATE POLICY "org_owner_can_view_operations_log"
ON ai_operations_log FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);
```

---

### 3.3.9 Таблица: `generated_documents`

**Описание:** Сгенерированные AI документы (офферы, отказы, интервью)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Дата генерации |
| `updated_at` | timestamptz | Последнее редактирование |
| `organization_id` | uuid | FK → organizations |
| `candidate_id` | uuid | FK → candidates |
| `vacancy_id` | uuid | FK → vacancies (опционально) |
| `created_by_hr_id` | uuid | FK → hr_specialists |
| `document_type` | text | Тип документа (см. ниже) |
| `title` | text | Заголовок документа |
| `content_markdown` | text | Контент в Markdown (от AI) |
| `content_html` | text | Контент в HTML (для редактирования/отображения) |
| `is_public` | boolean | Доступен ли по публичной ссылке |

**Типы документов (`document_type`):**
- `interview_invitation` - Приглашение на интервью
- `job_offer` - Оффер
- `rejection_letter` - Отказ
- `structured_interview` - Структурированное интервью

**Индексы:**
- PK на `id`
- Index на `organization_id`
- Index на `candidate_id`
- Index на `created_by_hr_id`

**RLS Политики:**
```sql
-- HR видит документы своей организации
CREATE POLICY "hr_can_view_organization_documents"
ON generated_documents FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR создает документы для своей организации
CREATE POLICY "hr_can_create_documents"
ON generated_documents FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR обновляет документы своей организации
CREATE POLICY "hr_can_update_documents"
ON generated_documents FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- Публичные документы доступны всем (для просмотра по ссылке)
CREATE POLICY "public_documents_readable"
ON generated_documents FOR SELECT
TO anon
USING (is_public = true);

-- Кандидат видит свои документы
CREATE POLICY "candidates_can_view_own_documents"
ON generated_documents FOR SELECT
TO authenticated
USING (candidate_id = auth.uid());
```

---

### 3.3.10 Таблица: `candidate_full_analysis`

**Описание:** Полные AI-анализы кандидатов

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Дата генерации |
| `updated_at` | timestamptz | Последнее редактирование |
| `organization_id` | uuid | FK → organizations |
| `candidate_id` | uuid | FK → candidates |
| `vacancy_ids` | uuid[] | Массив ID вакансий (для какиx анализировали) |
| `created_by_hr_id` | uuid | FK → hr_specialists |
| `content_markdown` | text | Контент в Markdown (от AI) |
| `content_html` | text | Контент в HTML (для редактирования) |
| `is_public` | boolean | Доступен ли по публичной ссылке |

**Примечание:** Один кандидат = один полный анализ (не перегенерируется)

**Индексы:**
- PK на `id`
- Unique index на `(organization_id, candidate_id)`
- Index на `candidate_id`

**RLS Политики:**
```sql
-- HR видит анализы своей организации
CREATE POLICY "hr_can_view_organization_analysis"
ON candidate_full_analysis FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR создает анализы (один раз)
CREATE POLICY "hr_can_create_analysis"
ON candidate_full_analysis FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR обновляет анализы (редактирование)
CREATE POLICY "hr_can_update_analysis"
ON candidate_full_analysis FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- Публичные анализы доступны всем
CREATE POLICY "public_analysis_readable"
ON candidate_full_analysis FOR SELECT
TO anon
USING (is_public = true);
```

---

### 3.3.11 Таблица: `candidate_comparisons`

**Описание:** Результаты AI-сравнений кандидатов

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Дата генерации |
| `organization_id` | uuid | FK → organizations |
| `vacancy_id` | uuid | FK → vacancies |
| `created_by_hr_id` | uuid | FK → hr_specialists |
| `candidate_ids` | uuid[] | Массив ID сравниваемых кандидатов |
| `content_markdown` | text | Контент в Markdown (от AI) |
| `content_html` | text | Контент в HTML |
| `ranking` | jsonb | Ранжирование кандидатов |

**Структура `ranking` (jsonb):**
```json
{
  "ranked_candidates": [
    {
      "candidate_id": "uuid",
      "rank": 1,
      "score": 95,
      "summary": "Идеально подходит..."
    },
    {
      "candidate_id": "uuid",
      "rank": 2,
      "score": 85,
      "summary": "Хорошо подходит..."
    }
  ]
}
```

**Индексы:**
- PK на `id`
- Index на `organization_id`
- Index на `vacancy_id`

**RLS Политики:**
```sql
-- HR видит сравнения своей организации
CREATE POLICY "hr_can_view_organization_comparisons"
ON candidate_comparisons FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR создает сравнения
CREATE POLICY "hr_can_create_comparisons"
ON candidate_comparisons FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);
```

---

### 3.3.12 Таблица: `resume_analysis_results`

**Описание:** Результаты быстрого анализа резюме (вкладка 1)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Дата анализа |
| `organization_id` | uuid | FK → organizations |
| `created_by_hr_id` | uuid | FK → hr_specialists |
| `vacancy_ids` | uuid[] | Массив ID вакансий (для каких анализировали) |
| `resume_count` | integer | Количество резюме |
| `content_markdown` | text | Результат в Markdown |
| `content_html` | text | Результат в HTML |

**Примечание:** Резюме сами НЕ сохраняются в БД, только результаты анализа

**Индексы:**
- PK на `id`
- Index на `organization_id`
- Index на `created_by_hr_id`
- Index на `created_at`

**RLS Политики:**
```sql
-- HR видит анализы резюме своей организации
CREATE POLICY "hr_can_view_organization_resume_analysis"
ON resume_analysis_results FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR создает анализы резюме
CREATE POLICY "hr_can_create_resume_analysis"
ON resume_analysis_results FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
  )
);
```

---

### 3.3.13 Таблица: `chat_rooms`

**Описание:** Комнаты чата между HR и кандидатами

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Дата создания |
| `organization_id` | uuid | FK → organizations |
| `hr_specialist_id` | uuid | FK → hr_specialists |
| `candidate_id` | uuid | FK → candidates |
| `last_message_at` | timestamptz | Время последнего сообщения |
| `unread_count_hr` | integer | Непрочитанные сообщения для HR |
| `unread_count_candidate` | integer | Непрочитанные сообщения для кандидата |

**Индексы:**
- PK на `id`
- Composite index на `(hr_specialist_id, candidate_id)` - уникальный
- Index на `organization_id`
- Index на `last_message_at` (для сортировки)

**RLS Политики:**
```sql
-- HR видит свои чаты
CREATE POLICY "hr_can_view_own_chats"
ON chat_rooms FOR SELECT
TO authenticated
USING (hr_specialist_id = auth.uid());

-- Кандидат видит свои чаты
CREATE POLICY "candidates_can_view_own_chats"
ON chat_rooms FOR SELECT
TO authenticated
USING (candidate_id = auth.uid());

-- Создание чата при "покупке" кандидата (через триггер/функцию)
CREATE POLICY "hr_can_create_chats"
ON chat_rooms FOR INSERT
TO authenticated
WITH CHECK (hr_specialist_id = auth.uid());
```

---

### 3.3.14 Таблица: `chat_messages`

**Описание:** Сообщения в чатах

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Время отправки |
| `chat_room_id` | uuid | FK → chat_rooms |
| `sender_id` | uuid | FK → auth.users |
| `sender_type` | text | Тип отправителя (hr/candidate) |
| `message_text` | text | Текст сообщения |
| `is_read` | boolean | Прочитано ли сообщение |
| `read_at` | timestamptz | Время прочтения |

**Индексы:**
- PK на `id`
- Index на `chat_room_id`
- Index на `created_at`
- Index на `is_read`

**RLS Политики:**
```sql
-- Участники чата видят сообщения
CREATE POLICY "chat_participants_can_view_messages"
ON chat_messages FOR SELECT
TO authenticated
USING (
  chat_room_id IN (
    SELECT id FROM chat_rooms 
    WHERE hr_specialist_id = auth.uid() OR candidate_id = auth.uid()
  )
);

-- Участники чата отправляют сообщения
CREATE POLICY "chat_participants_can_send_messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  chat_room_id IN (
    SELECT id FROM chat_rooms 
    WHERE hr_specialist_id = auth.uid() OR candidate_id = auth.uid()
  )
  AND sender_id = auth.uid()
);

-- Участники чата обновляют статус прочтения
CREATE POLICY "chat_participants_can_update_read_status"
ON chat_messages FOR UPDATE
TO authenticated
USING (
  chat_room_id IN (
    SELECT id FROM chat_rooms 
    WHERE hr_specialist_id = auth.uid() OR candidate_id = auth.uid()
  )
);
```

---

### 3.3.15 Таблица: `payment_transactions`

**Описание:** Транзакции покупки токенов через Robokassa

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Дата создания транзакции |
| `updated_at` | timestamptz | Последнее обновление |
| `organization_id` | uuid | FK → organizations |
| `amount` | numeric | Сумма в рублях |
| `tokens_amount` | integer | Количество купленных токенов |
| `status` | text | Статус (pending/success/failed/cancelled) |
| `robokassa_invoice_id` | text | ID инвойса Robokassa |
| `robokassa_data` | jsonb | Данные от Robokassa |
| `completed_at` | timestamptz | Дата завершения |

**Индексы:**
- PK на `id`
- Index на `organization_id`
- Index на `robokassa_invoice_id`
- Index на `status`

**RLS Политики:**
```sql
-- Владелец организации видит транзакции
CREATE POLICY "org_owner_can_view_transactions"
ON payment_transactions FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM hr_specialists 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);
```

---

## 3.4 Триггеры базы данных

### 3.4.1 Триггер: `handle_new_user`

**Назначение:** Автоматическое создание профиля при регистрации

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  org_id uuid;
  org_name text;
  welcome_tokens integer;
BEGIN
  -- Получаем роль из метаданных
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Получаем стартовый баланс токенов из переменной окружения или константы
  SELECT COALESCE(current_setting('app.welcome_tokens', true)::integer, 5000) 
  INTO welcome_tokens;
  
  IF user_role = 'hr' THEN
    -- Для HR: создаем организацию
    org_name := NEW.raw_user_meta_data->>'organization_name';
    
    INSERT INTO organizations (id, name, owner_id, token_balance)
    VALUES (gen_random_uuid(), org_name, NEW.id, welcome_tokens)
    RETURNING id INTO org_id;
    
    -- Создаем профиль HR как владельца
    INSERT INTO hr_specialists (
      id, user_id, organization_id, full_name, role, is_active
    )
    VALUES (
      NEW.id,
      NEW.id,
      org_id,
      NEW.raw_user_meta_data->>'full_name',
      'owner',
      true
    );
    
  ELSIF user_role = 'candidate' THEN
    -- Для кандидата: создаем профиль
    INSERT INTO candidates (
      id,
      user_id,
      full_name,
      phone,
      category_id,
      experience,
      education,
      about,
      tests_completed,
      is_public,
      invited_by_hr_id,
      invited_by_organization_id
    )
    VALUES (
      NEW.id,
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'phone',
      (NEW.raw_user_meta_data->>'category_id')::uuid,
      NEW.raw_user_meta_data->>'experience',
      NEW.raw_user_meta_data->>'education',
      NEW.raw_user_meta_data->>'about',
      0,
      COALESCE((NEW.raw_user_meta_data->>'is_public')::boolean, false),
      (NEW.raw_user_meta_data->>'invited_by_hr_id')::uuid,
      (NEW.raw_user_meta_data->>'invited_by_organization_id')::uuid
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Создаем триггер
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### 3.4.2 Триггер: `update_candidate_test_count`

**Назначение:** Автоматическое обновление счетчика пройденных тестов

```sql
CREATE OR REPLACE FUNCTION public.update_candidate_test_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- При INSERT или UPDATE результата теста
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL) THEN
    UPDATE candidates
    SET 
      tests_completed = (
        SELECT COUNT(*) 
        FROM candidate_test_results 
        WHERE candidate_id = NEW.candidate_id AND completed_at IS NOT NULL
      ),
      tests_last_updated_at = NEW.completed_at
    WHERE id = NEW.candidate_id;
  END IF;
  
  -- При DELETE результата теста (для пересдачи)
  IF TG_OP = 'DELETE' THEN
    UPDATE candidates
    SET 
      tests_completed = (
        SELECT COUNT(*) 
        FROM candidate_test_results 
        WHERE candidate_id = OLD.candidate_id AND completed_at IS NOT NULL
      )
    WHERE id = OLD.candidate_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Создаем триггеры
DROP TRIGGER IF EXISTS recalculate_candidate_test_stats_on_insert ON candidate_test_results;
CREATE TRIGGER recalculate_candidate_test_stats_on_insert
  AFTER INSERT ON candidate_test_results
  FOR EACH ROW EXECUTE FUNCTION public.update_candidate_test_count();

DROP TRIGGER IF EXISTS recalculate_candidate_test_stats_on_update ON candidate_test_results;
CREATE TRIGGER recalculate_candidate_test_stats_on_update
  AFTER UPDATE ON candidate_test_results
  FOR EACH ROW EXECUTE FUNCTION public.update_candidate_test_count();

DROP TRIGGER IF EXISTS recalculate_candidate_test_stats_on_delete ON candidate_test_results;
CREATE TRIGGER recalculate_candidate_test_stats_on_delete
  AFTER DELETE ON candidate_test_results
  FOR EACH ROW EXECUTE FUNCTION public.update_candidate_test_count();
```

---

### 3.4.3 Триггер: `update_vacancy_funnel_counts`

**Назначение:** Автоматическое обновление счетчиков воронки в вакансии

```sql
CREATE OR REPLACE FUNCTION public.update_vacancy_funnel_counts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Определяем ID вакансии
  IF TG_OP = 'DELETE' THEN
    v_id := OLD.vacancy_id;
  ELSE
    v_id := NEW.vacancy_id;
  END IF;
  
  -- Пересчитываем счетчики
  UPDATE vacancies
  SET funnel_counts = (
    SELECT jsonb_object_agg(status, count)
    FROM (
      SELECT status, COUNT(*)::integer as count
      FROM applications
      WHERE vacancy_id = v_id
      GROUP BY status
    ) counts
  )
  WHERE id = v_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Создаем триггеры
DROP TRIGGER IF EXISTS update_vacancy_funnel_on_insert ON applications;
CREATE TRIGGER update_vacancy_funnel_on_insert
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION public.update_vacancy_funnel_counts();

DROP TRIGGER IF EXISTS update_vacancy_funnel_on_update ON applications;
CREATE TRIGGER update_vacancy_funnel_on_update
  AFTER UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION public.update_vacancy_funnel_counts();

DROP TRIGGER IF EXISTS update_vacancy_funnel_on_delete ON applications;
CREATE TRIGGER update_vacancy_funnel_on_delete
  AFTER DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION public.update_vacancy_funnel_counts();
```

---

### 3.4.4 Триггер: `update_chat_room_on_message`

**Назначение:** Обновление времени последнего сообщения и счетчиков непрочитанных

```sql
CREATE OR REPLACE FUNCTION public.update_chat_room_on_message()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Обновляем last_message_at
  UPDATE chat_rooms
  SET last_message_at = NEW.created_at
  WHERE id = NEW.chat_room_id;
  
  -- Увеличиваем счетчик непрочитанных для получателя
  IF NEW.sender_type = 'hr' THEN
    UPDATE chat_rooms
    SET unread_count_candidate = unread_count_candidate + 1
    WHERE id = NEW.chat_room_id;
  ELSE
    UPDATE chat_rooms
    SET unread_count_hr = unread_count_hr + 1
    WHERE id = NEW.chat_room_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Создаем триггер
DROP TRIGGER IF EXISTS update_chat_room_on_new_message ON chat_messages;
CREATE TRIGGER update_chat_room_on_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_chat_room_on_message();
```

---

## 3.5 RPC Functions (Remote Procedure Calls)

### 3.5.1 Функция: `calculate_test_results`

**Назначение:** Расчет результатов теста на основе ответов

```sql
CREATE OR REPLACE FUNCTION public.calculate_test_results(
  p_test_id uuid,
  p_answers jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_test_type text;
  v_raw_scores jsonb := '{}'::jsonb;
  v_normalized_scores jsonb := '{}'::jsonb;
  v_detailed_result text := NULL;
  v_question record;
  v_scale_code text;
  v_answer_value numeric;
  v_scale_totals jsonb := '{}'::jsonb;
  v_scale_counts jsonb := '{}'::jsonb;
  v_scale record;
BEGIN
  -- Получаем тип теста
  SELECT test_type INTO v_test_type FROM tests WHERE id = p_test_id;
  
  IF v_test_type = 'scale' THEN
    -- Для шкальных тестов (Big Five, EQ, Soft Skills, Motivation)
    
    -- Проходим по всем вопросам теста
    FOR v_question IN 
      SELECT question_number, scale_code, reverse_scored, options
      FROM test_questions
      WHERE test_id = p_test_id
    LOOP
      -- Получаем ответ кандидата
      v_answer_value := (p_answers->>v_question.question_number::text)::numeric;
      
      -- Если вопрос с обратным подсчетом
      IF v_question.reverse_scored THEN
        v_answer_value := 100 - v_answer_value;
      END IF;
      
      -- Накапливаем баллы по шкале
      v_scale_code := v_question.scale_code;
      v_scale_totals := jsonb_set(
        v_scale_totals,
        ARRAY[v_scale_code],
        to_jsonb(COALESCE((v_scale_totals->>v_scale_code)::numeric, 0) + v_answer_value)
      );
      v_scale_counts := jsonb_set(
        v_scale_counts,
        ARRAY[v_scale_code],
        to_jsonb(COALESCE((v_scale_counts->>v_scale_code)::integer, 0) + 1)
      );
    END LOOP;
    
    -- Вычисляем средние значения (нормализованные баллы)
    FOR v_scale IN 
      SELECT code FROM test_scales WHERE test_id = p_test_id
    LOOP
      v_normalized_scores := jsonb_set(
        v_normalized_scores,
        ARRAY[v_scale.code],
        to_jsonb(ROUND((v_scale_totals->>v_scale.code)::numeric / (v_scale_counts->>v_scale.code)::numeric))
      );
    END LOOP;
    
    v_raw_scores := v_normalized_scores;
    
  ELSIF v_test_type = 'dichotomy' THEN
    -- Для MBTI (дихотомии)
    DECLARE
      v_ei_count integer := 0;
      v_sn_count integer := 0;
      v_tf_count integer := 0;
      v_jp_count integer := 0;
      v_ei_total integer := 0;
      v_sn_total integer := 0;
      v_tf_total integer := 0;
      v_jp_total integer := 0;
    BEGIN
      FOR v_question IN 
        SELECT question_number, scale_code, options
        FROM test_questions
        WHERE test_id = p_test_id
      LOOP
        v_answer_value := (p_answers->>v_question.question_number::text)::numeric;
        
        IF v_question.scale_code = 'EI' THEN
          v_ei_total := v_ei_total + 1;
          IF v_answer_value = 1 THEN v_ei_count := v_ei_count + 1; END IF;
        ELSIF v_question.scale_code = 'SN' THEN
          v_sn_total := v_sn_total + 1;
          IF v_answer_value = 1 THEN v_sn_count := v_sn_count + 1; END IF;
        ELSIF v_question.scale_code = 'TF' THEN
          v_tf_total := v_tf_total + 1;
          IF v_answer_value = 1 THEN v_tf_count := v_tf_count + 1; END IF;
        ELSIF v_question.scale_code = 'JP' THEN
          v_jp_total := v_jp_total + 1;
          IF v_answer_value = 1 THEN v_jp_count := v_jp_count + 1; END IF;
        END IF;
      END LOOP;
      
      -- Определяем типы
      v_detailed_result := '';
      v_detailed_result := v_detailed_result || (CASE WHEN v_ei_count::float / v_ei_total > 0.5 THEN 'E' ELSE 'I' END);
      v_detailed_result := v_detailed_result || (CASE WHEN v_sn_count::float / v_sn_total > 0.5 THEN 'S' ELSE 'N' END);
      v_detailed_result := v_detailed_result || (CASE WHEN v_tf_count::float / v_tf_total > 0.5 THEN 'T' ELSE 'F' END);
      v_detailed_result := v_detailed_result || (CASE WHEN v_jp_count::float / v_jp_total > 0.5 THEN 'J' ELSE 'P' END);
      
      v_raw_scores := jsonb_build_object(
        'EI', ROUND((v_ei_count::float / v_ei_total) * 100),
        'SN', ROUND((v_sn_count::float / v_sn_total) * 100),
        'TF', ROUND((v_tf_count::float / v_tf_total) * 100),
        'JP', ROUND((v_jp_count::float / v_jp_total) * 100)
      );
      v_normalized_scores := v_raw_scores;
    END;
    
  ELSIF v_test_type = 'style' THEN
    -- Для DISC (стили)
    DECLARE
      v_d_score integer := 0;
      v_i_score integer := 0;
      v_s_score integer := 0;
      v_c_score integer := 0;
      v_max_score integer;
    BEGIN
      FOR v_question IN 
        SELECT question_number, scale_code
        FROM test_questions
        WHERE test_id = p_test_id
      LOOP
        v_answer_value := (p_answers->>v_question.question_number::text)::numeric;
        
        IF v_question.scale_code = 'D' THEN
          v_d_score := v_d_score + v_answer_value::integer;
        ELSIF v_question.scale_code = 'I' THEN
          v_i_score := v_i_score + v_answer_value::integer;
        ELSIF v_question.scale_code = 'S' THEN
          v_s_score := v_s_score + v_answer_value::integer;
        ELSIF v_question.scale_code = 'C' THEN
          v_c_score := v_c_score + v_answer_value::integer;
        END IF;
      END LOOP;
      
      -- Нормализуем баллы
      v_max_score := GREATEST(v_d_score, v_i_score, v_s_score, v_c_score);
      
      v_raw_scores := jsonb_build_object(
        'D', v_d_score,
        'I', v_i_score,
        'S', v_s_score,
        'C', v_c_score
      );
      
      v_normalized_scores := jsonb_build_object(
        'D', ROUND((v_d_score::float / NULLIF(v_max_score, 0)) * 100),
        'I', ROUND((v_i_score::float / NULLIF(v_max_score, 0)) * 100),
        'S', ROUND((v_s_score::float / NULLIF(v_max_score, 0)) * 100),
        'C', ROUND((v_c_score::float / NULLIF(v_max_score, 0)) * 100)
      );
      
      -- Определяем доминирующий стиль
      IF v_d_score >= v_i_score AND v_d_score >= v_s_score AND v_d_score >= v_c_score THEN
        v_detailed_result := 'D';
      ELSIF v_i_score >= v_s_score AND v_i_score >= v_c_score THEN
        v_detailed_result := 'I';
      ELSIF v_s_score >= v_c_score THEN
        v_detailed_result := 'S';
      ELSE
        v_detailed_result := 'C';
      END IF;
    END;
  END IF;
  
  RETURN jsonb_build_object(
    'raw_scores', v_raw_scores,
    'normalized_scores', v_normalized_scores,
    'detailed_result', v_detailed_result
  );
END;
$$;
```

---

**КОНЕЦ ЧАСТИ 2**

Часть 3 будет содержать:
- Детальное описание каждого из 6 психометрических тестов
- Систему скоринга в "Рынке талантов"
- Остальные RPC функции
- Edge Functions для AI
- Этапы разработки

# Техническое задание: HR Platform v2.0 - ЧАСТЬ 3

**Продолжение Части 2**

---

## 6. СИСТЕМА ПСИХОМЕТРИЧЕСКОГО ТЕСТИРОВАНИЯ

### 6.1 Общие принципы тестирования

1. **6 психометрических тестов:**
   - Big Five (Большая пятерка личности)
   - MBTI (Типология Майерс-Бриггс)
   - DISC (Профиль поведения)
   - EQ (Эмоциональный интеллект)
   - Soft Skills (Мягкие навыки)
   - Motivation Profile (Мотивационный профиль)

2. **Прохождение тестов:**
   - Тесты необязательны, но влияют на ранжирование в "Рынке талантов"
   - Кандидат может проходить тесты в любом порядке
   - Один тест = одна сессия (нельзя прервать и продолжить позже)
   - Без ограничения по времени (кроме случаев специфических тестов)

3. **Пересдача тестов:**
   - Статус "зеленый" (актуальны): < 1 месяца, пересдать нельзя
   - Статус "желтый" (скоро устареют): 1-2 месяца, пересдать можно
   - Статус "красный" (неактуальны): > 2 месяцев, пересдать можно
   - При пересдаче старые результаты удаляются

4. **Отображение результатов:**
   - **Для кандидата**: Краткие результаты с основными показателями
   - **Для HR**: Полные результаты с детальными интерпретациями

---

### 6.2 Тест 1: Big Five (Большая пятерка)

**Описание:** Наиболее научно обоснованная модель личности, измеряющая 5 ключевых черт

**Тип теста:** `scale` (шкальный)

**Количество вопросов:** 50 (по 10 на каждую шкалу)

**Шкалы:**

1. **Openness (Открытость опыту)**
   - Код: `openness`
   - Описание: Интерес к новому, любознательность, креативность
   - Тип шкалы: `higher_is_better`
   - Диапазон: 0-100
   - **Интерпретация:**
     - 0-30: Консервативный, предпочитает привычное
     - 31-70: Сбалансированный, открыт новому при необходимости
     - 71-100: Креативный, любит новизну и перемены

2. **Conscientiousness (Добросовестность)**
   - Код: `conscientiousness`
   - Описание: Организованность, надежность, самодисциплина
   - Тип шкалы: `higher_is_better`
   - Диапазон: 0-100
   - **Интерпретация:**
     - 0-30: Спонтанный, гибкий, может пренебрегать планированием
     - 31-70: Организованный, но сохраняет гибкость
     - 71-100: Очень дисциплинированный, перфекционист

3. **Extraversion (Экстраверсия)**
   - Код: `extraversion`
   - Описание: Общительность, энергичность, позитивные эмоции
   - Тип шкалы: `optimal` (оптимум = 50)
   - Диапазон: 0-100
   - Оптимальное значение: 50
   - **Интерпретация:**
     - 0-30: Интроверт, предпочитает уединение
     - 31-70: Амбиверт, сбалансирован
     - 71-100: Экстраверт, черпает энергию из общения

4. **Agreeableness (Доброжелательность)**
   - Код: `agreeableness`
   - Описание: Эмпатия, готовность к сотрудничеству, доверие
   - Тип шкалы: `optimal` (оптимум = 65)
   - Диапазон: 0-100
   - Оптимальное значение: 65
   - **Интерпретация:**
     - 0-30: Скептичный, прямолинейный, может быть конфликтным
     - 31-70: Сбалансированный, дипломатичный
     - 71-100: Очень отзывчивый, может жертвовать своими интересами

5. **Neuroticism (Нейротизм)**
   - Код: `neuroticism`
   - Описание: Эмоциональная стабильность, уровень стресса
   - Тип шкалы: `lower_is_better`
   - Диапазон: 0-100
   - **Интерпретация:**
     - 0-30: Эмоционально стабилен, устойчив к стрессу
     - 31-70: Средний уровень, периодические волнения
     - 71-100: Высокий уровень тревожности, чувствителен к стрессу

**Примеры вопросов:**

```json
// Openness (прямой вопрос)
{
  "question_number": 1,
  "text_ru": "Я люблю исследовать новые идеи и концепции",
  "text_en": "I enjoy exploring new ideas and concepts",
  "text_kk": "Мен жаңа идеяларды және тұжырымдамаларды зерттеуді ұнатамын",
  "scale_code": "openness",
  "reverse_scored": false
}

// Conscientiousness (обратный вопрос)
{
  "question_number": 11,
  "text_ru": "Я часто откладываю важные дела на последний момент",
  "text_en": "I often leave important tasks until the last minute",
  "text_kk": "Мен маңызды істерді әрдайым соңғы сәтке қалдырамын",
  "scale_code": "conscientiousness",
  "reverse_scored": true
}

// Extraversion (прямой)
{
  "question_number": 21,
  "text_ru": "Я чувствую прилив энергии в компании людей",
  "text_en": "I feel energized when I'm around people",
  "text_kk": "Мен адамдардың қасында болғанда қуат сезінемін",
  "scale_code": "extraversion",
  "reverse_scored": false
}

// Agreeableness (прямой)
{
  "question_number": 31,
  "text_ru": "Я стараюсь понимать точку зрения других людей",
  "text_en": "I try to understand other people's perspectives",
  "text_kk": "Мен басқа адамдардың көзқарасын түсінуге тырысамын",
  "scale_code": "agreeableness",
  "reverse_scored": false
}

// Neuroticism (прямой - высокий балл = плохо)
{
  "question_number": 41,
  "text_ru": "Я часто беспокоюсь о вещах, которые могут пойти не так",
  "text_en": "I often worry about things that might go wrong",
  "text_kk": "Мен жиі дұрыс болмауы мүмкін нәрселер туралы алаңдаймын",
  "scale_code": "neuroticism",
  "reverse_scored": false
}
```

---

### 6.3 Тест 2: MBTI (Типология Майерс-Бриггс)

**Описание:** Определяет 1 из 16 психологических типов по 4 дихотомиям

**Тип теста:** `dichotomy` (дихотомия)

**Количество вопросов:** 60 (по 15 на каждую дихотомию)

**Дихотомии:**

1. **E/I (Extraversion/Introversion)**
   - Где человек черпает энергию: из внешнего мира или внутри себя

2. **S/N (Sensing/Intuition)**
   - Как воспринимает информацию: конкретно/практично или абстрактно/концептуально

3. **T/F (Thinking/Feeling)**
   - Как принимает решения: логически/объективно или эмоционально/субъективно

4. **J/P (Judging/Perceiving)**
   - Как организует жизнь: структурно/планомерно или гибко/спонтанно

**Формат ответов:** Да/Нет (каждый вопрос дает 1 балл одной из сторон дихотомии)

**Примеры вопросов:**

```json
// E/I дихотомия
{
  "question_number": 1,
  "text_ru": "После общения с людьми я обычно чувствую прилив энергии",
  "text_en": "After socializing, I usually feel energized",
  "text_kk": "Адамдармен қарым-қатынастан кейін мен әдетте қуат сезінемін",
  "scale_code": "EI",
  "options": {
    "ru": ["Да", "Нет"],
    "en": ["Yes", "No"],
    "kk": ["Иә", "Жоқ"],
    "values": [1, 0]  // 1 = E, 0 = I
  }
}

// S/N дихотомия
{
  "question_number": 16,
  "text_ru": "Я предпочитаю работать с проверенными методами, а не экспериментировать",
  "text_en": "I prefer working with proven methods rather than experimenting",
  "text_kk": "Мен эксперимент жасаудың орнына дәлелденген әдістермен жұмыс істеуді жақсы көремін",
  "scale_code": "SN",
  "options": {
    "ru": ["Да", "Нет"],
    "en": ["Yes", "No"],
    "kk": ["Иә", "Жоқ"],
    "values": [1, 0]  // 1 = S, 0 = N
  }
}

// T/F дихотомия
{
  "question_number": 31,
  "text_ru": "При принятии решений я в первую очередь опираюсь на логику и факты",
  "text_en": "When making decisions, I primarily rely on logic and facts",
  "text_kk": "Шешім қабылдағанда мен ең алдымен логика мен фактілерге сүйенемін",
  "scale_code": "TF",
  "options": {
    "ru": ["Да", "Нет"],
    "en": ["Yes", "No"],
    "kk": ["Иә", "Жоқ"],
    "values": [1, 0]  // 1 = T, 0 = F
  }
}

// J/P дихотомия
{
  "question_number": 46,
  "text_ru": "Я предпочитаю иметь четкий план на день, а не импровизировать",
  "text_en": "I prefer having a clear daily plan rather than improvising",
  "text_kk": "Мен импровизация жасаудың орнына күнге нақты жоспар құруды жақсы көремін",
  "scale_code": "JP",
  "options": {
    "ru": ["Да", "Нет"],
    "en": ["Yes", "No"],
    "kk": ["Иә", "Жоқ"],
    "values": [1, 0]  // 1 = J, 0 = P
  }
}
```

**Расчет результата:**
- Подсчитываем процент ответов в пользу каждой стороны дихотомии
- Если E > 50%, то E, иначе I
- Итоговый тип: например, ENTJ, ISFP и т.д.

---

### 6.4 Тест 3: DISC (Профиль поведения)

**Описание:** Определяет доминирующий стиль поведения

**Тип теста:** `style` (стили)

**Количество вопросов:** 40 (по 10 на каждый стиль)

**Стили:**

1. **D (Dominance) - Доминирование**
   - Напористость, ориентация на результат, прямолинейность
   - Высокий D: Решительный лидер, берет инициативу
   - Низкий D: Осторожный, предпочитает сотрудничество

2. **I (Influence) - Влияние**
   - Общительность, оптимизм, убедительность
   - Высокий I: Энтузиаст, мотиватор команды
   - Низкий I: Сдержанный, ориентирован на задачи

3. **S (Steadiness) - Постоянство**
   - Надежность, терпение, стабильность
   - Высокий S: Лояльный, поддерживающий
   - Низкий S: Динамичный, любит изменения

4. **C (Compliance) - Соответствие**
   - Точность, аналитичность, следование правилам
   - Высокий C: Детально ориентированный, осторожный
   - Низкий C: Гибкий, склонен к риску

**Формат ответов:** 4-балльная шкала (0-3)

**Примеры вопросов:**

```json
// D - Доминирование
{
  "question_number": 1,
  "text_ru": "Я предпочитаю брать на себя руководящую роль в проектах",
  "text_en": "I prefer to take the lead role in projects",
  "text_kk": "Мен жобаларда жетекші рөлді өз мойныма алуды жөн көремін",
  "scale_code": "D",
  "options": {
    "ru": ["Очень похоже на меня", "Похоже на меня", "Не очень похоже на меня", "Совсем не похоже на меня"],
    "en": ["Very much like me", "Like me", "Not much like me", "Not like me at all"],
    "kk": ["Маған өте ұқсайды", "Маған ұқсайды", "Маған тым ұқсамайды", "Маған мүлдем ұқсамайды"],
    "values": [3, 2, 1, 0]
  }
}

// I - Влияние
{
  "question_number": 11,
  "text_ru": "Мне легко вдохновлять и мотивировать других людей",
  "text_en": "I easily inspire and motivate other people",
  "text_kk": "Мен басқа адамдарды шабыттандыру және мотивациялауды жеңіл көремін",
  "scale_code": "I",
  "options": {
    "ru": ["Очень похоже на меня", "Похоже на меня", "Не очень похоже на меня", "Совсем не похоже на меня"],
    "en": ["Very much like me", "Like me", "Not much like me", "Not like me at all"],
    "kk": ["Маған өте ұқсайды", "Маған ұқсайды", "Маған тым ұқсамайды", "Маған мүлдем ұқсамайды"],
    "values": [3, 2, 1, 0]
  }
}

// S - Постоянство
{
  "question_number": 21,
  "text_ru": "Я предпочитаю работать в стабильной и предсказуемой среде",
  "text_en": "I prefer working in a stable and predictable environment",
  "text_kk": "Мен тұрақты және болжанатын ортада жұмыс істеуді жөн көремін",
  "scale_code": "S",
  "options": {
    "ru": ["Очень похоже на меня", "Похоже на меня", "Не очень похоже на меня", "Совсем не похоже на меня"],
    "en": ["Very much like me", "Like me", "Not much like me", "Not like me at all"],
    "kk": ["Маған өте ұқсайды", "Маған ұқсайды", "Маған тым ұқсамайды", "Маған мүлдем ұқсамайды"],
    "values": [3, 2, 1, 0]
  }
}

// C - Соответствие
{
  "question_number": 31,
  "text_ru": "Я всегда стремлюсь выполнять работу с высокой точностью и вниманием к деталям",
  "text_en": "I always strive to do work with high accuracy and attention to detail",
  "text_kk": "Мен әрдайым жұмысты жоғары дәлдікпен және егжей-тегжейлерге назар аудара отырып орындауға тырысамын",
  "scale_code": "C",
  "options": {
    "ru": ["Очень похоже на меня", "Похоже на меня", "Не очень похоже на меня", "Совсем не похоже на меня"],
    "en": ["Very much like me", "Like me", "Not much like me", "Not like me at all"],
    "kk": ["Маған өте ұқсайды", "Маған ұқсайды", "Маған тым ұқсамайды", "Маған мүлдем ұқсамайды"],
    "values": [3, 2, 1, 0]
  }
}
```

**Расчет результата:**
- Суммируем баллы по каждому стилю
- Определяем доминирующий стиль (максимальный балл)
- Нормализуем баллы (0-100)

---

### 6.5 Тест 4: EQ (Эмоциональный интеллект)

**Описание:** Оценка способности понимать и управлять эмоциями

**Тип теста:** `scale` (шкальный)

**Количество вопросов:** 40 (по 10 на каждую компетенцию)

**Компетенции:**

1. **Self-Awareness (Самосознание)**
   - Код: `self_awareness`
   - Описание: Понимание своих эмоций и их влияния
   - Тип шкалы: `higher_is_better`

2. **Self-Management (Самоуправление)**
   - Код: `self_management`
   - Описание: Контроль импульсов, адаптивность
   - Тип шкалы: `higher_is_better`

3. **Social Awareness (Социальная осведомленность)**
   - Код: `social_awareness`
   - Описание: Эмпатия, понимание чувств других
   - Тип шкалы: `higher_is_better`

4. **Relationship Management (Управление отношениями)**
   - Код: `relationship_management`
   - Описание: Влияние, разрешение конфликтов
   - Тип шкалы: `higher_is_better`

**Формат ответов:** 5-балльная шкала Ликерта (0-100)

**Примеры вопросов:**

```json
// Self-Awareness
{
  "question_number": 1,
  "text_ru": "Я хорошо осознаю свои эмоции в момент их возникновения",
  "text_en": "I am well aware of my emotions as they arise",
  "text_kk": "Мен өз эмоцияларымды пайда болған сәтте жақсы түсінемін",
  "scale_code": "self_awareness",
  "reverse_scored": false
}

// Self-Management
{
  "question_number": 11,
  "text_ru": "Я способен сохранять спокойствие в стрессовых ситуациях",
  "text_en": "I am able to stay calm in stressful situations",
  "text_kk": "Мен стресстік жағдайларда сабырлы бола аламын",
  "scale_code": "self_management",
  "reverse_scored": false
}

// Social Awareness
{
  "question_number": 21,
  "text_ru": "Я легко понимаю эмоциональное состояние других людей",
  "text_en": "I easily understand the emotional state of other people",
  "text_kk": "Мен басқа адамдардың эмоционалдық жағдайын жеңіл түсінемін",
  "scale_code": "social_awareness",
  "reverse_scored": false
}

// Relationship Management
{
  "question_number": 31,
  "text_ru": "Я умею эффективно разрешать конфликты",
  "text_en": "I know how to resolve conflicts effectively",
  "text_kk": "Мен қақтығыстарды тиімді шешуді білемін",
  "scale_code": "relationship_management",
  "reverse_scored": false
}
```

---

### 6.6 Тест 5: Soft Skills (Мягкие навыки)

**Описание:** Оценка ключевых профессиональных компетенций

**Тип теста:** `scale` (шкальный)

**Количество вопросов:** 50 (по 10 на каждый навык)

**Навыки:**

1. **Communication (Коммуникация)**
   - Код: `communication`
   - Описание: Ясность выражения мыслей, активное слушание
   - Тип шкалы: `higher_is_better`

2. **Teamwork (Работа в команде)**
   - Код: `teamwork`
   - Описание: Коллаборация, поддержка коллег
   - Тип шкалы: `higher_is_better`

3. **Critical Thinking (Критическое мышление)**
   - Код: `critical_thinking`
   - Описание: Анализ, принятие решений
   - Тип шкалы: `higher_is_better`

4. **Adaptability (Адаптивность)**
   - Код: `adaptability`
   - Описание: Гибкость к изменениям, обучаемость
   - Тип шкалы: `higher_is_better`

5. **Initiative (Инициативность)**
   - Код: `initiative`
   - Описание: Проактивность, drive к результату
   - Тип шкалы: `higher_is_better`

**Формат ответов:** 5-балльная шкала Ликерта (0-100)

---

### 6.7 Тест 6: Motivation Profile (Мотивационный профиль)

**Описание:** Определяет ключевые драйверы мотивации

**Тип теста:** `scale` (шкальный)

**Количество вопросов:** 60 (по 10 на каждый драйвер)

**Драйверы мотивации:**

1. **Achievement (Достижение)**
   - Код: `achievement`
   - Описание: Стремление к успеху, результативность
   - Тип шкалы: `higher_is_better`

2. **Power (Власть)**
   - Код: `power`
   - Описание: Влияние, контроль, лидерство
   - Тип шкалы: `optimal` (оптимум = 60)

3. **Affiliation (Принадлежность)**
   - Код: `affiliation`
   - Описание: Социальные связи, принятие
   - Тип шкалы: `optimal` (оптимум = 60)

4. **Autonomy (Автономность)**
   - Код: `autonomy`
   - Описание: Независимость, самостоятельность
   - Тип шкалы: `optimal` (оптимум = 65)

5. **Security (Безопасность)**
   - Код: `security`
   - Описание: Стабильность, предсказуемость
   - Тип шкалы: `optimal` (оптимум = 50)

6. **Growth (Рост)**
   - Код: `growth`
   - Описание: Развитие, обучение, самосовершенствование
   - Тип шкалы: `higher_is_better`

**Формат ответов:** 5-балльная шкала Ликерта (0-100)

---

## 7. СИСТЕМА СКОРИНГА В "РЫНКЕ ТАЛАНТОВ"

### 7.1 Общая формула совместимости

**Финальный балл совместимости** состоит из двух компонентов:

```
Итоговая совместимость = 
  (Профессиональная совместимость × 0.4) + 
  (Личностная совместимость × 0.6)
```

**Диапазон:** 0-100

---

### 7.2 Профессиональная совместимость (40%)

**Основа:** Совпадение навыков кандидата с требованиями вакансии

**Формула:**
```
Профессиональная совместимость = 
  (Количество совпадающих навыков / Количество требуемых навыков) × 100
```

**Пример:**
- Вакансия требует: `["javascript", "react", "typescript", "css", "git"]` (5 навыков)
- Кандидат имеет: `["javascript", "react", "vue", "css", "python"]` (5 навыков)
- Совпадают: `["javascript", "react", "css"]` (3 навыка)
- Балл = (3 / 5) × 100 = **60%**

**Особенности:**
- Используется словарь `skills_dictionary` для сопоставления синонимов
- Все навыки сравниваются по `canonical_name`
- Обязательные навыки (`is_required = true`) имеют больший вес

**Улучшенная формула с учетом обязательных навыков:**
```sql
WITH required_skills AS (
  SELECT canonical_skill FROM vacancy_skills 
  WHERE vacancy_id = v_id AND is_required = true
),
optional_skills AS (
  SELECT canonical_skill FROM vacancy_skills 
  WHERE vacancy_id = v_id AND is_required = false
),
candidate_skills AS (
  SELECT canonical_skill FROM candidate_skills 
  WHERE candidate_id = c_id
)
SELECT 
  -- Обязательные навыки (вес 70%)
  (
    (SELECT COUNT(*) FROM required_skills 
     WHERE canonical_skill IN (SELECT canonical_skill FROM candidate_skills))::float /
    NULLIF((SELECT COUNT(*) FROM required_skills), 0)
  ) * 70 +
  -- Опциональные навыки (вес 30%)
  (
    (SELECT COUNT(*) FROM optional_skills 
     WHERE canonical_skill IN (SELECT canonical_skill FROM candidate_skills))::float /
    NULLIF((SELECT COUNT(*) FROM optional_skills), 0)
  ) * 30
  AS professional_compatibility;
```

---

### 7.3 Личностная совместимость (60%)

**Основа:** Совпадение психометрических профилей кандидата и идеального профиля вакансии

**Распределение весов между тестами:**
- **Big Five:** 25%
- **MBTI:** 10%
- **DISC:** 10%
- **EQ:** 20%
- **Soft Skills:** 20%
- **Motivation:** 15%

**Итого:** 100% (личностной совместимости)

---

#### 7.3.1 Big Five совместимость (25%)

**Для каждой из 5 шкал:**

1. **Определяем тип шкалы** (из `test_scales.scale_type`):
   - `higher_is_better`: чем выше балл кандидата, тем лучше
   - `lower_is_better`: чем ниже балл кандидата, тем лучше
   - `optimal`: есть оптимальное значение

2. **Рассчитываем балл совпадения:**

```sql
CASE 
  -- Для higher_is_better
  WHEN scale_type = 'higher_is_better' THEN
    CASE 
      WHEN candidate_score >= ideal_score THEN 100
      ELSE (candidate_score / NULLIF(ideal_score, 0)) * 100
    END
    
  -- Для lower_is_better
  WHEN scale_type = 'lower_is_better' THEN
    CASE 
      WHEN candidate_score <= ideal_score THEN 100
      ELSE (ideal_score / NULLIF(candidate_score, 0)) * 100
    END
    
  -- Для optimal
  WHEN scale_type = 'optimal' THEN
    100 - ABS(candidate_score - ideal_score)
END
```

3. **Усредняем по всем 5 шкалам:**

```
Big Five совместимость = 
  (openness_match + conscientiousness_match + extraversion_match + 
   agreeableness_match + neuroticism_match) / 5
```

---

#### 7.3.2 MBTI совместимость (10%)

**Логика:**
- Полное совпадение типа (все 4 буквы): **100%**
- Совпадение 3 букв: **75%**
- Совпадение 2 букв: **50%**
- Совпадение 1 буквы: **25%**
- Полное несовпадение: **0%**

**Пример:**
- Идеальный: ENTJ
- Кандидат: INTJ
- Совпадают: N, T, J (3 буквы)
- Балл: **75%**

---

#### 7.3.3 DISC совместимость (10%)

**Логика:** Вычисляем корреляцию между векторами значений

```sql
WITH ideal AS (
  SELECT 
    (ideal_profile->'disc'->>'D')::numeric as d,
    (ideal_profile->'disc'->>'I')::numeric as i,
    (ideal_profile->'disc'->>'S')::numeric as s,
    (ideal_profile->'disc'->>'C')::numeric as c
),
candidate AS (
  SELECT 
    (normalized_scores->>'D')::numeric as d,
    (normalized_scores->>'I')::numeric as i,
    (normalized_scores->>'S')::numeric as s,
    (normalized_scores->>'C')::numeric as c
)
SELECT 
  100 - (
    ABS(ideal.d - candidate.d) +
    ABS(ideal.i - candidate.i) +
    ABS(ideal.s - candidate.s) +
    ABS(ideal.c - candidate.c)
  ) / 4
AS disc_compatibility;
```

---

#### 7.3.4 EQ совместимость (20%)

**Логика:** Аналогично Big Five, но все 4 компетенции EQ имеют тип `higher_is_better`

```sql
WITH eq_scores AS (
  SELECT 
    (ideal_profile->'eq'->>'self_awareness')::numeric as ideal_sa,
    (normalized_scores->>'self_awareness')::numeric as cand_sa,
    (ideal_profile->'eq'->>'self_management')::numeric as ideal_sm,
    (normalized_scores->>'self_management')::numeric as cand_sm,
    (ideal_profile->'eq'->>'social_awareness')::numeric as ideal_soa,
    (normalized_scores->>'social_awareness')::numeric as cand_soa,
    (ideal_profile->'eq'->>'relationship_management')::numeric as ideal_rm,
    (normalized_scores->>'relationship_management')::numeric as cand_rm
)
SELECT 
  (
    LEAST(100, (cand_sa / NULLIF(ideal_sa, 0)) * 100) +
    LEAST(100, (cand_sm / NULLIF(ideal_sm, 0)) * 100) +
    LEAST(100, (cand_soa / NULLIF(ideal_soa, 0)) * 100) +
    LEAST(100, (cand_rm / NULLIF(ideal_rm, 0)) * 100)
  ) / 4
AS eq_compatibility;
```

---

#### 7.3.5 Soft Skills совместимость (20%)

**Логика:** Все 5 навыков имеют тип `higher_is_better`

```sql
-- Аналогично EQ, усредняем по 5 навыкам
SELECT 
  (
    LEAST(100, (cand_communication / NULLIF(ideal_communication, 0)) * 100) +
    LEAST(100, (cand_teamwork / NULLIF(ideal_teamwork, 0)) * 100) +
    LEAST(100, (cand_critical_thinking / NULLIF(ideal_critical_thinking, 0)) * 100) +
    LEAST(100, (cand_adaptability / NULLIF(ideal_adaptability, 0)) * 100) +
    LEAST(100, (cand_initiative / NULLIF(ideal_initiative, 0)) * 100)
  ) / 5
AS soft_skills_compatibility;
```

---

#### 7.3.6 Motivation совместимость (15%)

**Логика:** Комбинация типов шкал (3 `optimal`, 2 `higher_is_better`)

```sql
SELECT 
  (
    -- Achievement - higher_is_better
    LEAST(100, (cand_achievement / NULLIF(ideal_achievement, 0)) * 100) +
    -- Power - optimal
    (100 - ABS(cand_power - ideal_power)) +
    -- Affiliation - optimal
    (100 - ABS(cand_affiliation - ideal_affiliation)) +
    -- Autonomy - optimal
    (100 - ABS(cand_autonomy - ideal_autonomy)) +
    -- Security - optimal
    (100 - ABS(cand_security - ideal_security)) +
    -- Growth - higher_is_better
    LEAST(100, (cand_growth / NULLIF(ideal_growth, 0)) * 100)
  ) / 6
AS motivation_compatibility;
```

---

### 7.4 RPC Функция: `get_candidate_compatibility_scores`

**Назначение:** Расчет совместимости кандидата с вакансией

```sql
CREATE OR REPLACE FUNCTION public.get_candidate_compatibility_scores(
  p_vacancy_id uuid,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  candidate_id uuid,
  full_name text,
  category_id uuid,
  tests_completed integer,
  tests_last_updated_at timestamptz,
  professional_compatibility numeric,
  personal_compatibility numeric,
  overall_compatibility numeric,
  compatibility_details jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH vacancy_data AS (
    SELECT 
      v.id,
      v.ideal_profile,
      v.organization_id
    FROM vacancies v
    WHERE v.id = p_vacancy_id
  ),
  -- Получаем навыки вакансии
  vacancy_required_skills AS (
    SELECT canonical_skill 
    FROM vacancy_skills 
    WHERE vacancy_id = p_vacancy_id AND is_required = true
  ),
  vacancy_optional_skills AS (
    SELECT canonical_skill 
    FROM vacancy_skills 
    WHERE vacancy_id = p_vacancy_id AND is_required = false
  ),
  -- Получаем публичных кандидатов с тестами
  eligible_candidates AS (
    SELECT 
      c.id,
      c.full_name,
      c.category_id,
      c.tests_completed,
      c.tests_last_updated_at
    FROM candidates c
    WHERE 
      c.is_public = true
      AND c.tests_completed > 0
  ),
  -- Рассчитываем профессиональную совместимость
  prof_compat AS (
    SELECT 
      ec.id as candidate_id,
      COALESCE(
        (
          -- Обязательные навыки (70%)
          (
            (SELECT COUNT(*)::float FROM vacancy_required_skills vrs
             WHERE vrs.canonical_skill IN (
               SELECT canonical_skill FROM candidate_skills WHERE candidate_id = ec.id
             ))
            / NULLIF((SELECT COUNT(*) FROM vacancy_required_skills), 0)
          ) * 70 +
          -- Опциональные навыки (30%)
          (
            (SELECT COUNT(*)::float FROM vacancy_optional_skills vos
             WHERE vos.canonical_skill IN (
               SELECT canonical_skill FROM candidate_skills WHERE candidate_id = ec.id
             ))
            / NULLIF((SELECT COUNT(*) FROM vacancy_optional_skills), 0)
          ) * 30
        ), 0
      ) as prof_score
    FROM eligible_candidates ec
  ),
  -- Рассчитываем личностную совместимость
  pers_compat AS (
    SELECT 
      ec.id as candidate_id,
      -- Здесь идет сложный расчет по всем 6 тестам
      -- (код расчета опущен для краткости, но логика описана выше)
      COALESCE(calculate_personal_compatibility(
        ec.id, 
        (SELECT ideal_profile FROM vacancy_data)
      ), 0) as pers_score,
      get_compatibility_details(
        ec.id,
        (SELECT ideal_profile FROM vacancy_data)
      ) as details
    FROM eligible_candidates ec
  )
  SELECT 
    ec.id,
    ec.full_name,
    ec.category_id,
    ec.tests_completed,
    ec.tests_last_updated_at,
    ROUND(pc.prof_score::numeric, 2) as professional_compatibility,
    ROUND(psc.pers_score::numeric, 2) as personal_compatibility,
    ROUND((pc.prof_score * 0.4 + psc.pers_score * 0.6)::numeric, 2) as overall_compatibility,
    psc.details as compatibility_details
  FROM eligible_candidates ec
  LEFT JOIN prof_compat pc ON pc.candidate_id = ec.id
  LEFT JOIN pers_compat psc ON psc.candidate_id = ec.id
  ORDER BY (pc.prof_score * 0.4 + psc.pers_score * 0.6) DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
```

---

**КОНЕЦ ЧАСТИ 3**

Часть 4 будет содержать:
- Остальные RPC функции
- Edge Functions для AI
- Полные этапы разработки с детальными задачами
- Дизайн-система и UI/UX guidelines

# Техническое задание: HR Platform v2.0 - ЧАСТЬ 4 (ФИНАЛЬНАЯ)

**Продолжение Части 3**

---

## 8. ОСТАЛЬНЫЕ RPC ФУНКЦИИ

### 8.1 Функция: `acquire_candidate_from_market`

**Назначение:** "Покупка" кандидата из рынка талантов

```sql
CREATE OR REPLACE FUNCTION public.acquire_candidate_from_market(
  p_candidate_id uuid,
  p_vacancy_id uuid,
  p_hr_specialist_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id uuid;
  v_token_cost integer := 1000; -- Стоимость покупки
  v_current_balance integer;
  v_chat_room_id uuid;
BEGIN
  -- Получаем организацию HR
  SELECT organization_id INTO v_organization_id
  FROM hr_specialists
  WHERE user_id = p_hr_specialist_id;
  
  IF v_organization_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'HR specialist not found'
    );
  END IF;
  
  -- Проверяем баланс токенов
  SELECT token_balance INTO v_current_balance
  FROM organizations
  WHERE id = v_organization_id;
  
  IF v_current_balance < v_token_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient tokens',
      'required', v_token_cost,
      'available', v_current_balance
    );
  END IF;
  
  -- Проверяем, не куплен ли уже этот кандидат
  IF EXISTS (
    SELECT 1 FROM applications
    WHERE candidate_id = p_candidate_id
      AND organization_id = v_organization_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Candidate already acquired'
    );
  END IF;
  
  -- Списываем токены
  UPDATE organizations
  SET token_balance = token_balance - v_token_cost
  WHERE id = v_organization_id;
  
  -- Создаем application
  INSERT INTO applications (
    id,
    candidate_id,
    vacancy_id,
    organization_id,
    status,
    added_by_hr_id
  )
  VALUES (
    gen_random_uuid(),
    p_candidate_id,
    p_vacancy_id,
    v_organization_id,
    'invited',
    p_hr_specialist_id
  );
  
  -- Создаем чат-комнату
  INSERT INTO chat_rooms (
    id,
    organization_id,
    hr_specialist_id,
    candidate_id
  )
  VALUES (
    gen_random_uuid(),
    v_organization_id,
    p_hr_specialist_id,
    p_candidate_id
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_chat_room_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'tokens_spent', v_token_cost,
    'new_balance', v_current_balance - v_token_cost,
    'chat_room_id', v_chat_room_id
  );
END;
$$;
```

---

### 8.2 Функция: `request_test_retake`

**Назначение:** Запрос на пересдачу теста (если прошло достаточно времени)

```sql
CREATE OR REPLACE FUNCTION public.request_test_retake(
  p_candidate_id uuid,
  p_test_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_result_id uuid;
  v_completed_at timestamptz;
  v_months_passed numeric;
BEGIN
  -- Получаем результат теста
  SELECT id, completed_at INTO v_result_id, v_completed_at
  FROM candidate_test_results
  WHERE candidate_id = p_candidate_id AND test_id = p_test_id;
  
  IF v_result_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Test result not found'
    );
  END IF;
  
  -- Вычисляем сколько месяцев прошло
  v_months_passed := EXTRACT(EPOCH FROM (NOW() - v_completed_at)) / (30 * 24 * 60 * 60);
  
  IF v_months_passed < 1 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot retake test yet',
      'months_passed', ROUND(v_months_passed::numeric, 2),
      'months_required', 1,
      'retake_available_at', v_completed_at + INTERVAL '1 month'
    );
  END IF;
  
  -- Удаляем старый результат (триггер пересчитает tests_completed)
  DELETE FROM candidate_test_results
  WHERE id = v_result_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Test is now available for retake'
  );
END;
$$;
```

---

### 8.3 Функция: `get_hr_dashboard_stats`

**Назначение:** Получение статистики для дашборда HR

```sql
CREATE OR REPLACE FUNCTION public.get_hr_dashboard_stats(
  p_organization_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_candidates', (
      SELECT COUNT(DISTINCT candidate_id)
      FROM applications
      WHERE organization_id = p_organization_id
    ),
    'total_vacancies', (
      SELECT COUNT(*)
      FROM vacancies
      WHERE organization_id = p_organization_id AND status = 'active'
    ),
    'candidates_testing', (
      SELECT COUNT(DISTINCT candidate_id)
      FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE a.organization_id = p_organization_id
        AND c.tests_completed > 0
        AND c.tests_completed < 6
    ),
    'candidates_evaluated', (
      SELECT COUNT(DISTINCT candidate_id)
      FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE a.organization_id = p_organization_id
        AND c.tests_completed = 6
    ),
    'token_balance', (
      SELECT token_balance
      FROM organizations
      WHERE id = p_organization_id
    ),
    'recent_activity', (
      SELECT jsonb_agg(activity)
      FROM (
        SELECT jsonb_build_object(
          'type', 'application',
          'candidate_name', c.full_name,
          'vacancy_title', v.title,
          'created_at', a.created_at
        ) as activity
        FROM applications a
        JOIN candidates c ON c.id = a.candidate_id
        JOIN vacancies v ON v.id = a.vacancy_id
        WHERE a.organization_id = p_organization_id
        ORDER BY a.created_at DESC
        LIMIT 5
      ) activities
    )
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$;
```

---

### 8.4 Функция: `generate_invitation_token`

**Назначение:** Генерация пригласительного токена

```sql
CREATE OR REPLACE FUNCTION public.generate_invitation_token(
  p_hr_specialist_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id uuid;
  v_token_cost integer := 500;
  v_current_balance integer;
  v_token text;
  v_token_id uuid;
BEGIN
  -- Получаем организацию
  SELECT organization_id INTO v_organization_id
  FROM hr_specialists
  WHERE user_id = p_hr_specialist_id;
  
  -- Проверяем баланс
  SELECT token_balance INTO v_current_balance
  FROM organizations
  WHERE id = v_organization_id;
  
  IF v_current_balance < v_token_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient tokens'
    );
  END IF;
  
  -- Генерируем уникальный токен
  v_token := encode(extensions.gen_random_bytes(16), 'hex');
  
  -- Списываем токены
  UPDATE organizations
  SET token_balance = token_balance - v_token_cost
  WHERE id = v_organization_id;
  
  -- Создаем запись токена
  INSERT INTO invitation_tokens (
    id,
    token,
    created_by_hr_id,
    organization_id,
    is_used
  )
  VALUES (
    gen_random_uuid(),
    v_token,
    p_hr_specialist_id,
    v_organization_id,
    false
  )
  RETURNING id INTO v_token_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'token', v_token,
    'token_id', v_token_id,
    'invite_url', 'https://your-domain.com/register/' || v_token,
    'tokens_spent', v_token_cost,
    'new_balance', v_current_balance - v_token_cost
  );
END;
$$;
```

---

## 9. EDGE FUNCTIONS ДЛЯ AI

### 9.1 Общая структура Edge Function

Все Edge Functions следуют единой архитектуре:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Типы
interface RequestPayload {
  // специфичные для функции поля
}

interface AIPromptConfig {
  prompt_text: string
  model_name: string
  provider: string
  max_tokens: number
  temperature: number
}

serve(async (req) => {
  try {
    // 1. Валидация и парсинг запроса
    const payload: RequestPayload = await req.json()
    
    // 2. Инициализация Supabase клиента
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // 3. Получение конфигурации AI (промпт + модель)
    const config = await getAIConfig(supabaseClient, 'operation_type')
    
    // 4. Сбор необходимых данных из БД
    const contextData = await gatherContextData(supabaseClient, payload)
    
    // 5. Формирование финального промпта
    const finalPrompt = buildPrompt(config.prompt_text, contextData)
    
    // 6. Вызов AI API
    const aiResponse = await callAI(config, finalPrompt)
    
    // 7. Подсчет токенов
    const tokensUsed = calculateTokens(aiResponse)
    
    // 8. Списание токенов из баланса организации
    await deductTokens(supabaseClient, payload.organization_id, tokensUsed)
    
    // 9. Логирование операции
    await logAIOperation(supabaseClient, {
      organization_id: payload.organization_id,
      operation_type: 'operation_type',
      model_used: config.model_name,
      input_tokens: tokensUsed.input,
      output_tokens: tokensUsed.output,
      total_tokens: tokensUsed.total,
      success: true
    })
    
    // 10. Сохранение результата в БД
    const savedResult = await saveResult(supabaseClient, payload, aiResponse)
    
    // 11. Возврат ответа
    return new Response(
      JSON.stringify({
        success: true,
        data: savedResult,
        tokens_used: tokensUsed.total
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

---

### 9.2 Edge Function: `analyze-resumes`

**Файл:** `supabase/functions/analyze-resumes/index.ts`

**Назначение:** Быстрый анализ резюме (вкладка 1 HR дашборда)

**Входные данные:**
```typescript
interface AnalyzeResumesPayload {
  organization_id: string
  hr_specialist_id: string
  vacancy_ids: string[]  // До 7 вакансий
  resumes: Array<{
    filename: string
    content_base64: string  // PDF в base64
  }>  // До 20 резюме
  additional_notes?: string
  language: 'ru' | 'kk' | 'en'
}
```

**Логика:**
1. Конвертировать PDF резюме в текст
2. Получить описания выбранных вакансий
3. Сформировать промпт с резюме и вакансиями
4. Получить от AI анализ в markdown
5. Конвертировать markdown → HTML (библиотека `marked`)
6. Сохранить в `resume_analysis_results`

**Промпт (из `ai_prompts`):**
```
Ты - эксперт HR-аналитик. Проанализируй предоставленные резюме кандидатов и сопоставь их с вакансиями.

Вакансии:
{vacancies_description}

Резюме кандидатов:
{resumes_content}

Дополнительные комментарии HR: {additional_notes}

Задача:
1. Проанализируй каждое резюме
2. Определи насколько каждый кандидат подходит для каждой вакансии
3. Выдели топ-5 кандидатов с кратким обоснованием
4. Укажи кандидатов, которые точно НЕ подходят и почему

Формат ответа: профессиональный markdown без эмодзи
Язык ответа: {language}
```

---

### 9.3 Edge Function: `generate-ideal-profile`

**Файл:** `supabase/functions/generate-ideal-profile/index.ts`

**Назначение:** AI-генерация идеального психометрического профиля для вакансии

**Входные данные:**
```typescript
interface GenerateIdealProfilePayload {
  vacancy_id: string
  organization_id: string
  hr_specialist_id: string
  language: 'ru' | 'kk' | 'en'
}
```

**Логика:**
1. Получить описание вакансии (title, description, requirements)
2. Сформировать промпт
3. Получить от AI структурированный JSON с профилем
4. Валидировать JSON
5. Сохранить в `vacancies.ideal_profile`

**Промпт:**
```
Ты - эксперт по психометрии и подбору персонала. На основе описания вакансии создай идеальный психометрический профиль кандидата.

Вакансия:
Должность: {title}
Описание: {description}
Требования: {requirements}

Создай JSON-объект со следующей структурой (значения должны быть от 0 до 100):

{
  "big_five": {
    "openness": 75,
    "conscientiousness": 80,
    "extraversion": 60,
    "agreeableness": 70,
    "neuroticism": 30
  },
  "mbti": "ENTJ",
  "disc": {
    "D": 80,
    "I": 60,
    "S": 40,
    "C": 70
  },
  "eq": {
    "self_awareness": 75,
    "self_management": 80,
    "social_awareness": 70,
    "relationship_management": 75
  },
  "soft_skills": {
    "communication": 80,
    "teamwork": 75,
    "critical_thinking": 85,
    "adaptability": 70,
    "initiative": 80
  },
  "motivation": {
    "achievement": 80,
    "power": 60,
    "affiliation": 50,
    "autonomy": 70,
    "security": 40,
    "growth": 85
  }
}

ВАЖНО:
- Отвечай ТОЛЬКО валидным JSON, без дополнительного текста
- НЕ используй markdown code blocks
- Значения должны быть реалистичными для данной должности
- Учитывай специфику индустрии и уровень позиции
```

---

### 9.4 Edge Function: `generate-full-analysis`

**Файл:** `supabase/functions/generate-full-analysis/index.ts`

**Назначение:** Полный AI-анализ кандидата

**Входные данные:**
```typescript
interface GenerateFullAnalysisPayload {
  candidate_id: string
  vacancy_ids: string[]  // До 5 вакансий
  organization_id: string
  hr_specialist_id: string
  language: 'ru' | 'kk' | 'en'
}
```

**Логика:**
1. Получить все данные кандидата (профиль, навыки, результаты всех 6 тестов)
2. Получить описания вакансий
3. Сформировать детальный промпт
4. Получить от AI глубокий анализ в markdown
5. Конвертировать markdown → HTML
6. Сохранить в `candidate_full_analysis`

**Промпт:**
```
Ты - опытный HR-психолог и эксперт по подбору персонала. Создай детальный профессиональный анализ кандидата.

ДАННЫЕ КАНДИДАТА:
Имя: {full_name}
Категория: {category}
Опыт работы: {experience}
Образование: {education}
О себе: {about}
Навыки: {skills}

РЕЗУЛЬТАТЫ ПСИХОМЕТРИЧЕСКИХ ТЕСТОВ:
Big Five: {big_five_results}
MBTI: {mbti_result}
DISC: {disc_results}
EQ: {eq_results}
Soft Skills: {soft_skills_results}
Мотивация: {motivation_results}

ВАКАНСИИ ДЛЯ АНАЛИЗА:
{vacancies_descriptions}

Создай подробный анализ, включающий:
1. **Профессиональный профиль** - сильные стороны, навыки
2. **Психологический портрет** - личностные особенности на основе тестов
3. **Соответствие вакансиям** - детальное соответствие каждой вакансии с рекомендацией
4. **Мотивационные драйверы** - что мотивирует кандидата
5. **Потенциальные риски** - на что обратить внимание
6. **Рекомендации по взаимодействию** - как лучше коммуницировать с кандидатом
7. **Итоговая оценка** - финальная рекомендация (нанять/не нанять)

Формат: профессиональный markdown с заголовками, без эмодзи
Язык: {language}
```

---

### 9.5 Edge Function: `generate-document`

**Файл:** `supabase/functions/generate-document/index.ts`

**Назначение:** Генерация документов (оффер, отказ, приглашение)

**Входные данные:**
```typescript
interface GenerateDocumentPayload {
  candidate_id: string
  vacancy_id?: string
  organization_id: string
  hr_specialist_id: string
  document_type: 'interview_invitation' | 'job_offer' | 'rejection_letter'
  additional_info: string  // Дополнительная информация от HR
  language: 'ru' | 'kk' | 'en'
}
```

**Логика:**
1. Получить данные кандидата
2. Получить полный анализ кандидата (если есть)
3. Получить описание вакансии (если указана)
4. Получить информацию об организации
5. Сформировать промпт в зависимости от типа документа
6. Получить от AI текст документа в markdown
7. Конвертировать markdown → HTML
8. Сохранить в `generated_documents`

**Промпты для разных типов документов:**

*Приглашение на интервью:*
```
Создай профессиональное приглашение на интервью для кандидата.

Кандидат: {candidate_name}
Вакансия: {vacancy_title}
Компания: {organization_name}
Дополнительная информация: {additional_info}

Структура письма:
1. Приветствие
2. Благодарность за интерес к вакансии
3. Приглашение на собеседование
4. Детали встречи (будут добавлены HR)
5. Что подготовить к интервью
6. Контактная информация

Тон: профессиональный, дружелюбный
Формат: markdown для email
Язык: {language}
```

*Оффер:*
```
Создай профессиональное предложение о работе (job offer).

Кандидат: {candidate_name}
Должность: {vacancy_title}
Компания: {organization_name}
Условия: {additional_info}

Краткий анализ кандидата: {candidate_analysis_summary}

Структура оффера:
1. Поздравление с успешным прохождением отбора
2. Предложение должности
3. Ключевые обязанности
4. Условия (зарплата, график, бонусы - из additional_info)
5. Социальный пакет
6. Дата начала работы
7. Срок принятия решения

Тон: официальный, но позитивный
Формат: markdown
Язык: {language}
```

*Отказ:*
```
Создай вежливое письмо с отказом кандидату.

Кандидат: {candidate_name}
Вакансия: {vacancy_title}
Компания: {organization_name}
Причина (для внутреннего использования): {additional_info}

Структура письма:
1. Благодарность за участие в отборе
2. Информирование о решении (деликатно)
3. Общая положительная обратная связь
4. Пожелание успехов
5. Приглашение следить за другими вакансиями

ВАЖНО:
- НЕ указывай конкретную причину отказа
- Сохраняй позитивный тон
- Оставь двери открытыми для будущего сотрудничества

Тон: уважительный, позитивный
Формат: markdown
Язык: {language}
```

---

### 9.6 Edge Function: `generate-structured-interview`

**Файл:** `supabase/functions/generate-structured-interview/index.ts`

**Назначение:** Генерация структурированного интервью

**Входные данные:**
```typescript
interface GenerateStructuredInterviewPayload {
  candidate_id: string
  vacancy_id: string
  organization_id: string
  hr_specialist_id: string
  language: 'ru' | 'kk' | 'en'
}
```

**Логика:**
1. Получить полный анализ кандидата
2. Получить описание вакансии
3. Сформировать промпт
4. Получить от AI структурированный план интервью
5. Конвертировать markdown → HTML
6. Сохранить в `generated_documents` с типом `structured_interview`

**Промпт:**
```
Ты - эксперт по проведению структурированных интервью. Создай детальный план интервью для кандидата.

КАНДИДАТ: {candidate_name}
ВАКАНСИЯ: {vacancy_title}

ПОЛНЫЙ АНАЛИЗ КАНДИДАТА:
{full_analysis_content}

ПСИХОМЕТРИЧЕСКИЕ РЕЗУЛЬТАТЫ:
{test_results_summary}

Создай структурированное интервью, включающее:

1. **Вводная часть** (5 мин)
   - Приветствие и установление контакта
   - Обзор процесса интервью

2. **Блок вопросов по компетенциям** (30-40 мин)
   Для каждой ключевой компетенции вакансии:
   - 2-3 поведенческих вопроса (STAR method)
   - Что слушать в ответе (подсказки для HR)
   - Красные флаги

3. **Блок по психометрии** (10-15 мин)
   На основе результатов тестов:
   - Вопросы для проверки специфических черт
   - Вопросы для прояснения потенциальных рисков
   - AI-подсказка: почему этот вопрос важен для данного кандидата

4. **Мотивационный блок** (10 мин)
   - Вопросы про карьерные цели
   - Вопросы про мотивацию

5. **Кейсы/практические задания** (15-20 мин)
   - Предложи 1-2 кейса специфичных для вакансии

6. **Вопросы кандидата** (5-10 мин)
   - Список возможных вопросов от кандидата
   - Рекомендуемые ответы

7. **Завершение** (5 мин)
   - Информация о следующих шагах

Формат: markdown с четкой структурой
Язык: {language}
```

---

### 9.7 Edge Function: `compare-candidates`

**Файл:** `supabase/functions/compare-candidates/index.ts`

**Назначение:** Сравнительный анализ нескольких кандидатов

**Входные данные:**
```typescript
interface CompareCandidatesPayload {
  candidate_ids: string[]  // 2-5 кандидатов
  vacancy_id: string
  organization_id: string
  hr_specialist_id: string
  language: 'ru' | 'kk' | 'en'
}
```

**Логика:**
1. Получить полные анализы всех кандидатов
2. Получить описание вакансии
3. Сформировать промпт
4. Получить от AI сравнительный анализ
5. Конвертировать markdown → HTML
6. Сохранить в `candidate_comparisons`

**Промпт:**
```
Ты - эксперт HR-аналитик. Проведи детальное сравнение кандидатов для вакансии.

ВАКАНСИЯ: {vacancy_title}
{vacancy_description}

КАНДИДАТЫ:

Кандидат 1: {candidate_1_name}
{candidate_1_full_analysis}

Кандидат 2: {candidate_2_name}
{candidate_2_full_analysis}

... (до 5 кандидатов)

Создай сравнительный анализ:

1. **Сводная таблица** (используй markdown table)
   | Критерий | Кандидат 1 | Кандидат 2 | ... |
   |----------|------------|------------|-----|
   | Опыт | ... | ... | ... |
   | Навыки | ... | ... | ... |
   | Личность | ... | ... | ... |

2. **Детальное сравнение по критериям:**
   - Профессиональные навыки
   - Личностные качества
   - Культурный фит
   - Мотивация
   - Потенциал роста

3. **Ранжирование кандидатов** (1-е место, 2-е место и т.д.)
   Для каждого:
   - Место в рейтинге
   - Балл (0-100)
   - Краткое обоснование

4. **Рекомендация**
   - Кого нанять и почему
   - Альтернативные варианты
   - Кого НЕ нанимать и почему

Формат: профессиональный markdown
Язык: {language}
```

---

## 10. ЭТАПЫ РАЗРАБОТКИ

### ВАЖНЫЕ ПРИНЦИПЫ ЭТАПОВ:

1. **Каждый этап полностью завершает свою часть** (production-ready)
2. **Без временных рамок** - работаем сессиями
3. **Логически завершенные блоки** - минимум возвратов к предыдущим этапам
4. **Дизайн сразу финальный** - не делаем заглушки

---

### Этап 1: Инфраструктура и базовая настройка

**Цель:** Создать надежный фундамент проекта

**Задачи:**

1.1 **Инициализация проекта**
- Создать React + TypeScript + Vite проект
- Установить Tailwind CSS 3.4.17 (точная версия!)
- Настроить shadcn/ui (стиль New York, цвет Slate)
- Настроить ESLint, Prettier, TypeScript aliases (@/*)
- Создать базовую папочную структуру FSD

1.2 **Настройка Supabase**
- Создать проект в Supabase
- Применить все миграции БД из ТЗ (в правильном порядке)
- Создать триггеры (`handle_new_user`, `update_candidate_test_count`, и др.)
- Создать все RPC функции
- Настроить Supabase Storage для логотипов (bucket `brand-logos`)
- Сгенерировать типы TypeScript из БД (`supabase gen types typescript`)

1.3 **Интернационализация (i18n)**
- Установить и настроить react-i18next
- Создать структуру файлов переводов:
  ```
  public/locales/
  ├── ru/
  │   ├── common.json
  │   ├── auth.json
  │   ├── dashboard.json
  │   ├── candidates.json
  │   ├── vacancies.json
  │   ├── tests.json
  │   ├── ai-analysis.json
  │   └── talent-market.json
  ├── kk/  (та же структура)
  └── en/  (та же структура)
  ```
- Реализовать переключатель языков
- Добавить persist выбранного языка в localStorage

1.4 **Система тем**
- Настроить темы light/dark через CSS variables
- Реализовать переключатель тем
- Добавить persist темы в localStorage
- Настроить Tailwind для поддержки dark mode

1.5 **Роутинг**
- Настроить React Router v6
- Создать защищенные роуты (Protected Routes)
- Реализовать автоматический редирект по ролям
- Создать базовые layout'ы (AuthLayout, DashboardLayout)

**Результат этапа:**
- Запускается пустое приложение с темами и переводами
- Работает переключение языков и тем
- Настроена БД в Supabase со всеми таблицами и функциями
- Готова структура проекта для дальнейшей разработки

**Визуал:** Простая страница с логотипом, переключателями темы и языка

---

### Этап 2: Аутентификация и организации

**Цель:** Реализовать полный цикл аутентификации для HR и кандидатов

**Задачи:**

2.1 **Система аутентификации**
- Интегрировать Supabase Auth
- Создать единую страницу `/auth/login` с вкладками:
  - "Вход" (универсальный для HR и кандидатов)
  - "Регистрация" (с переключателем HR/Кандидат)
- Реализовать формы:
  - Форма входа (email + password)
  - Форма регистрации HR (ФИО, email, password, название организации, опционально логотип)
  - Форма регистрации кандидата (ФИО, email, password, телефон, категория профессии, навыки)
  - Форма регистрации по токену (для приглашенных кандидатов)
- Настроить автоматическое определение роли
- Реализовать автоматический редирект после входа

2.2 **Zustand stores**
- Создать store для аутентификации (`authStore`)
- Создать store для настроек приложения (`settingsStore`)
- Настроить persist для темы/языка

2.3 **Профили пользователей**
- Страница профиля HR (`/hr/profile`)
- Страница профиля кандидата (`/candidate/profile`)
- White-label настройки (загрузка логотипа, название организации)
- Отображение white-label в header для всех пользователей

**Дизайн страниц:**

*Страница `/auth/login`:*
- Центрированная карточка (max-width: 500px)
- Табы "Вход" / "Регистрация"
- В регистрации: переключатель "Я HR" / "Я Кандидат"
- Для HR: поля ФИО, Email, Пароль, Название организации, загрузка лого
- Для кандидата: ФИО, Email, Пароль, Телефон, выбор категории, выбор навыков (autocomplete с live поиском)
- Современный минималистичный дизайн
- Кнопка "Войти/Зарегистрироваться" с loading состоянием

*Header с white-label:*
- Логотип организации (слева)
- Название организации (рядом с лого)
- Переключатели темы/языка (справа)
- Меню пользователя (аватар + имя)

**Результат этапа:**
- Работает вход для HR и кандидатов
- Работает регистрация HR (создается организация + профиль + начисляются welcome токены)
- Работает свободная регистрация кандидатов
- Работает регистрация по токену
- White-label настройки отображаются во всем приложении

---

### Этап 3: HR Dashboard - основа и справочники

**Цель:** Создать полнофункциональный дашборд для HR

**Задачи:**

3.1 **Базовый дашборд**
- Страница `/hr/dashboard` с 3 вкладками:
  - Анализ резюме
  - Кандидаты
  - Вакансии
- Адаптивная навигация (табы на desktop, select на mobile)
- Динамическая статистика (вызов `get_hr_dashboard_stats`)
- Header с счетчиками (токены, кандидаты)

3.2 **Вкладка "Вакансии"**
- Список вакансий (сетка карточек)
- Кнопка "Создать вакансию"
- Диалог создания вакансии:
  - Название должности
  - Описание
  - Требования (textarea)
  - Зарплатная вилка (опционально)
  - Локация (опционально)
  - Тип занятости (select)
  - Навыки (autocomplete multiple select)
  - Кнопка "Сгенерировать идеальный профиль" (AI)
- Карточка вакансии:
  - Название + статус
  - Краткая воронка кандидатов (счетчики)
  - Кнопки: "К воронке", "Редактировать", "Архивировать"

3.3 **Генерация идеального профиля**
- Страница `/hr/vacancy/:id/profile`
- После AI-генерации: отображение ползунков для всех шкал всех тестов
- Редактирование значений вручную
- Кнопка "Сохранить" (с подсказкой)
- Визуализация: группировка по тестам с описаниями каждой шкалы

3.4 **Вкладка "Кандидаты"**
- Список кандидатов (сетка карточек)
- Кнопка "Сгенерировать пригласительную ссылку"
- Диалог генерации ссылки:
  - Показ ссылки
  - Кнопка "Скопировать"
  - Информация о стоимости (500 токенов)
- История ссылок (таблица с статусами)
- Карточка кандидата:
  - ФИО + категория
  - Прогресс тестирования (6 индикаторов)
  - Статус актуальности тестов (цветной badge)
  - Привязанные вакансии (если есть)
  - Кнопки: "Профиль", "Назначить на вакансию"

**Дизайн:**

*Карточка вакансии:*
- Белая/темная карточка с тенью
- Верх: заголовок + badge статуса (active/closed/archived)
- Середина: краткое описание + ключевые навыки (chips)
- Низ: мини-воронка (inline статистика)
- Кнопки в footer карточки

*Карточка кандидата:*
- Аналогично вакансии
- Верх: имя + категория + статус тестов (зеленый/желтый/красный badge)
- Середина: прогресс-бар тестирования (6/6 completed)
- Низ: привязанные вакансии (chips)

**Результат этапа:**
- HR может создавать вакансии
- HR может генерировать идеальный профиль с помощью AI
- HR может генерировать пригласительные ссылки
- HR видит список своих кандидатов
- Статистика обновляется в реальном времени

---

### Этап 4: Система тестирования (полная)

**Цель:** Реализовать все 6 тестов от начала до конца

**Задачи:**

4.1 **Заполнение БД тестами**
- Создать SQL-скрипты для заполнения:
  - Таблица `tests` (6 тестов)
  - Таблица `test_scales` (все шкалы для каждого теста)
  - Таблица `test_questions` (все вопросы на 3 языках)
- Проверить корректность данных

4.2 **Candidate Dashboard**
- Страница `/candidate/dashboard`
- Отображение доступных тестов (сетка карточек)
- Карточка теста:
  - Название + описание
  - Статус: "Не пройден" / "Пройден X дней назад" (с цветным badge)
  - Кнопка "Пройти тест" / "Пересдать тест"
  - При пересдаче: предупреждение об удалении старых результатов

4.3 **Прохождение теста**
- Страница `/candidate/test/:testId`
- Отображение вопросов (по одному на экране или все сразу - на выбор UX)
- Для шкальных тестов: 5 радио-кнопок (Ликерт)
- Для MBTI: 2 радио-кнопки (Да/Нет)
- Для DISC: 4 радио-кнопки
- Прогресс-бар прохождения
- Кнопка "Завершить тест" (доступна только когда все ответы заполнены)
- При завершении: вызов RPC `calculate_test_results` + сохранение

4.4 **Результаты тестов**
- Страница `/candidate/test/:testId/results`
- **Для кандидата:** Краткие результаты
  - Big Five: радар-чарт с 5 осями
  - MBTI: текстовое описание типа + основные черты
  - DISC: круговая диаграмма
  - EQ: столбчатая диаграмма по 4 компетенциям
  - Soft Skills: радар-чарт
  - Motivation: столбчатая диаграмма

- **Для HR:** Полные результаты
  - Все то же + детальные интерпретации
  - Скачать в PDF

**Дизайн прохождения теста:**
- Чистый интерфейс, никаких отвлечений
- Крупные читаемые вопросы
- Четкие варианты ответов
- Плавные переходы между вопросами
- Прогресс-бар сверху

**Результат этапа:**
- Кандидат может пройти все 6 тестов
- Результаты корректно рассчитываются
- Результаты красиво отображаются
- Работает система пересдачи

---

### Этап 5: AI-анализ и документы

**Цель:** Интегрировать все AI-функции

**Задачи:**

5.1 **Анализ резюме (вкладка 1)**
- Страница (компонент внутри `/hr/dashboard?tab=resume-analysis`)
- Форма загрузки:
  - Выбор вакансий (multiple select, до 7)
  - Drag & drop для PDF резюме (до 20 файлов)
  - Поле "Дополнительные комментарии" (textarea)
  - Выбор языка результата
  - Информационный баннер: стоимость будет рассчитана по факту
  - Кнопка "Анализировать" (с loading)
- После анализа: отображение markdown результата
- История анализов (таблица с возможностью открыть старые)

5.2 **Edge Functions для AI**
- Развернуть все Edge Functions из ТЗ:
  - `analyze-resumes`
  - `generate-ideal-profile`
  - `generate-full-analysis`
  - `generate-document`
  - `generate-structured-interview`
  - `compare-candidates`
- Протестировать каждую функцию
- Настроить обработку ошибок

5.3 **Полный анализ кандидата**
- Страница `/hr/candidate/:id`
- Кнопка "Полный AI-анализ" (доступна только если tests_completed == 6)
- Диалог перед генерацией:
  - Выбор вакансий (до 5)
  - Расчетная стоимость (показываем примерно)
  - Подтверждение
- После генерации: страница редактирования с Tiptap
- Toolbar: Bold, Italic, Heading, BulletList, Link
- Кнопки: "Сохранить", "Поделиться" (публичная ссылка), "Скачать PDF"

5.4 **Генерация документов**
- На странице `/hr/candidate/:id`
- Кнопки: "Пригласить на интервью", "Отправить оффер", "Отправить отказ"
- Диалоги для каждого типа:
  - Поле для дополнительной информации
  - Выбор языка
  - Примерная стоимость
  - Кнопка "Генерировать"
- После генерации: страница редактирования (как в п. 5.3)
- Список сгенерированных документов на странице кандидата

5.5 **Структурированное интервью**
- Кнопка "Сгенерировать план интервью" (доступна если есть полный анализ)
- После генерации: страница редактирования (аналогично документам)
- Скачать в PDF

5.6 **Сравнение кандидатов**
- На странице вакансии кнопка "Сравнить кандидатов"
- Диалог выбора кандидатов (2-5 кандидатов, только с полным анализом)
- После генерации: отображение сравнения
- Сохранение в БД

**Дизайн редактора (Tiptap):**
- Чистый интерфейс
- Toolbar вверху страницы (липкий)
- Редактор на всю ширину (max-width: 800px, центрирован)
- Кнопки действий справа вверху (Сохранить, Поделиться, Скачать)

**Результат этапа:**
- Все AI-функции работают
- HR может генерировать любые документы
- Документы можно редактировать и скачивать
- Токены корректно списываются

---

### Этап 6: Рынок талантов

**Цель:** Реализовать систему поиска и покупки кандидатов

**Задачи:**

6.1 **Страница "Рынок талантов"**
- Страница `/hr/talent-market`
- Выбор вакансии (обязательно для скоринга)
- Фильтры:
  - Категория профессии
  - Навыки (multiple select)
  - Минимум тестов пройдено (slider 0-6)
- Сортировка:
  - По совместимости (default)
  - По дате регистрации
  - По количеству тестов
- Сетка карточек кандидатов

6.2 **Карточка кандидата в рынке**
- Имя + категория
- Навыки (chips)
- Тесты пройдены (X/6)
- Статус актуальности тестов (badge)
- **Баллы совместимости:**
  - Профессиональная (40%): XX%
  - Личностная (60%): XX%
  - **Общая: XX%** (крупно, цветом)
- Кнопка "Подробнее" → открывает Dialog с детализацией
- Кнопка "Добавить" (если еще не куплен)

6.3 **Dialog детализации совместимости**
- Вкладки для каждого теста (Big Five, MBTI, DISC, EQ, Soft Skills, Motivation)
- На мобильных: Select вместо табов
- Для каждой шкалы:
  - Название шкалы + описание
  - Сравнительный слайдер:
    - Идеальное значение (серая метка)
    - Значение кандидата (цветной ползунок)
    - Процент совпадения
  - Цветовая индикация:
    - Зеленый: хорошее совпадение (>80%)
    - Желтый: среднее (60-80%)
    - Красный: слабое (<60%)

6.4 **Покупка кандидата**
- При клике "Добавить": подтверждающий диалог
- Показ стоимости (1000 токенов)
- Выбор вакансии (если не выбрана)
- Подтверждение → вызов RPC `acquire_candidate_from_market`
- После покупки:
  - Кандидат добавляется в `applications`
  - Создается чат-комната
  - Уведомление об успехе

**Дизайн:**

*Карточка в рынке талантов:*
- Увеличенная карточка (больше информации)
- Блок совместимости - визуально выделен
- Два прогресс-бара (проф. и личн. совместимость)
- Общий балл - крупным шрифтом с цветом

*Dialog детализации:*
- Полноэкранный на мобильных
- Large на десктопе
- Вкладки сверху
- Контент вкладки: список шкал с visual comparisons

**Результат этапа:**
- HR видит подходящих кандидатов
- Скоринг работает корректно
- HR может купить кандидата
- После покупки кандидат появляется во вкладке "Кандидаты"

---

### Этап 7: Воронка найма и чат

**Цель:** Управление процессом найма и коммуникация

**Задачи:**

7.1 **Воронка кандидатов (Kanban)**
- Страница `/hr/vacancy/:id/funnel`
- Drag & Drop доска (используем @dnd-kit)
- Колонки статусов:
  - Приглашён
  - Проходит тесты
  - Оценён
  - Интервью
  - Оффер
  - Нанят
  - Отклонён
- Карточки кандидатов:
  - Имя + аватар
  - Прогресс тестирования
  - Дата добавления
  - Кнопка "Открыть профиль"
- Перетаскивание между колонками → автоматическое обновление статуса

7.2 **Real-time чат**
- Использовать Supabase Realtime
- Страница `/hr/chat` и `/candidate/chat`
- Список чатов (sidebar):
  - Для HR: все чаты с кандидатами
  - Для кандидата: все чаты с HR
  - Сортировка по времени последнего сообщения
  - Badge с количеством непрочитанных
- Область чата:
  - История сообщений
  - Поле ввода + кнопка отправки
  - Автопрокрутка к новым
  - Отметка прочитанных (когда открыт чат)

7.3 **Интеграция чата**
- Кнопка "Написать" на странице кандидата (для HR)
- Уведомления о новых сообщениях (badge в header)
- Realtime обновление списка чатов

**Дизайн чата:**
- Классический дизайн мессенджера
- Sidebar слева (список чатов) - 30% ширины
- Область чата справа - 70% ширины
- На мобильных: только одна область (либо список, либо чат)
- Сообщения:
  - Свои справа (цветной фон)
  - Чужие слева (нейтральный фон)

**Результат этапа:**
- HR управляет процессом найма через воронку
- HR и кандидаты могут общаться в чате
- Чат работает в реальном времени
- Уведомления о новых сообщениях

---

### Этап 8: Интеграция Robokassa и финализация

**Цель:** Добавить платежи и завершить платформу

**Задачи:**

8.1 **Интеграция Robokassa**
- Создать страницу `/hr/buy-tokens`
- Пакеты токенов:
  - Starter: 50,000 токенов - XXX руб
  - Professional: 200,000 токенов - XXX руб
  - Enterprise: 500,000 токенов - XXX руб
- Кнопка "Купить" → редирект на Robokassa
- Страница `/payment/success` для успешного платежа
- Страница `/payment/cancel` для отмены
- Webhook для обработки callback от Robokassa
- После успешного платежа: зачисление токенов

8.2 **История платежей**
- Страница `/hr/billing` (для владельца организации)
- Таблица транзакций
- Текущий баланс токенов
- История расходов AI-операций (из `ai_operations_log`)

8.3 **Административные функции**
- Только для владельца организации
- Страница `/hr/team`
- Приглашение других HR в команду (опционально, можно упростить)
- Просмотр активности команды

8.4 **Дашборд кандидата - финализация**
- Страница `/candidate/dashboard`
- Виджеты:
  - Прогресс тестирования
  - Статус профиля в рынке талантов (публичный/скрытый)
  - Активные заявки (если есть)
  - Последние сообщения

8.5 **Полировка UX**
- Все loading состояния
- Все error states
- Пустые состояния (empty states)
- Тосты для уведомлений
- Подтверждающие диалоги для критичных действий
- Skeleton loaders

8.6 **Тестирование**
- Пройти все user flows
- Проверить адаптивность (320px - desktop)
- Проверить темную тему
- Проверить все 3 языка
- Проверить RLS политики
- Load testing (опционально)

**Результат этапа:**
- Полностью рабочая платформа
- Работают платежи
- Все функции доступны
- Production-ready приложение

---

## 11. ДИЗАЙН-СИСТЕМА И UI/UX

### 11.1 Цветовая палитра

**Основная палитра (Slate из shadcn):**
```css
/* Light mode */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--card: 0 0% 100%;
--card-foreground: 222.2 84% 4.9%;
--primary: 222.2 47.4% 11.2%;
--primary-foreground: 210 40% 98%;

/* Dark mode */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--card: 222.2 84% 4.9%;
--card-foreground: 210 40% 98%;
--primary: 210 40% 98%;
--primary-foreground: 222.2 47.4% 11.2%;
```

**Семантические цвета:**
```css
/* Success */
--success: 142 76% 36%;
--success-foreground: 355 100% 100%;

/* Warning */
--warning: 45 93% 47%;
--warning-foreground: 0 0% 100%;

/* Error */
--destructive: 0 84% 60%;
--destructive-foreground: 0 0% 100%;

/* Info */
--info: 217 91% 60%;
--info-foreground: 0 0% 100%;
```

---

### 11.2 Типографика

**Шрифт:** Inter (Google Fonts)

**Размеры:**
- h1: 2.5rem (40px) - font-bold
- h2: 2rem (32px) - font-semibold
- h3: 1.5rem (24px) - font-semibold
- h4: 1.25rem (20px) - font-medium
- body: 1rem (16px) - font-normal
- small: 0.875rem (14px) - font-normal
- xs: 0.75rem (12px) - font-normal

---

### 11.3 Spacing

**Система 4px:**
- 0: 0px
- 1: 4px
- 2: 8px
- 3: 12px
- 4: 16px
- 5: 20px
- 6: 24px
- 8: 32px
- 10: 40px
- 12: 48px
- 16: 64px
- 20: 80px

---

### 11.4 Компоненты

**Карточки (Card):**
- Белый/темный фон
- Border: 1px solid border-color
- Border-radius: 8px
- Padding: 24px
- Shadow: sm (light), none (dark)

**Кнопки (Button):**
- Primary: background-primary, text-primary-foreground
- Secondary: background-secondary, text-secondary-foreground
- Outline: border-input, background-transparent
- Ghost: background-transparent, hover:background-accent
- Destructive: background-destructive, text-destructive-foreground
- Height: 40px (default), 36px (sm), 44px (lg)
- Border-radius: 6px
- Font-weight: 500

**Inputs:**
- Height: 40px
- Border: 1px solid border-color
- Border-radius: 6px
- Padding: 8px 12px
- Focus: ring-2 ring-primary

---

### 11.5 Адаптивность

**Breakpoints:**
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

**Принципы:**
- Mobile-first подход
- Минимальная ширина: 320px
- На мобильных: стек вертикально, sidebar → drawer
- На десктопе: side-by-side, multi-column layouts

---

**КОНЕЦ ТЕХНИЧЕСКОГО ЗАДАНИЯ**

---

## ЗАКЛЮЧЕНИЕ

Это детальное техническое задание покрывает все аспекты HR Platform v2.0:

✅ Полная архитектура базы данных с триггерами и RPC функциями  
✅ Детальное описание всех 6 психометрических тестов  
✅ Продуманная система скоринга в "Рынке талантов"  
✅ Все Edge Functions для AI интеграции  
✅ Поэтапный план разработки с конкретными задачами  
✅ Дизайн-система и UI/UX guidelines  

**Ключевые преимущества этой архитектуры:**

1. **Простота** - избегаем избыточной сложности
2. **Продуманность** - все user flows и бизнес-логика проработаны
3. **Масштабируемость** - модульная FSD архитектура
4. **Удобство администрирования** - все управляется через Supabase
5. **Production-ready** - каждый этап завершает свою часть полностью

Платформа готова к разработке! 🚀