-- RPC функция для проверки статуса токенов приглашений
CREATE OR REPLACE FUNCTION public.check_invite_tokens_status(
  p_tokens text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_results jsonb := '[]'::jsonb;
  v_token_record record;
BEGIN
  -- Проходим по всем переданным токенам
  FOR v_token_record IN 
    SELECT 
      token,
      is_used
    FROM invitation_tokens
    WHERE token = ANY(p_tokens)
  LOOP
    v_results := v_results || jsonb_build_object(
      'token', v_token_record.token,
      'is_used', v_token_record.is_used
    );
  END LOOP;

  RETURN v_results;
END;
$$;