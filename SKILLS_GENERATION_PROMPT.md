# ТЗ для генерации словаря навыков (Skills Dictionary)

**Цель:** Создать обширную базу данных профессиональных навыков для HR-платформы, покрывающую IT, маркетинг, продажи, финансы и soft skills. База должна быть мультиязычной (RU, EN, KK).

**Таблица базы данных:**
```sql
CREATE TABLE skills_dictionary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,          -- Название навыка на конкретном языке
  canonical_name text NOT NULL, -- Уникальный идентификатор навыка (на английском, lowercase, slug-like)
  language text NOT NULL,       -- Код языка: 'ru', 'en', 'kk'
  category text                 -- Категория навыка
);
```

**Требования к генерации:**

1.  **Мультиязычность**: Для КАЖДОГО навыка должны быть сгенерированы 3 записи (для русского, английского и казахского языков). Все 3 записи должны иметь ОДИНАКОВЫЙ `canonical_name`.
    *   Пример:
        *   `('React', 'react', 'en', 'hard')`
        *   `('React', 'react', 'ru', 'hard')`
        *   `('React', 'react', 'kk', 'hard')`
        *   `('Communication', 'communication', 'en', 'soft')`
        *   `('Коммуникабельность', 'communication', 'ru', 'soft')`
        *   `('Қарым-қатынас', 'communication', 'kk', 'soft')`

2.  **Категории (`category`)**:
    *   `hard` (Профессиональные навыки)
    *   `soft` (Мягкие навыки)
    *   `tool` (Инструменты, софт: Jira, Excel, Photoshop)
    *   `language` (Иностранные языки: English, Spanish)
    *   `framework` (Фреймворки и библиотеки: React, Django)

3.  **Объем и охват**:
    *   Нужно сгенерировать **минимум 1000 уникальных навыков** (итого 3000 записей).
    *   **IT**: Языки программирования (JS, Python, Java...), Фреймворки (React, Vue, Spring...), DevOps (Docker, K8s), БД (PostgreSQL, Mongo).
    *   **Design**: Figma, Adobe Suite, UX Research, Prototyping.
    *   **Marketing**: SEO, SMM, Copywriting, Google Analytics, Target.
    *   **Sales**: B2B Sales, Cold Calling, CRM, Negotiation.
    *   **Finance/Admin**: Excel, 1C, Accounting, Office Management.
    *   **Soft Skills**: Leadership, Time Management, Critical Thinking, Empathy, Teamwork.

4.  **Формат вывода**:
    *   SQL-скрипт с операторами `INSERT INTO`.
    *   Разбить на несколько блоков (багчей) по категориям, чтобы не превысить лимиты длины ответа.

**Пример промпта для AI:**

```text
Сгенерируй SQL-скрипт для наполнения таблицы skills_dictionary.
Нужно создать записи для следующих категорий навыков: [УКАЗАТЬ КАТЕГОРИЮ, НАПРИМЕР: IT Hard Skills].

Структура: (name, canonical_name, language, category)
Языки: en, ru, kk (казахский).
Canonical name должен быть на английском, в нижнем регистре, дефисы вместо пробелов (например: 'project-management').

Примеры:
('Project Management', 'project-management', 'en', 'hard'),
('Управление проектами', 'project-management', 'ru', 'hard'),
('Жобаларды басқару', 'project-management', 'kk', 'hard');

Сгенерируй не менее 50 уникальных навыков (150 записей) для этой категории. Убедись в правильности перевода на казахский язык.
```

**Инструкция по применению:**
1.  Используйте этот промпт в Claude 3.5 Sonnet или GPT-4.
2.  Генерируйте навыки по частям (отдельно IT, отдельно Soft Skills и т.д.).
3.  Сохраните результаты в файлы миграций (например, `supabase/migrations/0025_populate_skills_it.sql`, `0026_populate_skills_soft.sql` и т.д.).
4.  Примените миграции через MCP или SQL Editor.