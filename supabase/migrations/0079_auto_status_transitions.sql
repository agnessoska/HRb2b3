-- Migration: Auto status transitions for applications
-- Description: Implements automatic status transitions (invited→testing→evaluated) based on test completion

-- 1. Function: Auto update application status based on test progress
CREATE OR REPLACE FUNCTION public.auto_update_application_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_application_id uuid;
  v_tests_count integer;
  v_old_tests_count integer;
BEGIN
  -- Get test counts
  v_tests_count := NEW.tests_completed;
  v_old_tests_count := COALESCE(OLD.tests_completed, 0);
  
  -- Only proceed if tests_completed actually changed
  IF v_tests_count = v_old_tests_count THEN
    RETURN NEW;
  END IF;
  
  -- Update all applications for this candidate
  FOR v_application_id IN 
    SELECT id FROM applications WHERE candidate_id = NEW.id
  LOOP
    -- TRANSITION 1: invited → testing (when first test is started)
    IF v_tests_count > 0 AND v_old_tests_count = 0 THEN
      UPDATE applications
      SET status = 'testing', updated_at = NOW()
      WHERE id = v_application_id AND status = 'invited';
      
      -- Log the transition
      IF FOUND THEN
        INSERT INTO application_timeline (
          application_id, 
          event_type, 
          old_status, 
          new_status, 
          triggered_by,
          details
        )
        VALUES (
          v_application_id, 
          'status_changed', 
          'invited', 
          'testing', 
          'system',
          jsonb_build_object('tests_completed', v_tests_count)
        );
      END IF;
    END IF;
    
    -- TRANSITION 2: testing → evaluated (when all 6 tests completed)
    IF v_tests_count = 6 AND v_old_tests_count < 6 THEN
      UPDATE applications
      SET status = 'evaluated', updated_at = NOW()
      WHERE id = v_application_id AND status = 'testing';
      
      -- Log the transition
      IF FOUND THEN
        INSERT INTO application_timeline (
          application_id, 
          event_type, 
          old_status, 
          new_status, 
          triggered_by,
          details
        )
        VALUES (
          v_application_id, 
          'status_changed', 
          'testing', 
          'evaluated', 
          'system',
          jsonb_build_object('tests_completed', v_tests_count)
        );
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger on candidates table
DROP TRIGGER IF EXISTS auto_update_application_on_tests ON candidates;
CREATE TRIGGER auto_update_application_on_tests
  AFTER INSERT OR UPDATE OF tests_completed ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_application_status();

-- 2. RPC Function: Link completed interview to application
CREATE OR REPLACE FUNCTION public.link_interview_to_application(
  p_session_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_application_id uuid;
  v_recommendation text;
  v_candidate_id uuid;
  v_vacancy_id uuid;
  v_organization_id uuid;
  v_old_status text;
BEGIN
  -- Get data from completed interview
  SELECT 
    candidate_id, 
    vacancy_id,
    organization_id,
    (session_data->'completion'->>'recommendation')::text
  INTO v_candidate_id, v_vacancy_id, v_organization_id, v_recommendation
  FROM interview_sessions
  WHERE id = p_session_id AND status = 'completed';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Interview not found or not completed'
    );
  END IF;
  
  -- Find the application
  SELECT id, status INTO v_application_id, v_old_status
  FROM applications
  WHERE candidate_id = v_candidate_id 
    AND vacancy_id = v_vacancy_id
    AND organization_id = v_organization_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Application not found'
    );
  END IF;
  
  -- Update application with interview data
  UPDATE applications
  SET 
    latest_interview_id = p_session_id,
    interview_recommendation = v_recommendation,
    updated_at = NOW()
  WHERE id = v_application_id;
  
  -- Log interview completion
  INSERT INTO application_timeline (
    application_id, 
    event_type, 
    triggered_by, 
    details
  )
  VALUES (
    v_application_id, 
    'interview_completed', 
    'hr', 
    jsonb_build_object(
      'session_id', p_session_id, 
      'recommendation', v_recommendation
    )
  );
  
  -- AUTOMATIC TRANSITION: If recommendation is reject → move to rejected
  IF v_recommendation = 'reject' THEN
    UPDATE applications
    SET status = 'rejected', updated_at = NOW()
    WHERE id = v_application_id;
    
    -- Log the auto transition
    INSERT INTO application_timeline (
      application_id, 
      event_type, 
      old_status, 
      new_status, 
      triggered_by, 
      details
    )
    VALUES (
      v_application_id, 
      'status_changed', 
      v_old_status, 
      'rejected', 
      'system',
      jsonb_build_object(
        'reason', 'interview_recommendation_reject',
        'session_id', p_session_id
      )
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true, 
    'application_id', v_application_id,
    'recommendation', v_recommendation,
    'auto_rejected', (v_recommendation = 'reject')
  );
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.link_interview_to_application IS 'Links completed interview to application and auto-transitions to rejected if recommendation is reject';