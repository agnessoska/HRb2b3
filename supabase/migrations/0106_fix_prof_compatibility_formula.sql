-- Обновляем функцию get_candidate_compatibility_scores с упрощенной формулой профессиональной совместимости
-- Теперь каждый навык имеет равный вес: (кол-во совпадений / общее кол-во навыков вакансии) * 100

CREATE OR REPLACE FUNCTION public.get_candidate_compatibility_scores(
  p_vacancy_id uuid,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  candidate_id uuid,
  full_name text,
  category_id uuid,
  tests_completed integer,
  tests_last_updated_at timestamptz,
  professional_compatibility numeric,
  personal_compatibility numeric,
  overall_compatibility numeric,
  compatibility_details jsonb,
  avatar_url text,
  skills jsonb,
  category jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ideal_profile jsonb;
BEGIN
  -- Get the ideal profile for the vacancy
  SELECT ideal_profile INTO v_ideal_profile
  FROM vacancies
  WHERE id = p_vacancy_id;
  
  IF v_ideal_profile IS NULL THEN
    RAISE EXCEPTION 'Vacancy not found or ideal profile not generated';
  END IF;
  
  RETURN QUERY
  WITH 
  -- Get all vacancy skills (simplified: no required/optional weights for now as requested)
  all_vacancy_skills AS (
    SELECT canonical_skill FROM vacancy_skills WHERE vacancy_id = p_vacancy_id
  ),
  
  -- Get public candidates with all tests completed
  eligible_candidates AS (
    SELECT 
      c.id, 
      c.full_name, 
      c.category_id, 
      c.tests_completed, 
      c.tests_last_updated_at, 
      c.avatar_url,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object('name', sd.name, 'canonical_name', sd.canonical_name))
        FROM candidate_skills cs
        JOIN skills_dictionary sd ON sd.canonical_name = cs.canonical_skill
        WHERE cs.candidate_id = c.id AND sd.language = 'ru'
      ), '[]'::jsonb) as candidate_skills_json,
      COALESCE((
        SELECT jsonb_build_object('id', pc.id, 'name_ru', pc.name_ru, 'name_en', pc.name_en, 'name_kk', pc.name_kk)
        FROM professional_categories pc
        WHERE pc.id = c.category_id
      ), '{}'::jsonb) as category_json
    FROM candidates c
    WHERE c.is_public = true AND c.tests_completed = 6
  ),
  
  -- Calculate professional compatibility
  prof_compat AS (
    SELECT 
      ec.id as c_id,
      COALESCE(
        (
          (SELECT COUNT(*)::float 
           FROM all_vacancy_skills avs 
           WHERE avs.canonical_skill IN (
             SELECT cs.canonical_skill FROM candidate_skills cs WHERE cs.candidate_id = ec.id
           ))
          / NULLIF((SELECT COUNT(*) FROM all_vacancy_skills), 0)
        ) * 100, 
        0
      ) as prof_score
    FROM eligible_candidates ec
  ),
  
  -- Calculate personal compatibility
  pers_compat AS (
    SELECT
      ec.id as c_id,
      calculate_personal_compatibility_v2(ec.id, v_ideal_profile) as pers_data
    FROM eligible_candidates ec
  )
  
  SELECT 
    ec.id,
    ec.full_name,
    ec.category_id,
    ec.tests_completed,
    ec.tests_last_updated_at,
    ROUND(pc.prof_score::numeric, 2) as professional_compatibility,
    ROUND(COALESCE((psc.pers_data->>'score')::numeric, 0), 2) as personal_compatibility,
    ROUND((pc.prof_score * 0.4 + COALESCE((psc.pers_data->>'score')::numeric, 0) * 0.6)::numeric, 2) as overall_compatibility,
    COALESCE(psc.pers_data->'details', '{}'::jsonb) as compatibility_details,
    ec.avatar_url,
    ec.candidate_skills_json as skills,
    ec.category_json as category
  FROM eligible_candidates ec
  LEFT JOIN prof_compat pc ON pc.c_id = ec.id
  LEFT JOIN pers_compat psc ON psc.c_id = ec.id
  ORDER BY (pc.prof_score * 0.4 + COALESCE((psc.pers_data->>'score')::numeric, 0) * 0.6) DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
