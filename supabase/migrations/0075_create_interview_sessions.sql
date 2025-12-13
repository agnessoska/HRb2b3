-- Create table for interactive interview sessions
-- This replaces the static document approach with a workspace model

CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Relations
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  hr_specialist_id uuid REFERENCES public.hr_specialists(id) ON DELETE CASCADE NOT NULL,
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  vacancy_id uuid REFERENCES public.vacancies(id) ON DELETE CASCADE NOT NULL,
  
  -- Interview Data
  interview_plan jsonb NOT NULL,  -- AI-generated structure with sections and questions
  session_data jsonb DEFAULT '{}'::jsonb,  -- Notes, ratings, completion status
  
  -- Status
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  started_at timestamptz,
  completed_at timestamptz,
  
  -- Metadata
  language text NOT NULL DEFAULT 'ru' CHECK (language IN ('ru', 'en', 'kk')),
  version text DEFAULT 'v3' NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_interview_sessions_candidate ON public.interview_sessions(candidate_id);
CREATE INDEX idx_interview_sessions_hr ON public.interview_sessions(hr_specialist_id);
CREATE INDEX idx_interview_sessions_org ON public.interview_sessions(organization_id);
CREATE INDEX idx_interview_sessions_vacancy ON public.interview_sessions(vacancy_id);
CREATE INDEX idx_interview_sessions_status ON public.interview_sessions(status);
CREATE INDEX idx_interview_sessions_created_at ON public.interview_sessions(created_at DESC);

-- RLS Policies
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- HR can view interviews they created
CREATE POLICY "hr_can_view_own_interviews"
ON public.interview_sessions FOR SELECT
TO authenticated
USING (
  hr_specialist_id IN (
    SELECT id FROM public.hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR can insert interviews
CREATE POLICY "hr_can_create_interviews"
ON public.interview_sessions FOR INSERT
TO authenticated
WITH CHECK (
  hr_specialist_id IN (
    SELECT id FROM public.hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR can update their own interviews
CREATE POLICY "hr_can_update_own_interviews"
ON public.interview_sessions FOR UPDATE
TO authenticated
USING (
  hr_specialist_id IN (
    SELECT id FROM public.hr_specialists WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  hr_specialist_id IN (
    SELECT id FROM public.hr_specialists WHERE user_id = auth.uid()
  )
);

-- HR can delete their own interviews
CREATE POLICY "hr_can_delete_own_interviews"
ON public.interview_sessions FOR DELETE
TO authenticated
USING (
  hr_specialist_id IN (
    SELECT id FROM public.hr_specialists WHERE user_id = auth.uid()
  )
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_interview_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_interview_session_timestamp
  BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_interview_session_updated_at();

-- RPC function to complete interview session
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
  -- Get current session data
  SELECT session_data INTO v_session_data
  FROM interview_sessions
  WHERE id = p_session_id
    AND hr_specialist_id IN (
      SELECT id FROM hr_specialists WHERE user_id = auth.uid()
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
  
  RETURN jsonb_build_object(
    'success', true,
    'session_id', p_session_id
  );
END;
$$;

-- RPC function to update session notes/ratings during interview
CREATE OR REPLACE FUNCTION public.update_interview_session_data(
  p_session_id uuid,
  p_session_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update session data
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
    AND hr_specialist_id IN (
      SELECT id FROM hr_specialists WHERE user_id = auth.uid()
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

-- Comment on table
COMMENT ON TABLE public.interview_sessions IS 'Interactive interview sessions with notes, ratings and progress tracking';