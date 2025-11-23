-- Update validate_hr_invitation_token to return brand_logo_url
CREATE OR REPLACE FUNCTION public.validate_hr_invitation_token(
    p_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite record;
    v_org record;
BEGIN
    -- Find token
    SELECT * INTO v_invite
    FROM public.hr_invitation_tokens
    WHERE token = p_token;

    -- Checks
    IF v_invite IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token not found');
    END IF;

    IF v_invite.is_used THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token already used');
    END IF;

    IF v_invite.expires_at < now() THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token expired');
    END IF;

    -- Get organization details
    SELECT name, brand_logo_url INTO v_org
    FROM public.organizations
    WHERE id = v_invite.organization_id;

    RETURN jsonb_build_object(
        'valid', true,
        'email', v_invite.email,
        'organization_name', v_org.name,
        'brand_logo_url', v_org.brand_logo_url,
        'type', 'hr'
    );
END;
$$;

-- Create validate_candidate_invitation_token
CREATE OR REPLACE FUNCTION public.validate_candidate_invitation_token(
    p_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite record;
    v_org record;
    v_hr_profile record;
BEGIN
    -- Find token
    SELECT * INTO v_invite
    FROM public.invitation_tokens
    WHERE token = p_token;

    -- Checks
    IF v_invite IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token not found');
    END IF;

    IF v_invite.is_used THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token already used');
    END IF;

    -- Optional expiration check (if expires_at is set)
    IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now() THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token expired');
    END IF;

    -- Get organization details
    SELECT name, brand_logo_url INTO v_org
    FROM public.organizations
    WHERE id = v_invite.organization_id;

    RETURN jsonb_build_object(
        'valid', true,
        'organization_name', v_org.name,
        'brand_logo_url', v_org.brand_logo_url,
        'invited_by_hr_id', v_invite.created_by_hr_id,
        'invited_by_organization_id', v_invite.organization_id,
        'type', 'candidate'
    );
END;
$$;