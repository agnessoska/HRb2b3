-- Делаем email опциональным в таблице приглашений
ALTER TABLE public.hr_invitation_tokens ALTER COLUMN email DROP NOT NULL;

-- Обновляем функцию генерации токена (email теперь опционален)
CREATE OR REPLACE FUNCTION public.generate_hr_invitation_token(
    p_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_hr_id uuid;
    v_org_id uuid;
    v_token text;
    v_expires_at timestamptz;
BEGIN
    -- Получаем ID текущего HR
    SELECT id, organization_id INTO v_hr_id, v_org_id
    FROM public.hr_specialists
    WHERE user_id = auth.uid();

    IF v_hr_id IS NULL OR v_org_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'HR profile not found');
    END IF;

    -- Если email передан, проверяем дубликаты (опционально)
    IF p_email IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.hr_invitation_tokens
        WHERE email = p_email 
          AND organization_id = v_org_id 
          AND is_used = false 
          AND expires_at > now()
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Active invitation already exists for this email');
    END IF;

    -- Генерируем токен
    v_token := encode(extensions.gen_random_bytes(32), 'hex');
    v_expires_at := now() + interval '7 days';

    -- Создаем запись
    INSERT INTO public.hr_invitation_tokens (
        token, organization_id, email, created_by, expires_at
    ) VALUES (
        v_token, v_org_id, p_email, v_hr_id, v_expires_at
    );

    RETURN jsonb_build_object(
        'success', true,
        'token', v_token,
        'expires_at', v_expires_at
    );
END;
$$;