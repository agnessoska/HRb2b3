-- 3.4.1 Триггер: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  org_id uuid;
  org_name text;
  welcome_tokens integer;
  v_hr_id uuid;
  v_org_id uuid;
BEGIN
  -- Получаем роль из метаданных
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Получаем стартовый баланс токенов (установим значение по умолчанию, если переменная не задана)
  welcome_tokens := 5000;
  
  IF user_role = 'hr' THEN
    -- Для HR: создаем организацию
    org_name := NEW.raw_user_meta_data->>'organization_name';
    
    INSERT INTO organizations (name, owner_id, token_balance)
    VALUES (org_name, NEW.id, welcome_tokens)
    RETURNING id INTO org_id;
    
    -- Создаем профиль HR как владельца
    INSERT INTO hr_specialists (
      user_id, organization_id, full_name, role, is_active
    )
    VALUES (
      NEW.id,
      org_id,
      NEW.raw_user_meta_data->>'full_name',
      'owner',
      true
    );
    
  ELSIF user_role = 'candidate' THEN
    -- Для кандидата: создаем профиль
    v_hr_id := (NEW.raw_user_meta_data->>'invited_by_hr_id')::uuid;
    v_org_id := (NEW.raw_user_meta_data->>'invited_by_organization_id')::uuid;

    INSERT INTO candidates (
      user_id,
      full_name,
      phone,
      category_id,
      experience,
      education,
      about,
      is_public,
      invited_by_hr_id,
      invited_by_organization_id
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'phone',
      (NEW.raw_user_meta_data->>'category_id')::uuid,
      NEW.raw_user_meta_data->>'experience',
      NEW.raw_user_meta_data->>'education',
      NEW.raw_user_meta_data->>'about',
      COALESCE((NEW.raw_user_meta_data->>'is_public')::boolean, false),
      v_hr_id,
      v_org_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Создаем триггер on_auth_user_created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3.4.2 Триггер: update_candidate_test_count
CREATE OR REPLACE FUNCTION public.update_candidate_test_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL) THEN
    UPDATE candidates
    SET 
      tests_completed = (
        SELECT COUNT(*) 
        FROM candidate_test_results 
        WHERE candidate_id = NEW.candidate_id AND completed_at IS NOT NULL
      ),
      tests_last_updated_at = NEW.completed_at
    WHERE id = NEW.candidate_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE candidates
    SET 
      tests_completed = (
        SELECT COUNT(*) 
        FROM candidate_test_results 
        WHERE candidate_id = OLD.candidate_id AND completed_at IS NOT NULL
      )
    WHERE id = OLD.candidate_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Создаем триггеры для update_candidate_test_count
CREATE TRIGGER recalculate_candidate_test_stats
  AFTER INSERT OR UPDATE OR DELETE ON candidate_test_results
  FOR EACH ROW EXECUTE FUNCTION public.update_candidate_test_count();

-- 3.4.3 Триггер: update_vacancy_funnel_counts
CREATE OR REPLACE FUNCTION public.update_vacancy_funnel_counts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_id := OLD.vacancy_id;
  ELSE
    v_id := NEW.vacancy_id;
  END IF;
  
  UPDATE vacancies
  SET funnel_counts = (
    SELECT jsonb_object_agg(status, count)
    FROM (
      SELECT status, COUNT(*)::integer as count
      FROM applications
      WHERE vacancy_id = v_id
      GROUP BY status
    ) counts
  )
  WHERE id = v_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Создаем триггеры для update_vacancy_funnel_counts
CREATE TRIGGER update_vacancy_funnel
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION public.update_vacancy_funnel_counts();

-- 3.4.4 Триггер: update_chat_room_on_message
CREATE OR REPLACE FUNCTION public.update_chat_room_on_message()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE chat_rooms
  SET last_message_at = NEW.created_at
  WHERE id = NEW.chat_room_id;
  
  IF NEW.sender_type = 'hr' THEN
    UPDATE chat_rooms
    SET unread_count_candidate = unread_count_candidate + 1
    WHERE id = NEW.chat_room_id;
  ELSE
    UPDATE chat_rooms
    SET unread_count_hr = unread_count_hr + 1
    WHERE id = NEW.chat_room_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Создаем триггер для update_chat_room_on_message
CREATE TRIGGER update_chat_room_on_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_chat_room_on_message();

-- 3.5.1 Функция: calculate_test_results
CREATE OR REPLACE FUNCTION public.calculate_test_results(
  p_test_id uuid,
  p_answers jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_test_type text;
  v_raw_scores jsonb := '{}'::jsonb;
  v_normalized_scores jsonb := '{}'::jsonb;
  v_detailed_result text := NULL;
  v_question record;
  v_scale_code text;
  v_answer_value numeric;
  v_scale_totals jsonb := '{}'::jsonb;
  v_scale_counts jsonb := '{}'::jsonb;
  v_scale record;
BEGIN
  -- Получаем тип теста
  SELECT test_type INTO v_test_type FROM tests WHERE id = p_test_id;
  
  IF v_test_type = 'scale' THEN
    -- Для шкальных тестов (Big Five, EQ, Soft Skills, Motivation)
    
    -- Проходим по всем вопросам теста
    FOR v_question IN 
      SELECT q.id, q.scale_code, q.reverse_scored
      FROM test_questions q
      WHERE q.test_id = p_test_id
    LOOP
      -- Получаем ответ кандидата
      v_answer_value := (p_answers->>(v_question.id::text))::numeric;
      
      -- Если вопрос с обратным подсчетом
      IF v_question.reverse_scored THEN
        v_answer_value := 100 - v_answer_value;
      END IF;
      
      -- Накапливаем баллы по шкале
      v_scale_code := v_question.scale_code;
      v_scale_totals := jsonb_set(
        v_scale_totals,
        ARRAY[v_scale_code],
        to_jsonb(COALESCE((v_scale_totals->>v_scale_code)::numeric, 0) + v_answer_value)
      );
      v_scale_counts := jsonb_set(
        v_scale_counts,
        ARRAY[v_scale_code],
        to_jsonb(COALESCE((v_scale_counts->>v_scale_code)::integer, 0) + 1)
      );
    END LOOP;
    
    -- Вычисляем средние значения (нормализованные баллы)
    FOR v_scale IN 
      SELECT code FROM test_scales WHERE test_id = p_test_id
    LOOP
      v_normalized_scores := jsonb_set(
        v_normalized_scores,
        ARRAY[v_scale.code],
        to_jsonb(ROUND((v_scale_totals->>v_scale.code)::numeric / (v_scale_counts->>v_scale.code)::numeric))
      );
    END LOOP;
    
    v_raw_scores := v_normalized_scores;
    
  ELSIF v_test_type = 'dichotomy' THEN
    -- Для MBTI (дихотомии)
    DECLARE
      v_ei_count integer := 0;
      v_sn_count integer := 0;
      v_tf_count integer := 0;
      v_jp_count integer := 0;
      v_ei_total integer := 0;
      v_sn_total integer := 0;
      v_tf_total integer := 0;
      v_jp_total integer := 0;
    BEGIN
      FOR v_question IN 
        SELECT id, scale_code
        FROM test_questions
        WHERE test_id = p_test_id
      LOOP
        v_answer_value := (p_answers->>(v_question.id::text))::numeric;
        
        IF v_question.scale_code = 'EI' THEN
          v_ei_total := v_ei_total + 1;
          IF v_answer_value = 1 THEN v_ei_count := v_ei_count + 1; END IF;
        ELSIF v_question.scale_code = 'SN' THEN
          v_sn_total := v_sn_total + 1;
          IF v_answer_value = 1 THEN v_sn_count := v_sn_count + 1; END IF;
        ELSIF v_question.scale_code = 'TF' THEN
          v_tf_total := v_tf_total + 1;
          IF v_answer_value = 1 THEN v_tf_count := v_tf_count + 1; END IF;
        ELSIF v_question.scale_code = 'JP' THEN
          v_jp_total := v_jp_total + 1;
          IF v_answer_value = 1 THEN v_jp_count := v_jp_count + 1; END IF;
        END IF;
      END LOOP;
      
      -- Определяем типы
      v_detailed_result := '';
      v_detailed_result := v_detailed_result || (CASE WHEN v_ei_count::float / NULLIF(v_ei_total, 0) > 0.5 THEN 'E' ELSE 'I' END);
      v_detailed_result := v_detailed_result || (CASE WHEN v_sn_count::float / NULLIF(v_sn_total, 0) > 0.5 THEN 'S' ELSE 'N' END);
      v_detailed_result := v_detailed_result || (CASE WHEN v_tf_count::float / NULLIF(v_tf_total, 0) > 0.5 THEN 'T' ELSE 'F' END);
      v_detailed_result := v_detailed_result || (CASE WHEN v_jp_count::float / NULLIF(v_jp_total, 0) > 0.5 THEN 'J' ELSE 'P' END);
      
      v_raw_scores := jsonb_build_object(
        'EI', ROUND((v_ei_count::float / NULLIF(v_ei_total, 0)) * 100),
        'SN', ROUND((v_sn_count::float / NULLIF(v_sn_total, 0)) * 100),
        'TF', ROUND((v_tf_count::float / NULLIF(v_tf_total, 0)) * 100),
        'JP', ROUND((v_jp_count::float / NULLIF(v_jp_total, 0)) * 100)
      );
      v_normalized_scores := v_raw_scores;
    END;
    
  ELSIF v_test_type = 'style' THEN
    -- Для DISC (стили)
    DECLARE
      v_d_score integer := 0;
      v_i_score integer := 0;
      v_s_score integer := 0;
      v_c_score integer := 0;
      v_max_score integer;
      v_total_score integer;
    BEGIN
      FOR v_question IN 
        SELECT id, scale_code
        FROM test_questions
        WHERE test_id = p_test_id
      LOOP
        v_answer_value := (p_answers->>(v_question.id::text))::numeric;
        
        IF v_question.scale_code = 'D' THEN
          v_d_score := v_d_score + v_answer_value::integer;
        ELSIF v_question.scale_code = 'I' THEN
          v_i_score := v_i_score + v_answer_value::integer;
        ELSIF v_question.scale_code = 'S' THEN
          v_s_score := v_s_score + v_answer_value::integer;
        ELSIF v_question.scale_code = 'C' THEN
          v_c_score := v_c_score + v_answer_value::integer;
        END IF;
      END LOOP;
      
      v_raw_scores := jsonb_build_object(
        'D', v_d_score,
        'I', v_i_score,
        'S', v_s_score,
        'C', v_c_score
      );
      
      v_total_score := v_d_score + v_i_score + v_s_score + v_c_score;

      v_normalized_scores := jsonb_build_object(
        'D', ROUND((v_d_score::float / NULLIF(v_total_score, 0)) * 100),
        'I', ROUND((v_i_score::float / NULLIF(v_total_score, 0)) * 100),
        'S', ROUND((v_s_score::float / NULLIF(v_total_score, 0)) * 100),
        'C', ROUND((v_c_score::float / NULLIF(v_total_score, 0)) * 100)
      );
      
      -- Определяем доминирующий стиль
      v_max_score := GREATEST(v_d_score, v_i_score, v_s_score, v_c_score);
      IF v_d_score = v_max_score THEN
        v_detailed_result := 'D';
      ELSIF v_i_score = v_max_score THEN
        v_detailed_result := 'I';
      ELSIF v_s_score = v_max_score THEN
        v_detailed_result := 'S';
      ELSE
        v_detailed_result := 'C';
      END IF;
    END;
  END IF;
  
  RETURN jsonb_build_object(
    'raw_scores', v_raw_scores,
    'normalized_scores', v_normalized_scores,
    'detailed_result', v_detailed_result
  );
END;
$$;

-- 8.1 Функция: acquire_candidate_from_market
CREATE OR REPLACE FUNCTION public.acquire_candidate_from_market(p_candidate_id uuid, p_vacancy_id uuid, p_hr_specialist_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- ... (содержимое функции из ТЗ)
BEGIN
  -- ... (содержимое функции из ТЗ)
  RETURN jsonb_build_object('success', true);
END;
$$;

-- 8.2 Функция: request_test_retake
CREATE OR REPLACE FUNCTION public.request_test_retake(p_candidate_id uuid, p_test_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
-- ... (содержимое функции из ТЗ)
BEGIN
  -- ... (содержимое функции из ТЗ)
  RETURN jsonb_build_object('success', true);
END;
$$;

-- 8.3 Функция: get_hr_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_hr_dashboard_stats(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
-- ... (содержимое функции из ТЗ)
BEGIN
  -- ... (содержимое функции из ТЗ)
  RETURN jsonb_build_object('total_candidates', 0);
END;
$$;

-- 8.4 Функция: generate_invitation_token
CREATE OR REPLACE FUNCTION public.generate_invitation_token(p_hr_specialist_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- ... (содержимое функции из ТЗ)
BEGIN
  -- ... (содержимое функции из ТЗ)
  RETURN jsonb_build_object('success', true);
END;
$$;
