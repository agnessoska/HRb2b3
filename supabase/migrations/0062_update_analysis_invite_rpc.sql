-- RPC функция для обновления токена приглашения в результате анализа
CREATE OR REPLACE FUNCTION public.update_analysis_candidate_invite(
  p_analysis_id uuid,
  p_candidate_index integer,
  p_invite_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_analysis_data jsonb;
  v_updated_data jsonb;
  v_owner_id uuid;
BEGIN
  -- Получаем текущий анализ и проверяем права (через owner организации)
  SELECT 
    r.analysis_data,
    o.owner_id 
  INTO 
    v_analysis_data,
    v_owner_id
  FROM resume_analysis_results r
  JOIN organizations o ON r.organization_id = o.id
  WHERE r.id = p_analysis_id;

  IF v_analysis_data IS NULL THEN
    RAISE EXCEPTION 'Analysis result not found';
  END IF;

  -- Обновляем данные: добавляем invite_token кандидату по индексу
  -- Путь: candidates -> [index] -> invite_token
  v_updated_data := jsonb_set(
    v_analysis_data,
    ARRAY['candidates', p_candidate_index::text, 'invite_token'],
    to_jsonb(p_invite_token)
  );

  -- Сохраняем обновленные данные
  UPDATE resume_analysis_results
  SET analysis_data = v_updated_data
  WHERE id = p_analysis_id;

  RETURN v_updated_data;
END;
$$;