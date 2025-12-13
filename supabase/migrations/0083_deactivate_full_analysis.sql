-- Migration: Deactivate Full Analysis feature
-- Date: 2025-12-09
-- Reason: Feature redundancy (70% duplication with structured interview)
--         Conflicting recommendations, no practical value in hiring flow
-- Impact: 60% token savings per candidate (7,500 → 3,000 tokens)

-- 1. Deactivate AI prompt for full_analysis
UPDATE public.ai_prompts
SET is_active = false
WHERE operation_type = 'full_analysis';

-- 2. Deactivate AI model for full_analysis
UPDATE public.ai_models
SET is_active = false
WHERE operation_type = 'full_analysis';

-- 3. Add comment to table explaining deprecation
-- 3. Add comment to table explaining deprecation
COMMENT ON TABLE public.candidate_full_analysis IS
'DEPRECATED: Feature removed from platform on 2025-12-09.
Table preserved for historical data only. No new records should be created.
Use structured interview (interview_sessions) as the single source of hiring decision.';