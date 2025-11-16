-- Populate ai_models table
INSERT INTO public.ai_models (operation_type, provider, model_name, is_active, max_output_tokens, temperature, thinking_budget)
VALUES
  ('resume_analysis', 'anthropic', 'claude-3-sonnet-20240229', true, 4000, 0.3, 1000),
  ('full_analysis', 'anthropic', 'claude-3-opus-20240229', true, 8000, 0.5, 2000),
  ('candidate_comparison', 'anthropic', 'claude-3-haiku-20240307', true, 4000, 0.4, null),
  ('ideal_profile_generation', 'google', 'gemini-1.5-flash-latest', true, 2000, 0.3, null),
  ('interview_invitation', 'google', 'gemini-1.5-flash-latest', true, 1000, 0.7, null),
  ('job_offer', 'anthropic', 'claude-3-sonnet-20240229', true, 2000, 0.6, null),
  ('rejection_letter', 'google', 'gemini-1.5-flash-latest', true, 1000, 0.8, null),
  ('structured_interview', 'anthropic', 'claude-3-opus-20240229', true, 6000, 0.4, 1500);

-- Populate ai_prompts table
-- Prompt for ideal_profile_generation
INSERT INTO public.ai_prompts (operation_type, version, prompt_text, is_active)
VALUES
  ('ideal_profile_generation', 'v1', 
'Ты - эксперт по психометрии и подбору персонала. На основе описания вакансии создай идеальный психометрический профиль кандидата.

Вакансия:
Должность: {title}
Описание: {description}
Требования: {requirements}

Создай JSON-объект со следующей структурой (значения для шкал должны быть от 0 до 100):

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

ВАЖНО:
- Отвечай ТОЛЬКО валидным JSON, без дополнительного текста.
- НЕ используй markdown code blocks.
- Значения должны быть реалистичными для данной должности.
- Учитывай специфику индустрии и уровень позиции.', true);

-- Prompt for resume_analysis
INSERT INTO public.ai_prompts (operation_type, version, prompt_text, is_active)
VALUES
  ('resume_analysis', 'v1',
'Ты - эксперт HR-аналитик. Проанализируй предоставленные резюме кандидатов и сопоставь их с вакансиями.

Вакансии:
{vacancies_description}

Резюме кандидатов:
{resumes_content}

Дополнительные комментарии HR: {additional_notes}

Задача:
1. Проанализируй каждое резюме.
2. Определи насколько каждый кандидат подходит для каждой вакансии.
3. Выдели топ-5 кандидатов с кратким обоснованием.
4. Укажи кандидатов, которые точно НЕ подходят и почему.

Формат ответа: профессиональный markdown без эмодзи.
Язык ответа: {language}', true);

-- Add other prompts from TZ...
INSERT INTO public.ai_prompts (operation_type, version, prompt_text, is_active)
VALUES
  ('full_analysis', 'v1', '...', true),
  ('candidate_comparison', 'v1', '...', true),
  ('interview_invitation', 'v1', '...', true),
  ('job_offer', 'v1', '...', true),
  ('rejection_letter', 'v1', '...', true),
  ('structured_interview', 'v1', '...', true);

-- For now, we will update the placeholder prompts with real ones later.
UPDATE public.ai_prompts SET prompt_text = 'Placeholder prompt for full_analysis' WHERE operation_type = 'full_analysis';
UPDATE public.ai_prompts SET prompt_text = 'Placeholder prompt for candidate_comparison' WHERE operation_type = 'candidate_comparison';
UPDATE public.ai_prompts SET prompt_text = 'Placeholder prompt for interview_invitation' WHERE operation_type = 'interview_invitation';
UPDATE public.ai_prompts SET prompt_text = 'Placeholder prompt for job_offer' WHERE operation_type = 'job_offer';
UPDATE public.ai_prompts SET prompt_text = 'Placeholder prompt for rejection_letter' WHERE operation_type = 'rejection_letter';
UPDATE public.ai_prompts SET prompt_text = 'Placeholder prompt for structured_interview' WHERE operation_type = 'structured_interview';
