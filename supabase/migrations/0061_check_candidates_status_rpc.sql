-- RPC функция для проверки статуса кандидатов по email
CREATE OR REPLACE FUNCTION public.check_candidates_status(
  p_emails text[],
  p_hr_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id uuid;
  v_results jsonb := '[]'::jsonb;
  v_email text;
  v_candidate record;
  v_token text;
  v_status text;
BEGIN
  -- Получаем ID организации
  SELECT organization_id INTO v_organization_id
  FROM hr_specialists
  WHERE id = p_hr_id; -- Ищем по PK

  IF v_organization_id IS NULL THEN
     -- Fallback
     SELECT organization_id INTO v_organization_id
     FROM hr_specialists
     WHERE user_id = p_hr_id;
  END IF;

  IF v_organization_id IS NULL THEN
    RETURN '[]'::jsonb; -- Или ошибка, но лучше пустой список для безопасности
  END IF;

  -- Проходим по всем переданным email
  FOREACH v_email IN ARRAY p_emails
  LOOP
    -- Ищем кандидата в этой организации
    SELECT * INTO v_candidate
    FROM candidates
    WHERE email = v_email
      AND invited_by_organization_id = v_organization_id
    LIMIT 1;

    IF v_candidate IS NOT NULL THEN
      IF v_candidate.user_id IS NOT NULL THEN
        v_status := 'registered';
        v_token := NULL;
      ELSE
        v_status := 'invited';
        -- Ищем активный токен
        SELECT token INTO v_token
        FROM invitation_tokens
        WHERE used_by_candidate_id = v_candidate.id
          AND is_used = false
          AND (expires_at IS NULL OR expires_at > now())
        ORDER BY created_at DESC
        LIMIT 1;
      END IF;

      v_results := v_results || jsonb_build_object(
        'email', v_email,
        'status', v_status,
        'candidate_id', v_candidate.id,
        'invite_token', v_token
      );
    ELSE
      v_results := v_results || jsonb_build_object(
        'email', v_email,
        'status', 'none',
        'candidate_id', NULL,
        'invite_token', NULL
      );
    END IF;
  END LOOP;

  RETURN v_results;
END;
$$;