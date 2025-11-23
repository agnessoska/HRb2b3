-- Удаляем старую функцию с аргументом, если она была создана с ним (в 0003 она была с аргументом p_hr_specialist_id)
DROP FUNCTION IF EXISTS public.generate_invitation_token(uuid);

-- Создаем правильную функцию без аргументов (использует auth.uid)
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_hr_id uuid;
    v_org_id uuid;
    v_token text;
    v_token_id uuid;
    v_token_cost integer := 500;
    v_current_balance integer;
BEGIN
    -- Получаем ID текущего HR и его организацию
    -- Так как hr_specialists.id = auth.users.id
    SELECT id, organization_id INTO v_hr_id, v_org_id
    FROM public.hr_specialists
    WHERE user_id = auth.uid();

    IF v_hr_id IS NULL OR v_org_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'HR profile not found');
    END IF;

    -- Проверяем баланс
    SELECT token_balance INTO v_current_balance
    FROM public.organizations
    WHERE id = v_org_id;

    IF v_current_balance < v_token_cost THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Insufficient tokens',
            'required', v_token_cost,
            'available', v_current_balance
        );
    END IF;

    -- Генерируем токен
    v_token := encode(extensions.gen_random_bytes(16), 'hex');

    -- Списываем токены (атомарно)
    UPDATE public.organizations
    SET token_balance = token_balance - v_token_cost
    WHERE id = v_org_id;

    -- Создаем запись токена
    INSERT INTO public.invitation_tokens (
        token,
        created_by_hr_id,
        organization_id,
        is_used
    ) VALUES (
        v_token,
        v_hr_id,
        v_org_id,
        false
    )
    RETURNING id INTO v_token_id;

    -- Возвращаем результат
    RETURN jsonb_build_object(
        'success', true,
        'token', v_token,
        'token_id', v_token_id,
        'invite_url', current_setting('request.headers')::json->>'origin' || '/auth/login?token=' || v_token,
        'tokens_spent', v_token_cost,
        'new_balance', v_current_balance - v_token_cost
    );
END;
$$;