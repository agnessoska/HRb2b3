-- RPC functions for AI Assistant Function Calling tools

-- 1. Search candidates globally within organization
CREATE OR REPLACE FUNCTION public.search_candidates_v2(
  p_organization_id uuid,
  p_query text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_org_id uuid;
  v_result jsonb;
BEGIN
  -- Security check
  SELECT organization_id INTO v_user_org_id FROM hr_specialists WHERE user_id = auth.uid();
  IF v_user_org_id IS NULL OR v_user_org_id != p_organization_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_agg(c) INTO v_result
  FROM (
    SELECT 
      c.id, 
      c.full_name, 
      c.email,
      c.tests_completed,
      cat.name_ru as category_name,
      a.status as funnel_status,
      v.title as vacancy_title
    FROM candidates c
    LEFT JOIN professional_categories cat ON c.category_id = cat.id
    LEFT JOIN applications a ON c.id = a.candidate_id AND a.organization_id = p_organization_id
    LEFT JOIN vacancies v ON a.vacancy_id = v.id
    WHERE (c.invited_by_organization_id = p_organization_id OR a.organization_id = p_organization_id)
      AND (p_query IS NULL OR c.full_name ILIKE '%' || p_query || '%' OR c.email ILIKE '%' || p_query || '%')
      AND (p_status IS NULL OR a.status = p_status)
    ORDER BY c.created_at DESC
    LIMIT p_limit
  ) c;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 2. Get deep candidate details
CREATE OR REPLACE FUNCTION public.get_candidate_details_v2(
  p_organization_id uuid,
  p_candidate_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_org_id uuid;
  v_candidate jsonb;
  v_tests jsonb;
  v_interviews jsonb;
  v_applications jsonb;
BEGIN
  -- Security check
  SELECT organization_id INTO v_user_org_id FROM hr_specialists WHERE user_id = auth.uid();
  IF v_user_org_id IS NULL OR v_user_org_id != p_organization_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Profile and skills
  SELECT to_jsonb(c) INTO v_candidate
  FROM (
    SELECT *, 
      (SELECT jsonb_agg(canonical_skill) FROM candidate_skills WHERE candidate_id = candidates.id) as skills,
      (SELECT name_ru FROM professional_categories WHERE id = candidates.category_id) as category_name
    FROM candidates
    WHERE id = p_candidate_id
  ) c;

  IF v_candidate IS NULL THEN RETURN NULL; END IF;

  -- Test results
  SELECT jsonb_agg(t) INTO v_tests
  FROM (
    SELECT 
      t.code as test_code,
      t.name_ru as test_name,
      tr.normalized_scores,
      tr.detailed_result,
      tr.completed_at
    FROM candidate_test_results tr
    JOIN tests t ON tr.test_id = t.id
    WHERE tr.candidate_id = p_candidate_id
  ) t;

  -- Interview sessions
  SELECT jsonb_agg(i) INTO v_interviews
  FROM (
    SELECT 
      s.id, s.status, s.created_at, s.completed_at,
      s.session_data->'completion'->>'recommendation' as recommendation,
      s.session_data->'completion'->>'overall_impression' as impression,
      v.title as vacancy_title
    FROM interview_sessions s
    JOIN vacancies v ON s.vacancy_id = v.id
    WHERE s.candidate_id = p_candidate_id AND s.organization_id = p_organization_id
    ORDER BY s.created_at DESC
  ) i;

  -- Current applications
  SELECT jsonb_agg(a) INTO v_applications
  FROM (
    SELECT a.id, a.status, a.created_at, v.title as vacancy_title
    FROM applications a
    JOIN vacancies v ON a.vacancy_id = v.id
    WHERE a.candidate_id = p_candidate_id AND a.organization_id = p_organization_id
  ) a;

  RETURN jsonb_build_object(
    'profile', v_candidate,
    'test_results', COALESCE(v_tests, '[]'::jsonb),
    'interviews', COALESCE(v_interviews, '[]'::jsonb),
    'applications', COALESCE(v_applications, '[]'::jsonb)
  );
END;
$$;

-- 3. Get deep vacancy details
CREATE OR REPLACE FUNCTION public.get_vacancy_details_v2(
  p_organization_id uuid,
  p_vacancy_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_org_id uuid;
  v_result jsonb;
BEGIN
  -- Security check
  SELECT organization_id INTO v_user_org_id FROM hr_specialists WHERE user_id = auth.uid();
  IF v_user_org_id IS NULL OR v_user_org_id != p_organization_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT to_jsonb(v) INTO v_result
  FROM (
    SELECT *, 
      (SELECT jsonb_agg(canonical_skill) FROM vacancy_skills WHERE vacancy_id = vacancies.id) as skills
    FROM vacancies
    WHERE id = p_vacancy_id AND organization_id = p_organization_id
  ) v;

  RETURN v_result;
END;
$$;

-- 4. List vacancies with filters
CREATE OR REPLACE FUNCTION public.list_vacancies_v2(
  p_organization_id uuid,
  p_status text DEFAULT 'active',
  p_limit int DEFAULT 50
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_org_id uuid;
  v_result jsonb;
BEGIN
  -- Security check
  SELECT organization_id INTO v_user_org_id FROM hr_specialists WHERE user_id = auth.uid();
  IF v_user_org_id IS NULL OR v_user_org_id != p_organization_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_agg(v) INTO v_result
  FROM (
    SELECT id, title, status, created_at, salary_min, salary_max, currency
    FROM vacancies
    WHERE organization_id = p_organization_id 
      AND (p_status = 'all' OR status = p_status)
    ORDER BY created_at DESC
    LIMIT p_limit
  ) v;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 5. Get organization summary stats
CREATE OR REPLACE FUNCTION public.get_organization_stats_v2(
  p_organization_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_org_id uuid;
  v_funnel_stats jsonb;
  v_token_balance int;
BEGIN
  -- Security check
  SELECT organization_id INTO v_user_org_id FROM hr_specialists WHERE user_id = auth.uid();
  IF v_user_org_id IS NULL OR v_user_org_id != p_organization_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT token_balance INTO v_token_balance FROM organizations WHERE id = p_organization_id;

  SELECT jsonb_object_agg(status, count) INTO v_funnel_stats
  FROM (
    SELECT status, count(*)::int as count
    FROM applications
    WHERE organization_id = p_organization_id
    GROUP BY status
  ) s;

  RETURN jsonb_build_object(
    'token_balance', v_token_balance,
    'funnel_stats', COALESCE(v_funnel_stats, '{}'::jsonb),
    'total_active_vacancies', (SELECT count(*) FROM vacancies WHERE organization_id = p_organization_id AND status = 'active'),
    'total_candidates', (SELECT count(*) FROM candidates WHERE invited_by_organization_id = p_organization_id)
  );
END;
$$;