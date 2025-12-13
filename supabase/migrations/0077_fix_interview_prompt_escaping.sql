-- Fix interview prompt to avoid JSON parsing errors from AI
-- Use simpler, more reliable prompt that produces valid JSON

UPDATE public.ai_prompts 
SET prompt_text = E'Ты - эксперт по проведению структурированных интервью. Создай КОМПАКТНЫЙ план интервью в формате JSON.

ДАННЫЕ КАНДИДАТА:
Имя: {candidate_name}
Категория: {category}
Опыт: {experience}
Навыки: {skills}

РЕЗУЛЬТАТЫ ТЕСТОВ:
{test_results}

ВАКАНСИЯ:
{vacancy_title}
{vacancy_description}

ЗАДАЧА: Создай JSON-план интервью. Будь КРАТОК и используй простой язык без сложных конструкций.

СТРУКТУРА:
{
  "candidate_name": "{candidate_name}",
  "vacancy_title": "{vacancy_title}",
  "estimated_duration": 60,
  "sections": [
    {
      "id": "intro",
      "title": "Введение",
      "time_allocation": 5,
      "description": "Установление контакта",
      "items": [
        {"type": "script", "content": "Текст приветствия"},
        {"type": "ice_breaker", "question": "Вопрос для разрядки", "notes_placeholder": "Первое впечатление"}
      ]
    },
    {
      "id": "experience",
      "title": "Опыт и компетенции",
      "time_allocation": 20,
      "description": "Проверка навыков",
      "items": [
        {"type": "question", "category": "technical", "question": "Вопрос по навыку", "what_to_listen_for": "Что искать", "red_flags": ["Признак"], "rating_enabled": true}
      ]
    },
    {
      "id": "psychometric",
      "title": "Психометрическая проверка",
      "time_allocation": 15,
      "description": "Проверка рисков из тестов",
      "focus": "critical",
      "items": [
        {"type": "risk_check", "risk_description": "Описание риска", "question": "Вопрос", "what_to_listen_for": "Что искать", "rating_enabled": true}
      ]
    },
    {
      "id": "motivation",
      "title": "Мотивация",
      "time_allocation": 10,
      "description": "Проверка соответствия",
      "items": [
        {"type": "question", "category": "motivation", "question": "Вопрос", "what_to_listen_for": "Что искать", "rating_enabled": true}
      ]
    },
    {
      "id": "conclusion",
      "title": "Заключение",
      "time_allocation": 5,
      "description": "Вопросы кандидата",
      "items": [{"type": "script", "content": "Следующие шаги"}]
    }
  ]
}

ВАЖНО:
1. Отвечай ТОЛЬКО валидным JSON без code blocks
2. Используй простые формулировки без сложных предложений
3. В секции experience: 3-4 вопроса
4. В секции psychometric: 2 проверки (1 риск + 1 сильная сторона)
5. В секции motivation: 2 вопроса
6. rating_enabled: true только для question/risk_check/strength_check
7. Язык: {language}
8. Без эмодзи'
WHERE operation_type = 'structured_interview' AND version = 'v3';