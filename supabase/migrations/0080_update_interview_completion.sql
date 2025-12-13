-- Migration: Update interview completion to auto-link with application
-- Description: Modifies complete_interview_session to automatically call link_interview_to_application

-- Update the complete_interview_session function
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
  v_current_status text;
  v_link_result jsonb;
BEGIN
  -- Validate inputs
  IF p_overall_impression IS NULL OR length(trim(p_overall_impression)) < 10 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Overall impression is required and must be at least 10 characters'
    );
  END IF;
  
  IF p_recommendation NOT IN ('hire_strongly', 'hire', 'consider', 'reject') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid recommendation value'
    );
  END IF;
  
  -- Check current status
  SELECT status INTO v_current_status
  FROM interview_sessions
  WHERE id = p_session_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Interview session not found'
    );
  END IF;
  
  IF v_current_status = 'completed' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Interview already completed'
    );
  END IF;
  
  -- Update session with completion data
  UPDATE interview_sessions
  SET 
    status = 'completed',
    session_data = jsonb_set(
      COALESCE(session_data, '{}'::jsonb),
      '{completion}',
      jsonb_build_object(
        'overall_impression', p_overall_impression,
        'recommendation', p_recommendation,
        'completed_at', NOW()
      )
    ),
    updated_at = NOW()
  WHERE id = p_session_id;
  
  -- CRITICAL: Automatically link interview to application and handle status transitions
  v_link_result := public.link_interview_to_application(p_session_id);
  
  -- Check if linking was successful
  IF NOT (v_link_result->>'success')::boolean THEN
    -- Log warning but don't fail the completion
    RAISE WARNING 'Interview completed but linking failed: %', v_link_result->>'error';
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'session_id', p_session_id,
    'recommendation', p_recommendation,
    'link_result', v_link_result
  );
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.complete_interview_session IS 'Completes interview session and automatically links it to application, triggering status transitions';