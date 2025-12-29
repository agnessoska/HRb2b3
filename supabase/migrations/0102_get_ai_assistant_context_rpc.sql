-- RPC function to gather comprehensive context for the AI Assistant
-- This function combines multiple queries into one for performance and better security

CREATE OR REPLACE FUNCTION public.get_ai_assistant_context(
  p_organization_id uuid,
  p_context_type text,
  p_context_entity_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_org_id uuid;
  v_result jsonb;
  v_org_data jsonb;
  v_vacancies jsonb;
  v_candidates jsonb;
  v_funnel_stats jsonb;
  v_focused_entity jsonb;
  v_recent_ops jsonb;
  v_candidate_tests jsonb;
  v_candidate_interviews jsonb;
BEGIN
  -- 1. Security check: does the current user belong to this organization?
  SELECT organization_id INTO v_user_org_id
  FROM hr_specialists
  WHERE user_id = auth.uid();

  IF v_user_org_id IS NULL OR v_user_org_id != p_organization_id THEN
    RAISE EXCEPTION 'Access denied: User does not belong to the specified organization';
  END IF;

  -- 2. Fetch Organization Data
  SELECT jsonb_build_object(
    'name', name,
    'culture_description', culture_description,
    'token_balance', token_balance
  ) INTO v_org_data
  FROM organizations
  WHERE id = p_organization_id;

  -- 3. Fetch Active Vacancies (compact)
  SELECT jsonb_agg(v) INTO v_vacancies
  FROM (
    SELECT 
      id, title, salary_min, salary_max, currency,
      (SELECT jsonb_agg(canonical_skill) FROM vacancy_skills WHERE vacancy_id = vacancies.id) as skills
    FROM vacancies
    WHERE organization_id = p_organization_id AND status = 'active'
    LIMIT 10
  ) v;

  -- 4. Fetch Recent Candidates (compact)
  SELECT jsonb_agg(c) INTO v_candidates
  FROM (
    SELECT 
      c.id, c.full_name, c.tests_completed,
      cat.name_ru as category_name
    FROM candidates c
    LEFT JOIN professional_categories cat ON c.category_id = cat.id
    WHERE c.invited_by_organization_id = p_organization_id
    ORDER BY c.created_at DESC
    LIMIT 20
  ) c;

  -- 5. Fetch Funnel Stats
  SELECT jsonb_object_agg(status, count) INTO v_funnel_stats
  FROM (
    SELECT status, count(*)::int as count
    FROM applications
    WHERE organization_id = p_organization_id
    GROUP BY status
  ) s;

  -- 6. Fetch Focused Entity Details
  IF p_context_type = 'vacancy' AND p_context_entity_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'type', 'vacancy',
      'data', (
        SELECT to_jsonb(v) FROM (
          SELECT *, 
            (SELECT jsonb_agg(canonical_skill) FROM vacancy_skills WHERE vacancy_id = vacancies.id) as skills
          FROM vacancies v
          WHERE id = p_context_entity_id AND organization_id = p_organization_id
        ) v
      )
    ) INTO v_focused_entity;
  
  ELSIF p_context_type = 'candidate' AND p_context_entity_id IS NOT NULL THEN
    -- Fetch deep candidate data: tests and interviews
    SELECT jsonb_agg(t) INTO v_candidate_tests
    FROM (
      SELECT 
        tr.test_id,
        t.code as test_code,
        t.name_ru as test_name,
        tr.normalized_scores,
        tr.detailed_result,
        tr.completed_at
      FROM candidate_test_results tr
      JOIN tests t ON tr.test_id = t.id
      WHERE tr.candidate_id = p_context_entity_id
    ) t;

    SELECT jsonb_agg(i) INTO v_candidate_interviews
    FROM (
      SELECT 
        s.id,
        s.status,
        s.language,
        s.created_at,
        s.completed_at,
        s.session_data->'completion'->>'recommendation' as recommendation,
        s.session_data->'completion'->>'overall_impression' as impression,
        v.title as vacancy_title
      FROM interview_sessions s
      JOIN vacancies v ON s.vacancy_id = v.id
      WHERE s.candidate_id = p_context_entity_id AND s.organization_id = p_organization_id
      ORDER BY s.created_at DESC
    ) i;

    SELECT jsonb_build_object(
      'type', 'candidate',
      'data', (
        SELECT to_jsonb(c) FROM (
          SELECT *, 
            (SELECT jsonb_agg(canonical_skill) FROM candidate_skills WHERE candidate_id = candidates.id) as skills
          FROM candidates
          WHERE id = p_context_entity_id
        ) c
      ),
      'test_results', COALESCE(v_candidate_tests, '[]'::jsonb),
      'interviews', COALESCE(v_candidate_interviews, '[]'::jsonb)
    ) INTO v_focused_entity;
  END IF;

  -- 7. Fetch Recent AI Operations
  SELECT jsonb_agg(o) INTO v_recent_ops
  FROM (
    SELECT operation_type, created_at, success
    FROM ai_operations_log
    WHERE organization_id = p_organization_id
    ORDER BY created_at DESC
    LIMIT 5
  ) o;

  -- Combine everything
  v_result := jsonb_build_object(
    'org', v_org_data,
    'vacancies', COALESCE(v_vacancies, '[]'::jsonb),
    'candidates', COALESCE(v_candidates, '[]'::jsonb),
    'funnel_stats', COALESCE(v_funnel_stats, '{}'::jsonb),
    'focused_entity', v_focused_entity,
    'recent_ai_operations', COALESCE(v_recent_ops, '[]'::jsonb)
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_ai_assistant_context IS 'Gathers comprehensive organization and entity context for the AI Assistant in one secure call.';