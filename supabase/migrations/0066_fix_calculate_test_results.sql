-- Исправляем функцию calculate_test_results для работы с question_number вместо id
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
      SELECT q.question_number, q.scale_code, q.reverse_scored
      FROM test_questions q
      WHERE q.test_id = p_test_id
    LOOP
      -- Получаем ответ кандидата по НОМЕРУ вопроса
      v_answer_value := (p_answers->>(v_question.question_number::text))::numeric;
      
      -- Пропускаем если ответа нет
      IF v_answer_value IS NULL THEN
        CONTINUE;
      END IF;
      
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
      IF (v_scale_counts->>v_scale.code)::integer > 0 THEN
        v_normalized_scores := jsonb_set(
          v_normalized_scores,
          ARRAY[v_scale.code],
          to_jsonb(ROUND((v_scale_totals->>v_scale.code)::numeric / (v_scale_counts->>v_scale.code)::numeric))
        );
      END IF;
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
        SELECT question_number, scale_code
        FROM test_questions
        WHERE test_id = p_test_id
      LOOP
        v_answer_value := (p_answers->>(v_question.question_number::text))::numeric;
        
        IF v_answer_value IS NULL THEN
          CONTINUE;
        END IF;
        
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
        SELECT question_number, scale_code
        FROM test_questions
        WHERE test_id = p_test_id
      LOOP
        v_answer_value := (p_answers->>(v_question.question_number::text))::numeric;
        
        IF v_answer_value IS NULL THEN
          CONTINUE;
        END IF;
        
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