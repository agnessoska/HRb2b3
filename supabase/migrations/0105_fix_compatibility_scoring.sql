-- 1. Исправляем функцию calculate_personal_compatibility_v2 для надежности и корректной обработки форматов
CREATE OR REPLACE FUNCTION public.calculate_personal_compatibility_v2(
  p_candidate_id uuid,
  p_ideal_profile jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_result jsonb := '{"score": 0, "details": {}}'::jsonb;
  v_total_score numeric := 0;
  v_details jsonb := '{}'::jsonb;
  
  -- Scores
  v_bigfive_score numeric := 0;
  v_mbti_score numeric := 0;
  v_disc_score numeric := 0;
  v_eq_score numeric := 0;
  v_soft_score numeric := 0;
  v_motivation_score numeric := 0;

  -- Details
  v_bigfive_details jsonb := '{}'::jsonb;
  v_mbti_details jsonb := '{}'::jsonb;
  v_disc_details jsonb := '{}'::jsonb;
  v_eq_details jsonb := '{}'::jsonb;
  v_soft_details jsonb := '{}'::jsonb;
  v_motivation_details jsonb := '{}'::jsonb;
  
  v_test_result record;
  v_scale record;
  v_scale_match numeric;
  v_ideal_disc jsonb;
BEGIN
  -- BIG FIVE (25% weight)
  SELECT * INTO v_test_result FROM candidate_test_results ctr JOIN tests t ON t.id = ctr.test_id WHERE ctr.candidate_id = p_candidate_id AND t.code = 'big_five' AND ctr.completed_at IS NOT NULL ORDER BY ctr.completed_at DESC LIMIT 1;
  IF FOUND THEN
    FOR v_scale IN SELECT code, scale_type, optimal_value FROM test_scales WHERE test_id = v_test_result.test_id LOOP
      DECLARE v_ideal_value numeric; v_candidate_value numeric;
      BEGIN
        v_ideal_value := COALESCE((p_ideal_profile->'big_five'->>v_scale.code)::numeric, 50);
        v_candidate_value := COALESCE((v_test_result.normalized_scores->>v_scale.code)::numeric, 0);
        
        IF v_scale.scale_type = 'higher_is_better' THEN 
          v_scale_match := CASE WHEN v_ideal_value = 0 THEN 100 ELSE LEAST(100, (v_candidate_value / v_ideal_value) * 100) END;
        ELSIF v_scale.scale_type = 'lower_is_better' THEN 
          IF v_candidate_value <= v_ideal_value THEN v_scale_match := 100; 
          ELSE v_scale_match := CASE WHEN v_candidate_value = 0 THEN 0 ELSE (v_ideal_value / v_candidate_value) * 100 END; END IF;
        ELSIF v_scale.scale_type = 'optimal' THEN 
          v_scale_match := 100 - ABS(v_candidate_value - v_ideal_value);
        ELSE
          v_scale_match := 0;
        END IF;
        
        v_bigfive_details := jsonb_set(v_bigfive_details, ARRAY[v_scale.code], jsonb_build_object('ideal', v_ideal_value, 'candidate', v_candidate_value, 'match', ROUND(COALESCE(v_scale_match, 0))));
        v_bigfive_score := v_bigfive_score + COALESCE(v_scale_match, 0);
      END;
    END LOOP;
    v_bigfive_score := v_bigfive_score / 5;
  END IF;

  -- MBTI (10% weight)
  SELECT * INTO v_test_result FROM candidate_test_results ctr JOIN tests t ON t.id = ctr.test_id WHERE ctr.candidate_id = p_candidate_id AND t.code = 'mbti' AND ctr.completed_at IS NOT NULL ORDER BY ctr.completed_at DESC LIMIT 1;
  IF FOUND THEN
    DECLARE v_ideal_type text; v_candidate_type text; v_matches integer := 0;
    BEGIN
      v_ideal_type := p_ideal_profile->>'mbti';
      v_candidate_type := v_test_result.detailed_result;
      IF v_ideal_type IS NOT NULL AND v_candidate_type IS NOT NULL AND length(v_ideal_type) = 4 AND length(v_candidate_type) = 4 THEN
        FOR i IN 1..4 LOOP IF substring(v_ideal_type, i, 1) = substring(v_candidate_type, i, 1) THEN v_matches := v_matches + 1; END IF; END LOOP;
        v_mbti_score := (v_matches::float / 4) * 100;
        v_mbti_details := jsonb_build_object('ideal', v_ideal_type, 'candidate', v_candidate_type, 'match', ROUND(v_mbti_score));
      END IF;
    END;
  END IF;

  -- DISC (10% weight)
  -- Обработка DISC: может быть строкой "D" или объектом {"D": 80, ...}
  IF jsonb_typeof(p_ideal_profile->'disc') = 'string' THEN
    v_ideal_disc := jsonb_build_object(
      'D', CASE WHEN p_ideal_profile->>'disc' = 'D' THEN 100 ELSE 0 END,
      'I', CASE WHEN p_ideal_profile->>'disc' = 'I' THEN 100 ELSE 0 END,
      'S', CASE WHEN p_ideal_profile->>'disc' = 'S' THEN 100 ELSE 0 END,
      'C', CASE WHEN p_ideal_profile->>'disc' = 'C' THEN 100 ELSE 0 END
    );
  ELSE
    v_ideal_disc := p_ideal_profile->'disc';
  END IF;

  SELECT * INTO v_test_result FROM candidate_test_results ctr JOIN tests t ON t.id = ctr.test_id WHERE ctr.candidate_id = p_candidate_id AND t.code = 'disc' AND ctr.completed_at IS NOT NULL ORDER BY ctr.completed_at DESC LIMIT 1;
  IF FOUND THEN
    DECLARE v_disc_styles text[] := ARRAY['D', 'I', 'S', 'C']; v_style text; v_ideal_val numeric; v_cand_val numeric; v_total_diff numeric := 0;
    BEGIN
      FOREACH v_style IN ARRAY v_disc_styles LOOP
        v_ideal_val := COALESCE((v_ideal_disc->>v_style)::numeric, 0);
        v_cand_val := COALESCE((v_test_result.normalized_scores->>v_style)::numeric, 0);
        v_total_diff := v_total_diff + ABS(v_ideal_val - v_cand_val);
        v_disc_details := jsonb_set(v_disc_details, ARRAY[v_style], jsonb_build_object('ideal', v_ideal_val, 'candidate', v_cand_val, 'match', ROUND(100 - ABS(v_ideal_val - v_cand_val))));
      END LOOP;
      v_disc_score := 100 - (v_total_diff / 4);
    END;
  END IF;

  -- EQ (20% weight)
  SELECT * INTO v_test_result FROM candidate_test_results ctr JOIN tests t ON t.id = ctr.test_id WHERE ctr.candidate_id = p_candidate_id AND t.code = 'eq' AND ctr.completed_at IS NOT NULL ORDER BY ctr.completed_at DESC LIMIT 1;
  IF FOUND THEN
    DECLARE v_eq_comps text[] := ARRAY['self_awareness', 'self_management', 'social_awareness', 'relationship_management']; v_comp text; v_comp_score numeric := 0;
    BEGIN
      FOREACH v_comp IN ARRAY v_eq_comps LOOP
        DECLARE v_ideal_eq numeric; v_cand_eq numeric;
        BEGIN
          v_ideal_eq := COALESCE((p_ideal_profile->'eq'->>v_comp)::numeric, 50);
          v_cand_eq := COALESCE((v_test_result.normalized_scores->>v_comp)::numeric, 0);
          v_scale_match := CASE WHEN v_ideal_eq = 0 THEN 100 ELSE LEAST(100, (v_cand_eq / v_ideal_eq) * 100) END;
          v_comp_score := v_comp_score + COALESCE(v_scale_match, 0);
          v_eq_details := jsonb_set(v_eq_details, ARRAY[v_comp], jsonb_build_object('ideal', v_ideal_eq, 'candidate', v_cand_eq, 'match', ROUND(COALESCE(v_scale_match, 0))));
        END;
      END LOOP;
      v_eq_score := v_comp_score / 4;
    END;
  END IF;

  -- SOFT SKILLS (20% weight)
  SELECT * INTO v_test_result FROM candidate_test_results ctr JOIN tests t ON t.id = ctr.test_id WHERE ctr.candidate_id = p_candidate_id AND t.code = 'soft_skills' AND ctr.completed_at IS NOT NULL ORDER BY ctr.completed_at DESC LIMIT 1;
  IF FOUND THEN
    DECLARE v_skills text[] := ARRAY['communication', 'teamwork', 'critical_thinking', 'adaptability', 'initiative']; v_skill text; v_skill_score numeric := 0;
    BEGIN
      FOREACH v_skill IN ARRAY v_skills LOOP
        DECLARE v_ideal_skill numeric; v_cand_skill numeric;
        BEGIN
          v_ideal_skill := COALESCE((p_ideal_profile->'soft_skills'->>v_skill)::numeric, 50);
          v_cand_skill := COALESCE((v_test_result.normalized_scores->>v_skill)::numeric, 0);
          v_scale_match := CASE WHEN v_ideal_skill = 0 THEN 100 ELSE LEAST(100, (v_cand_skill / v_ideal_skill) * 100) END;
          v_skill_score := v_skill_score + COALESCE(v_scale_match, 0);
          v_soft_details := jsonb_set(v_soft_details, ARRAY[v_skill], jsonb_build_object('ideal', v_ideal_skill, 'candidate', v_cand_skill, 'match', ROUND(COALESCE(v_scale_match, 0))));
        END;
      END LOOP;
      v_soft_score := v_skill_score / 5;
    END;
  END IF;

  -- MOTIVATION (15% weight)
  SELECT * INTO v_test_result FROM candidate_test_results ctr JOIN tests t ON t.id = ctr.test_id WHERE ctr.candidate_id = p_candidate_id AND t.code = 'motivation' AND ctr.completed_at IS NOT NULL ORDER BY ctr.completed_at DESC LIMIT 1;
  IF FOUND THEN
    DECLARE v_drivers text[] := ARRAY['achievement', 'power', 'affiliation', 'autonomy', 'security', 'growth']; v_driver text; v_driver_score numeric := 0;
    BEGIN
      FOREACH v_driver IN ARRAY v_drivers LOOP
        DECLARE v_ideal_mot numeric; v_cand_mot numeric;
        BEGIN
          v_ideal_mot := COALESCE((p_ideal_profile->'motivation'->>v_driver)::numeric, 50);
          v_cand_mot := COALESCE((v_test_result.normalized_scores->>v_driver)::numeric, 0);
          IF v_driver IN ('achievement', 'growth') THEN 
            v_scale_match := CASE WHEN v_ideal_mot = 0 THEN 100 ELSE LEAST(100, (v_cand_mot / v_ideal_mot) * 100) END;
          ELSE 
            v_scale_match := 100 - ABS(v_cand_mot - v_ideal_mot); 
          END IF;
          v_driver_score := v_driver_score + COALESCE(v_scale_match, 0);
          v_motivation_details := jsonb_set(v_motivation_details, ARRAY[v_driver], jsonb_build_object('ideal', v_ideal_mot, 'candidate', v_cand_mot, 'match', ROUND(COALESCE(v_scale_match, 0))));
        END;
      END LOOP;
      v_motivation_score := v_driver_score / 6;
    END;
  END IF;

  -- FINAL CALCULATION
  v_total_score := (COALESCE(v_bigfive_score, 0) * 0.25) + 
                   (COALESCE(v_mbti_score, 0) * 0.10) + 
                   (COALESCE(v_disc_score, 0) * 0.10) + 
                   (COALESCE(v_eq_score, 0) * 0.20) + 
                   (COALESCE(v_soft_score, 0) * 0.20) + 
                   (COALESCE(v_motivation_score, 0) * 0.15);
                   
  v_details := jsonb_build_object(
    'bigFive', v_bigfive_details, 
    'mbti', v_mbti_details, 
    'disc', v_disc_details, 
    'eq', v_eq_details, 
    'softSkills', v_soft_details, 
    'motivation', v_motivation_details
  );
  
  v_result := jsonb_build_object('score', ROUND(COALESCE(v_total_score, 0), 2), 'details', v_details);
  
  RETURN v_result;
END;
$$;

-- 2. Обновляем основную функцию get_candidate_compatibility_scores для возврата расширенных данных
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
  -- Get vacancy skills
  vacancy_required_skills AS (
    SELECT canonical_skill FROM vacancy_skills WHERE vacancy_id = p_vacancy_id AND is_required = true
  ),
  vacancy_optional_skills AS (
    SELECT canonical_skill FROM vacancy_skills WHERE vacancy_id = p_vacancy_id AND is_required = false
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
          ((SELECT COUNT(*)::float FROM vacancy_required_skills vrs WHERE vrs.canonical_skill IN (SELECT cs.canonical_skill FROM candidate_skills cs WHERE cs.candidate_id = ec.id)) / NULLIF((SELECT COUNT(*) FROM vacancy_required_skills), 0)) * 70 +
          ((SELECT COUNT(*)::float FROM vacancy_optional_skills vos WHERE vos.canonical_skill IN (SELECT cs.canonical_skill FROM candidate_skills cs WHERE cs.candidate_id = ec.id)) / NULLIF((SELECT COUNT(*) FROM vacancy_optional_skills), 0)) * 30
        ), 0
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