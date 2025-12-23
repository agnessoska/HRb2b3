CREATE OR REPLACE FUNCTION public.complete_user_profile(
  p_role text,
  p_organization_name text DEFAULT NULL
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
BEGIN
  -- Get current user context
  v_user_id := auth.uid();
  
  -- Use auth.users to get details
  SELECT email, raw_user_meta_data INTO v_user_email, v_user_meta
  FROM auth.users
  WHERE id = v_user_id;

  v_full_name := COALESCE(v_user_meta->>'full_name', v_user_meta->>'name', v_user_email);

  IF p_role = 'hr' THEN
    -- Check if profile already exists to prevent duplicates
    IF EXISTS (SELECT 1 FROM hr_specialists WHERE user_id = v_user_id) THEN
        RETURN jsonb_build_object('success', true, 'message', 'Profile already exists');
    END IF;

    -- Create Organization
    INSERT INTO organizations (id, name, owner_id, token_balance)
    VALUES (gen_random_uuid(), p_organization_name, v_user_id, 5000) -- Welcome tokens
    RETURNING id INTO v_org_id;

    -- Create HR Profile
    INSERT INTO hr_specialists (id, user_id, organization_id, full_name, role, is_active)
    VALUES (v_user_id, v_user_id, v_org_id, v_full_name, 'owner', true);
    
    -- Update auth.users metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb), 
      '{role}', 
      '"hr"'
    )
    WHERE id = v_user_id;
    
    -- Update organization name in metadata if needed
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      raw_user_meta_data,
      '{organization_name}',
      to_jsonb(p_organization_name)
    )
    WHERE id = v_user_id;

  ELSIF p_role = 'candidate' THEN
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM candidates WHERE user_id = v_user_id) THEN
        RETURN jsonb_build_object('success', true, 'message', 'Profile already exists');
    END IF;

    -- Create Candidate Profile
    INSERT INTO candidates (id, user_id, email, full_name, is_public, tests_completed)
    VALUES (v_user_id, v_user_id, v_user_email, v_full_name, false, 0);

    -- Update auth.users metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb), 
      '{role}', 
      '"candidate"'
    )
    WHERE id = v_user_id;
  
  ELSE
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;