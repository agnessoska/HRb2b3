CREATE OR REPLACE FUNCTION public.acquire_candidate_from_market(
  p_candidate_id uuid,
  p_vacancy_id uuid,
  p_hr_specialist_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id uuid;
  v_token_cost integer := 1000; -- Cost of acquisition
  v_current_balance integer;
  v_chat_room_id uuid;
BEGIN
  -- Get the HR's organization
  SELECT organization_id INTO v_organization_id
  FROM hr_specialists
  WHERE id = p_hr_specialist_id;
  
  IF v_organization_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'HR specialist not found');
  END IF;
  
  -- Check token balance
  SELECT token_balance INTO v_current_balance
  FROM organizations
  WHERE id = v_organization_id;
  
  IF v_current_balance < v_token_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient tokens', 'required', v_token_cost, 'available', v_current_balance);
  END IF;
  
  -- Check if the candidate is already acquired
  IF EXISTS (SELECT 1 FROM applications WHERE candidate_id = p_candidate_id AND organization_id = v_organization_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Candidate already acquired');
  END IF;
  
  -- Deduct tokens
  UPDATE organizations
  SET token_balance = token_balance - v_token_cost
  WHERE id = v_organization_id;
  
  -- Create an application
  INSERT INTO applications (id, candidate_id, vacancy_id, organization_id, status, added_by_hr_id)
  VALUES (gen_random_uuid(), p_candidate_id, p_vacancy_id, v_organization_id, 'invited', p_hr_specialist_id);
  
  -- Create a chat room
  INSERT INTO chat_rooms (id, organization_id, hr_specialist_id, candidate_id)
  VALUES (gen_random_uuid(), v_organization_id, p_hr_specialist_id, p_candidate_id)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_chat_room_id;
  
  RETURN jsonb_build_object('success', true, 'tokens_spent', v_token_cost, 'new_balance', v_current_balance - v_token_cost, 'chat_room_id', v_chat_room_id);
END;
$$;