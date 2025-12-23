CREATE OR REPLACE FUNCTION public.complete_user_profile(
  p_role text,
  p_organization_name text DEFAULT NULL,
  p_invitation_token text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_user_meta jsonb;
  v_full_name text;
  v_org_id uuid;
  v_invite_record record;
BEGIN
  -- Get current user context
  v_user_id := auth.uid();
  
  -- Use auth.users to get details
  SELECT email, raw_user_meta_data INTO v_user_email, v_user_meta
  FROM auth.users
  WHERE id = v_user_id;

  v_full_name := COALESCE(v_user_meta->>'full_name', v_user_meta->>'name', v_user_email);

  -- Check for existing profiles
  IF EXISTS (SELECT 1 FROM hr_specialists WHERE user_id = v_user_id) OR
     EXISTS (SELECT 1 FROM candidates WHERE user_id = v_user_id) THEN
      RETURN jsonb_build_object('success', false, 'message', 'Profile already exists');
  END IF;

  -- Handle Invitation Logic
  IF p_invitation_token IS NOT NULL THEN
    -- Check HR Invite (Joining a team)
    SELECT * INTO v_invite_record FROM hr_invitation_tokens 
    WHERE token = p_invitation_token AND is_used = false;
    
    IF FOUND THEN
        -- It's an HR invite
        IF p_role != 'hr' THEN
             RETURN jsonb_build_object('success', false, 'message', 'Invalid role for this invitation');
        END IF;

        INSERT INTO hr_specialists (id, user_id, organization_id, full_name, role, is_active)
        VALUES (v_user_id, v_user_id, v_invite_record.organization_id, v_full_name, 'member', true);

        UPDATE hr_invitation_tokens SET is_used = true, used_at = now(), used_by_hr_id = v_user_id WHERE id = v_invite_record.id;
        
        -- Update metadata
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"hr"')
        WHERE id = v_user_id;

        RETURN jsonb_build_object('success', true);
    END IF;

    -- Check Candidate Invite
    SELECT * INTO v_invite_record FROM invitation_tokens
    WHERE token = p_invitation_token AND is_used = false;

    IF FOUND THEN
        -- It's a Candidate invite
        IF p_role != 'candidate' THEN
             RETURN jsonb_build_object('success', false, 'message', 'Invalid role for this invitation');
        END IF;

        INSERT INTO candidates (id, user_id, email, full_name, is_public, tests_completed, invited_by_hr_id, invited_by_organization_id)
        VALUES (v_user_id, v_user_id, v_user_email, v_full_name, false, 0, v_invite_record.created_by_hr_id, v_invite_record.organization_id);

        UPDATE invitation_tokens SET is_used = true, used_at = now(), used_by_candidate_id = v_user_id WHERE id = v_invite_record.id;

        -- Update metadata
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"candidate"')
        WHERE id = v_user_id;

        RETURN jsonb_build_object('success', true);
    END IF;
    
    -- If token provided but not found/used
    RETURN jsonb_build_object('success', false, 'message', 'Invalid invitation token');
  END IF;

  -- Standard Flow (No Invitation)
  IF p_role = 'hr' THEN
    -- Create Organization
    INSERT INTO organizations (id, name, owner_id, token_balance)
    VALUES (gen_random_uuid(), p_organization_name, v_user_id, 5000)
    RETURNING id INTO v_org_id;

    -- Create HR Profile
    INSERT INTO hr_specialists (id, user_id, organization_id, full_name, role, is_active)
    VALUES (v_user_id, v_user_id, v_org_id, v_full_name, 'owner', true);
    
    -- Update metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"hr"')
    WHERE id = v_user_id;
    
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{organization_name}', to_jsonb(p_organization_name))
    WHERE id = v_user_id;

  ELSIF p_role = 'candidate' THEN
    -- Create Candidate Profile
    INSERT INTO candidates (id, user_id, email, full_name, is_public, tests_completed)
    VALUES (v_user_id, v_user_id, v_user_email, v_full_name, false, 0);

    -- Update metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"candidate"')
    WHERE id = v_user_id;
  
  ELSE
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;