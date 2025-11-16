-- Drop the old function
DROP FUNCTION IF EXISTS public.get_candidate_compatibility_scores(uuid, integer, integer);

-- Recreate the function with additional returned columns
CREATE OR REPLACE FUNCTION public.get_candidate_compatibility_scores(
  p_vacancy_id uuid,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  candidate_id uuid,
  full_name text,
  category json,
  skills json,
  tests_completed integer,
  tests_last_updated_at timestamptz,
  professional_compatibility numeric,
  personal_compatibility numeric,
  overall_compatibility numeric,
  compatibility_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ideal_profile jsonb;
BEGIN
  SELECT ideal_profile INTO v_ideal_profile
  FROM vacancies
  WHERE id = p_vacancy_id;
  
  IF v_ideal_profile IS NULL THEN
    RAISE EXCEPTION 'Vacancy not found or ideal profile not generated';
  END IF;
  
  RETURN QUERY
  WITH 
  vacancy_required_skills AS (
    SELECT canonical_skill FROM vacancy_skills WHERE vacancy_id = p_vacancy_id AND is_required = true
  ),
  vacancy_optional_skills AS (
    SELECT canonical_skill FROM vacancy_skills WHERE vacancy_id = p_vacancy_id AND is_required = false
  ),
  eligible_candidates AS (
    SELECT c.id, c.full_name, c.tests_completed, c.tests_last_updated_at
    FROM candidates c
    WHERE c.is_public = true AND c.tests_completed = 6
  ),
  prof_compat AS (
    SELECT 
      ec.id as candidate_id,
      COALESCE(
        (
          ((SELECT COUNT(*)::float FROM vacancy_required_skills vrs WHERE vrs.canonical_skill IN (SELECT canonical_skill FROM candidate_skills WHERE candidate_id = ec.id)) / NULLIF((SELECT COUNT(*) FROM vacancy_required_skills), 0)) * 70 +
          ((SELECT COUNT(*)::float FROM vacancy_optional_skills vos WHERE vos.canonical_skill IN (SELECT canonical_skill FROM candidate_skills WHERE candidate_id = ec.id)) / NULLIF((SELECT COUNT(*) FROM vacancy_optional_skills), 0)) * 30
        ), 0
      ) as prof_score
    FROM eligible_candidates ec
  ),
  pers_compat AS (
    SELECT
      ec.id as candidate_id,
      calculate_personal_compatibility_v2(ec.id, v_ideal_profile) as pers_data
    FROM eligible_candidates ec
  )
  SELECT 
    ec.id,
    ec.full_name,
    (SELECT json_build_object('id', pc.id, 'name_ru', pc.name_ru) FROM professional_categories pc JOIN candidates c ON c.category_id = pc.id WHERE c.id = ec.id),
    (SELECT json_agg(json_build_object('canonical_skill', cs.canonical_skill)) FROM candidate_skills cs WHERE cs.candidate_id = ec.id),
    ec.tests_completed,
    ec.tests_last_updated_at,
    ROUND(pc.prof_score::numeric, 2),
    ROUND((psc.pers_data->>'score')::numeric, 2),
    ROUND((pc.prof_score * 0.4 + (psc.pers_data->>'score')::numeric * 0.6)::numeric, 2),
    psc.pers_data->'details'
  FROM eligible_candidates ec
  LEFT JOIN prof_compat pc ON pc.candidate_id = ec.id
  LEFT JOIN pers_compat psc ON psc.candidate_id = ec.id
  ORDER BY (pc.prof_score * 0.4 + (psc.pers_data->>'score')::numeric * 0.6) DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
