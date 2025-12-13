-- Migration: Enhance Structured Interview with Retention Analysis
-- Date: 2025-12-09
-- Purpose: Add retention evaluation section to compensate for removed full analysis
-- Changes: Add retention section, timeline field, retention_score field to completion

-- Update the interview prompt to v4 with retention section
INSERT INTO public.ai_prompts (operation_type, version, prompt_text, is_active)
VALUES (
  'structured_interview',
  'v4',
  'Ты - эксперт по проведению структурированных интервью и психометрической оценке. Создай интерактивный план интервью в формате JSON.

ДАННЫЕ КАНДИДАТА:
Имя: {candidate_name}
Категория: {category}
Опыт: {experience}
Образование: {education}
Навыки: {skills}

РЕЗУЛЬТАТЫ ПСИХОМЕТРИЧЕСКИХ ТЕСТОВ (все 6 тестов):
{test_results}

ВАКАНСИЯ:
Должность: {vacancy_title}
Описание: {vacancy_description}

ЗАДАЧА:
Создай структурированный план интервью в формате JSON. План должен быть практичным инструментом для интервьюера с возможностью делать заметки и оценки.

СТРУКТУРА JSON:

{
  "candidate_name": "{candidate_name}",
  "vacancy_title": "{vacancy_title}",
  "estimated_duration": 70,
  "sections": [
    {
      "id": "intro",
      "title": "Введение и установление контакта",
      "time_allocation": 5,
      "description": "Создание комфортной атмосферы для беседы",
      "items": [
        {
          "type": "script",
          "content": "Краткий скрипт приветствия (2-3 предложения)"
        },
        {
          "type": "ice_breaker",
          "question": "Вопрос для разрядки обстановки",
          "notes_placeholder": "Первое впечатление, язык тела, энергетика..."
        }
      ]
    },
    {
      "id": "experience",
      "title": "Проверка опыта и компетенций",
      "time_allocation": 20,
      "description": "Валидация профессиональных навыков",
      "items": [
        {
          "type": "question",
          "category": "technical",
          "question": "Конкретный вопрос по ключевому навыку (используй STAR метод)",
          "what_to_listen_for": "На что обратить внимание в ответе",
          "red_flags": ["Признак 1", "Признак 2"],
          "rating_enabled": true
        }
      ]
    },
    {
      "id": "psychometric",
      "title": "Психометрическая валидация",
      "time_allocation": 15,
      "description": "Проверка гипотез из тестов",
      "focus": "critical",
      "items": [
        {
          "type": "risk_check",
          "risk_description": "Описание риска из теста (например: Высокий нейротизм 75/100)",
          "question": "Вопрос для проверки этого риска",
          "what_to_listen_for": "Что искать: стратегии coping, примеры",
          "red_flags": ["Тревожный признак 1"],
          "rating_enabled": true
        },
        {
          "type": "strength_check",
          "strength_description": "Сильная сторона из тестов",
          "question": "Вопрос, позволяющий продемонстрировать эту силу",
          "what_to_listen_for": "Конкретные примеры",
          "rating_enabled": true
        }
      ]
    },
    {
      "id": "motivation",
      "title": "Мотивация и культурное соответствие",
      "time_allocation": 10,
      "description": "Проверка fit с культурой компании",
      "items": [
        {
          "type": "question",
          "category": "motivation",
          "question": "Что вас мотивирует в работе? (основываясь на тесте Motivation)",
          "what_to_listen_for": "Соответствие драйверам из теста",
          "rating_enabled": true
        }
      ]
    },
    {
      "id": "retention",
      "title": "Долгосрочная перспектива и удержание",
      "time_allocation": 10,
      "description": "Оценка факторов удержания и career fit",
      "focus": "important",
      "items": [
        {
          "type": "question",
          "category": "retention",
          "question": "Что для вас важно в компании долгосрочно? Через 1-2 года?",
          "what_to_listen_for": "Возможности роста, баланс, стабильность, команда, автономность",
          "retention_factors": ["Growth", "Work-life balance", "Stability", "Autonomy", "Team"],
          "rating_enabled": true
        },
        {
          "type": "question",
          "category": "retention",
          "question": "Что может заставить вас задуматься об уходе из компании?",
          "what_to_listen_for": "Red flags для retention: отсутствие роста, микроменеджмент, рутина",
          "rating_enabled": true
        },
        {
          "type": "question",
          "category": "career",
          "question": "Как вы видите свое развитие в ближайшие 3 года?",
          "what_to_listen_for": "Амбиции, реалистичность, соответствие возможностям компании",
          "rating_enabled": true
        }
      ]
    },
    {
      "id": "conclusion",
      "title": "Заключение",
      "time_allocation": 10,
      "description": "Ответы на вопросы кандидата",
      "items": [
        {
          "type": "script",
          "content": "Опишите следующие шаги процесса найма"
        },
        {
          "type": "candidate_questions",
          "expected_questions": ["Возможный вопрос 1", "Возможный вопрос 2"],
          "notes_placeholder": "Какие вопросы задал кандидат..."
        }
      ]
    }
  ]
}

КРИТИЧЕСКИ ВАЖНЫЕ ТРЕБОВАНИЯ:

1. **Формат:** Отвечай ТОЛЬКО валидным JSON без markdown code blocks и без дополнительного текста
2. **Количество вопросов:**
   - Секция "experience": минимум 4 вопроса
   - Секция "psychometric": минимум 2-3 проверки (риски и сильные стороны)
   - Секция "motivation": минимум 2 вопроса
   - Секция "retention": минимум 3 вопроса (НОВОЕ)
3. **Персонализация:** 
   - Все вопросы должны быть конкретными для ЭТОГО кандидата и ЭТОЙ вакансии
   - Используй реальные навыки из профиля
   - Ссылайся на конкретные результаты тестов (не общие фразы)
4. **Психометрия:**
   - В секции "psychometric" обязательно проверь 1-2 риска из тестов
   - Добавь 1-2 вопроса на проверку сильных сторон
   - Например: если нейротизм высокий → вопрос про стресс
   - Если низкая согласительность → вопрос про конфликты
5. **Retention (НОВОЕ):**
   - Секция "retention" КРИТИЧНА для оценки долгосрочного fit
   - Вопросы должны выявить факторы удержания кандидата
   - Оценить риск turnover на основе мотивационного профиля
6. **Подсказки:**
   - "what_to_listen_for" должно быть конкретным и практичным
   - "red_flags" - реальные признаки проблем
7. **rating_enabled:**
   - true для всех ключевых вопросов (не для скриптов)
8. **Экранирование:** Если в тексте есть кавычки - используй одинарные ('') вместо двойных ("")
9. **Язык:** Весь контент должен быть на языке: {language}
10. **Без эмодзи**

ВАЛИДАЦИЯ:
- Проверь что JSON валидный
- Все поля заполнены
- time_allocation суммарно = estimated_duration (70 минут)
- Минимум 6 секций (intro, experience, psychometric, motivation, retention, conclusion)',
  true
)
ON CONFLICT (operation_type, version) 
DO UPDATE SET 
  prompt_text = EXCLUDED.prompt_text,
  is_active = true,
  updated_at = NOW();

-- Deactivate older versions
UPDATE public.ai_prompts
SET is_active = false
WHERE operation_type = 'structured_interview' AND version != 'v4';

-- Update model config (increase duration for retention section)
UPDATE public.ai_models
SET 
  max_output_tokens = 10000,
  thinking_budget = 5000
WHERE operation_type = 'structured_interview';