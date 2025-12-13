-- Migration: Add analysis_data field and update prompt for full candidate analysis
-- Created: 2025-12-06

-- 1. Add analysis_data column to candidate_full_analysis table
ALTER TABLE candidate_full_analysis
ADD COLUMN IF NOT EXISTS analysis_data JSONB;

-- 2. Update the AI prompt for full_analysis with structured JSON output
UPDATE ai_prompts
SET 
  prompt_text = 'Ты - опытный HR-психолог и эксперт по подбору персонала. Создай детальный профессиональный анализ кандидата на основе его профиля и результатов всех психометрических тестов.

ДАННЫЕ КАНДИДАТА:
Имя: {full_name}
Email: {email}
Телефон: {phone}
Категория: {category}
Опыт работы: {experience}
Образование: {education}
О себе: {about}
Навыки: {skills}

РЕЗУЛЬТАТЫ ПСИХОМЕТРИЧЕСКИХ ТЕСТОВ:

Big Five (Большая пятерка личности):
{big_five_results}

MBTI (Типология Майерс-Бриггс):
{mbti_result}

DISC (Профиль поведения):
{disc_results}

Эмоциональный интеллект (EQ):
{eq_results}

Soft Skills (Мягкие навыки):
{soft_skills_results}

Мотивационный профиль:
{motivation_results}

ВАКАНСИИ ДЛЯ АНАЛИЗА:
{vacancies_descriptions}

КУЛЬТУРА ОРГАНИЗАЦИИ:
{culture_description}

---

Создай ГЛУБОКИЙ и ВСЕСТОРОННИЙ анализ кандидата. Твой ответ должен быть в формате JSON со следующей структурой:

{
  "professional_profile": {
    "summary": "Краткое резюме профессионального профиля (2-3 предложения)",
    "key_strengths": ["Сильная сторона 1", "Сильная сторона 2", "..."],
    "technical_skills": ["Навык 1", "Навык 2", "..."],
    "experience_level": "junior|middle|senior|lead",
    "unique_value": "Что делает этого кандидата особенным"
  },
  "psychological_portrait": {
    "personality_summary": "Общий психологический портрет на основе всех тестов (3-4 предложения)",
    "big_five_insights": "Ключевые инсайты из Big Five теста",
    "mbti_analysis": "Анализ типа MBTI и его влияния на работу",
    "disc_style": "Описание доминирующего стиля DISC",
    "emotional_intelligence": "Оценка EQ и его проявления",
    "behavioral_patterns": ["Паттерн поведения 1", "Паттерн 2", "..."]
  },
  "vacancy_compatibility": [
    {
      "vacancy_title": "Название вакансии",
      "overall_score": 85,
      "professional_fit": 90,
      "cultural_fit": 80,
      "motivation_fit": 85,
      "detailed_analysis": "Детальный анализ совместимости с этой вакансией",
      "recommendation": "hire_strongly|hire|consider|reject",
      "key_matches": ["Что совпадает 1", "Что совпадает 2"],
      "concerns": ["Потенциальная проблема 1", "Проблема 2"]
    }
  ],
  "motivation_analysis": {
    "primary_drivers": ["Драйвер 1", "Драйвер 2", "Драйвер 3"],
    "what_motivates": "Что мотивирует кандидата (детальное описание)",
    "what_demotivates": "Что может демотивировать",
    "career_aspirations": "Карьерные амбиции и цели",
    "retention_factors": ["Фактор удержания 1", "Фактор 2"]
  },
  "potential_risks": [
    {
      "risk": "Описание риска",
      "severity": "high|medium|low",
      "mitigation": "Как минимизировать риск"
    }
  ],
  "communication_guide": {
    "preferred_style": "Как лучше общаться с кандидатом",
    "dos": ["Что делать в коммуникации 1", "Что делать 2"],
    "donts": ["Чего избегать 1", "Чего избегать 2"],
    "conflict_resolution": "Как разрешать конфликты с этим типом личности",
    "feedback_approach": "Как давать обратную связь"
  },
  "final_assessment": {
    "overall_score": 88,
    "hire_recommendation": "hire_strongly|hire|consider|reject",
    "summary": "Финальная рекомендация (2-3 предложения)",
    "best_fit_role": "Для какой роли подходит лучше всего",
    "growth_potential": "Потенциал роста и развития",
    "timeline_recommendation": "immediate|soon|consider_later|reject"
  }
}

КРИТИЧЕСКИ ВАЖНО:
1. Отвечай ТОЛЬКО валидным JSON без markdown code blocks и без дополнительного текста
2. Все поля должны быть заполнены осмысленно на основе предоставленных данных
3. Оценки (scores) должны быть числами от 0 до 100
4. Используй результаты ВСЕХ 6 тестов для создания целостного психологического портрета
5. Recommendation должен быть одним из: hire_strongly, hire, consider, reject
6. Severity должен быть одним из: high, medium, low
7. Experience level: junior, middle, senior, lead
8. Timeline: immediate, soon, consider_later, reject
9. Анализ должен быть конкретным, избегай общих фраз
10. Учитывай культуру организации при оценке культурного соответствия
11. НЕ используй эмодзи

ЯЗЫК ОТВЕТА: {language}',
  version = 'v2',
  updated_at = NOW()
WHERE operation_type = 'full_analysis' AND is_active = true;

-- 3. Update or insert ai_models entry for full_analysis
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM ai_models WHERE operation_type = 'full_analysis' AND is_active = true) THEN
    UPDATE ai_models
    SET 
      max_output_tokens = 8000,
      temperature = 0.5,
      thinking_budget = 5000
    WHERE operation_type = 'full_analysis' AND is_active = true;
  ELSE
    INSERT INTO ai_models (
      id,
      operation_type,
      provider,
      model_name,
      is_active,
      max_output_tokens,
      temperature,
      thinking_budget,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      'full_analysis',
      'anthropic',
      'claude-sonnet-4-20250514',
      true,
      8000,
      0.5,
      5000,
      NOW()
    );
  END IF;
END $$;