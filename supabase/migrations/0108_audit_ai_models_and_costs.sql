-- Audit and update AI model limits and operation costs
-- 1. Ensure all operation types exist in token_costs
INSERT INTO public.token_costs (operation_type, cost_tokens, description_ru, description_en, description_kk)
VALUES 
  ('create_invitation_token', 500, 'Создание пригласительной ссылки для кандидата', 'Creating an invitation link for a candidate', 'Үміткерге шақыру сілтемесін жасау'),
  ('acquire_candidate_from_market', 1000, 'Покупка контакта кандидата из рынка талантов', 'Purchasing candidate contact from the talent market', 'Таланттар нарығынан үміткер контактісін сатып алу'),
  ('hr_invitation', 500, 'Приглашение коллеги в организацию', 'Inviting a colleague to the organization', 'Әріптесті ұйымға шақыру')
ON CONFLICT (operation_type) DO UPDATE SET
  cost_tokens = EXCLUDED.cost_tokens,
  description_ru = EXCLUDED.description_ru,
  description_en = EXCLUDED.description_en,
  description_kk = EXCLUDED.description_kk;

-- 2. Update AI model limits for better consistency and sufficient headroom
UPDATE public.ai_models SET max_output_tokens = 4000 WHERE operation_type = 'resume_analysis';
UPDATE public.ai_models SET max_output_tokens = 12000 WHERE operation_type = 'candidate_comparison'; -- Increased for up to 10 candidates
UPDATE public.ai_models SET max_output_tokens = 2000 WHERE operation_type = 'ideal_profile_generation';
UPDATE public.ai_models SET max_output_tokens = 1000 WHERE operation_type = 'interview_invitation';
UPDATE public.ai_models SET max_output_tokens = 1000 WHERE operation_type = 'rejection_letter';
UPDATE public.ai_models SET max_output_tokens = 10000 WHERE operation_type = 'structured_interview';
-- 3. Update generate_hr_invitation_token to actually deduct tokens
DROP FUNCTION IF EXISTS public.generate_hr_invitation_token(text);
CREATE OR REPLACE FUNCTION public.generate_hr_invitation_token(
    p_email text
)
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
    v_token_cost integer := 500;
    v_current_balance integer;
BEGIN
    -- Get current HR info
    SELECT id, organization_id INTO v_hr_id, v_org_id
    FROM public.hr_specialists
    WHERE user_id = auth.uid();

    IF v_hr_id IS NULL OR v_org_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'HR profile not found');
    END IF;

    -- Check balance
    SELECT token_balance INTO v_current_balance
    FROM public.organizations
    WHERE id = v_org_id;

    IF v_current_balance < v_token_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient tokens');
    END IF;

    -- Check for active invitation
    IF EXISTS (
        SELECT 1 FROM public.hr_invitation_tokens
        WHERE email = p_email 
          AND organization_id = v_org_id 
          AND is_used = false 
          AND expires_at > now()
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Active invitation already exists for this email');
    END IF;

    -- Generate token
    v_token := encode(extensions.gen_random_bytes(32), 'hex');
    v_expires_at := now() + interval '7 days';

    -- Deduct tokens
    UPDATE public.organizations
    SET token_balance = token_balance - v_token_cost
    WHERE id = v_org_id;

    -- Create record
    INSERT INTO public.hr_invitation_tokens (
        token, organization_id, email, created_by, expires_at
    ) VALUES (
        v_token, v_org_id, p_email, v_hr_id, v_expires_at
    );

    RETURN jsonb_build_object(
        'success', true,
        'token', v_token,
        'expires_at', v_expires_at,
        'tokens_spent', v_token_cost,
        'new_balance', v_current_balance - v_token_cost
    );
END;
$$;