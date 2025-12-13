-- Fix RPC functions for interview_sessions to allow organization members (not just creator)

-- Fix update_interview_session_data to allow organization members
CREATE OR REPLACE FUNCTION public.update_interview_session_data(
  p_session_id uuid,
  p_session_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update session data - check organization instead of specific HR
  UPDATE interview_sessions
  SET 
    session_data = p_session_data,
    status = CASE 
      WHEN status = 'planned' THEN 'in_progress'
      ELSE status
    END,
    started_at = CASE 
      WHEN started_at IS NULL THEN now()
      ELSE started_at
    END
  WHERE id = p_session_id
    AND organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    );
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Session not found or access denied'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'session_id', p_session_id
  );
END;
$$;

-- Fix complete_interview_session to allow organization members
CREATE OR REPLACE FUNCTION public.complete_interview_session(
  p_session_id uuid,
  p_overall_impression text,
  p_recommendation text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_data jsonb;
BEGIN
  -- Validate impression length
  IF length(trim(p_overall_impression)) < 10 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Overall impression is required and must be at least 10 characters'
    );
  END IF;

  -- Get current session data - check organization instead of specific HR
  SELECT session_data INTO v_session_data
  FROM interview_sessions
  WHERE id = p_session_id
    AND organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    );
  
  IF v_session_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Session not found or access denied'
    );
  END IF;
  
  -- Update session with completion data
  v_session_data := jsonb_set(
    v_session_data,
    '{completion}',
    jsonb_build_object(
      'overall_impression', p_overall_impression,
      'recommendation', p_recommendation,
      'completed_by', auth.uid(),
      'completed_at', now()
    )
  );
  
  -- Update session
  UPDATE interview_sessions
  SET 
    session_data = v_session_data,
    status = 'completed',
    completed_at = now()
  WHERE id = p_session_id;
  
  -- Link interview to application (from migration 0080)
  PERFORM link_interview_to_application(p_session_id);
  
  RETURN jsonb_build_object(
    'success', true,
    'session_id', p_session_id
  );
END;
$$;