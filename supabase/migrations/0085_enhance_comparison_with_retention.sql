-- Migration: Enhance Candidate Comparison with Retention & Timeline Analysis
-- Date: 2025-12-09
-- Purpose: Add retention analysis and timeline recommendations to comparison
-- Compensates for removed full analysis feature
-- IMPORTANT: Maximum 10 candidates per comparison to prevent Edge Function timeout

-- Update comparison prompt to v2 with retention and timeline
UPDATE public.ai_prompts
SET 
  prompt_text = 'Ты - эксперт HR-аналитик. Проведи детальное сравнение кандидатов для вакансии.

ВАКАНСИЯ: {vacancy_title}
{vacancy_description}

КАНДИДАТЫ С ПОЛНЫМИ ДАННЫМИ (профиль + все 6 психометрических тестов):

{candidates_data}

Создай ДЕТАЛЬНОЕ сравнение в формате JSON:

{
  "comparison_matrix": {
    "categories": ["Профессиональные навыки", "Личностные качества", "Культурный fit", "Мотивация"],
    "scores": {
      "candidate_id_1": {
        "professional": 90,
        "personality": 85,
        "cultural": 88,
        "motivation": 92
      }
    }
  },
  "ranked_candidates": [
    {
      "candidate_id": "uuid",
      "rank": 1,
      "overall_score": 95,
      "summary": "Краткая характеристика и почему на 1 месте",
      "key_strengths": ["Сильная сторона 1", "Сторона 2", "Сторона 3"],
      "weaknesses": ["Слабая сторона 1", "Сторона 2"],
      "professional_score": 90,
      "personality_score": 85,
      "cultural_score": 88,
      "motivation_score": 92
    }
  ],
  "retention_analysis": {
    "highest_retention_candidate": "uuid",
    "retention_scores": {
      "candidate_id_1": 88,
      "candidate_id_2": 75
    },
    "retention_factors_comparison": "Детальный анализ факторов удержания для каждого кандидата. Кто останется в компании долго и почему.",
    "turnover_risks": {
      "candidate_id_1": {
        "risk_level": "low",
        "reasoning": "Высокая мотивация к росту, стабильность важна"
      },
      "candidate_id_2": {
        "risk_level": "medium",
        "reasoning": "Может уйти если нет четкого career path"
      }
    },
    "long_term_value": "Кто принесет наибольшую ценность компании через 2-3 года"
  },
  "timeline_recommendations": {
    "immediate_hire": ["uuid1"],
    "hire_soon": ["uuid2"],
    "consider_later": [],
    "reasoning": "Детальное объяснение почему кого-то нужно нанять немедленно, а кого-то можно подождать."
  },
  "team_dynamics": {
    "best_team_fit": "uuid",
    "reasoning": "На основе DISC, Big Five и Soft Skills анализ того, кто лучше впишется в текущую команду",
    "synergies": [
      {
        "candidate_id": "uuid",
        "synergy": "Дополнит команду своим стилем коммуникации"
      }
    ],
    "potential_conflicts": [
      {
        "candidate_id": "uuid",
        "conflict": "Может конфликтовать с текущим лидом"
      }
    ]
  },
  "final_recommendation": {
    "primary_choice": "uuid",
    "reasoning": "Почему именно этот кандидат",
    "backup_choice": "uuid",
    "backup_reasoning": "Если первый откажется",
    "avoid": ["uuid"],
    "avoid_reasoning": "Кого НЕ рекомендуется нанимать и почему",
    "hiring_sequence": "В каком порядке делать офферы если нужно несколько человек"
  }
}

КРИТИЧЕСКИ ВАЖНО:
1. Отвечай ТОЛЬКО валидным JSON без markdown code blocks
2. Все scores от 0 до 100
3. Retention analysis ОБЯЗАТЕЛЬНА - это ключевая секция
4. Timeline recommendations должны учитывать готовность, срочность, onboarding
5. Team dynamics на основе DISC и Big Five (конкретные примеры)
6. Risk levels: low, medium, high
7. Используй КОНКРЕТНЫЕ примеры из тестов
8. НЕ используй эмодзи

ЯЗЫК ОТВЕТА: {language}',
  version = 'v2',
  updated_at = NOW()
WHERE operation_type = 'candidate_comparison' AND is_active = true;