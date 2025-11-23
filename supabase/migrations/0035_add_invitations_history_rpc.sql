-- Функция для получения истории приглашений организации
CREATE OR REPLACE FUNCTION public.get_organization_invitations(
    p_organization_id uuid
)
RETURNS TABLE (
    type text,
    id uuid,
    token text,
    created_at timestamptz,
    expires_at timestamptz,
    is_used boolean,
    used_at timestamptz,
    created_by_name text,
    created_by_user_id uuid,
    used_by_name text,
    used_by_user_id uuid,
    invite_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    -- Приглашения кандидатов
    SELECT
        'candidate'::text as type,
        t.id,
        t.token,
        t.created_at,
        NULL::timestamptz as expires_at, -- У кандидатов нет expires_at в таблице, или он не используется так же
        t.is_used,
        t.used_at,
        creator.full_name as created_by_name,
        creator.user_id as created_by_user_id,
        candidate.full_name as used_by_name,
        candidate.user_id as used_by_user_id,
        NULL::text as invite_email
    FROM public.invitation_tokens t
    LEFT JOIN public.hr_specialists creator ON t.created_by_hr_id = creator.id
    LEFT JOIN public.candidates candidate ON t.used_by_candidate_id = candidate.id
    WHERE t.organization_id = p_organization_id

    UNION ALL

    -- Приглашения коллег (HR)
    SELECT
        'hr'::text as type,
        t.id,
        t.token,
        t.created_at,
        t.expires_at,
        t.is_used,
        t.used_at,
        creator.full_name as created_by_name,
        creator.user_id as created_by_user_id,
        user_hr.full_name as used_by_name,
        user_hr.user_id as used_by_user_id,
        t.email as invite_email
    FROM public.hr_invitation_tokens t
    LEFT JOIN public.hr_specialists creator ON t.created_by = creator.id
    LEFT JOIN public.hr_specialists user_hr ON t.used_by = user_hr.id
    WHERE t.organization_id = p_organization_id

    ORDER BY created_at DESC;
END;
$$;