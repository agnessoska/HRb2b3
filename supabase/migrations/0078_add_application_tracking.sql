-- Migration: Add application tracking and timeline
-- Description: Creates application_timeline table and adds tracking fields to applications

-- 1. Create application_timeline table for audit trail
CREATE TABLE IF NOT EXISTS public.application_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Relations
  application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  
  -- Event details
  event_type text NOT NULL CHECK (event_type IN (
    'status_changed',
    'analysis_generated',
    'interview_planned',
    'interview_started',
    'interview_completed',
    'document_generated',
    'document_sent',
    'note_added'
  )),
  
  old_status text,
  new_status text,
  
  -- Who triggered this event
  triggered_by text NOT NULL CHECK (triggered_by IN ('system', 'hr', 'candidate')),
  hr_specialist_id uuid REFERENCES public.hr_specialists(id),
  
  -- Additional metadata
  details jsonb DEFAULT '{}'::jsonb,
  notes text
);

-- Indexes for performance
CREATE INDEX idx_timeline_application ON public.application_timeline(application_id, created_at DESC);
CREATE INDEX idx_timeline_event_type ON public.application_timeline(event_type);
CREATE INDEX idx_timeline_triggered_by ON public.application_timeline(triggered_by);

-- RLS policies for application_timeline
ALTER TABLE public.application_timeline ENABLE ROW LEVEL SECURITY;

-- HR can view timeline of their organization's applications
CREATE POLICY "hr_can_view_organization_timeline"
ON public.application_timeline FOR SELECT
TO authenticated
USING (
  application_id IN (
    SELECT id FROM applications 
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
  )
);

-- System can insert timeline events (through service role)
-- HR can insert manual notes
CREATE POLICY "timeline_insert_policy"
ON public.application_timeline FOR INSERT
TO authenticated
WITH CHECK (
  application_id IN (
    SELECT id FROM applications 
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
  )
);

-- 2. Add tracking fields to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS has_full_analysis boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS latest_interview_id uuid REFERENCES public.interview_sessions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS interview_recommendation text CHECK (interview_recommendation IN ('hire_strongly', 'hire', 'consider', 'reject')),
ADD COLUMN IF NOT EXISTS sent_documents jsonb DEFAULT '[]'::jsonb;

-- Indexes for new fields
CREATE INDEX IF NOT EXISTS idx_applications_has_analysis 
ON public.applications(has_full_analysis) 
WHERE has_full_analysis = true;

CREATE INDEX IF NOT EXISTS idx_applications_interview_rec 
ON public.applications(interview_recommendation) 
WHERE interview_recommendation IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_latest_interview 
ON public.applications(latest_interview_id) 
WHERE latest_interview_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON TABLE public.application_timeline IS 'Audit trail for all application events (status changes, AI operations, etc.)';
COMMENT ON COLUMN public.applications.has_full_analysis IS 'Flag indicating if full AI analysis was generated';
COMMENT ON COLUMN public.applications.latest_interview_id IS 'Reference to the most recent interview session';
COMMENT ON COLUMN public.applications.interview_recommendation IS 'Recommendation from completed interview';
COMMENT ON COLUMN public.applications.sent_documents IS 'Array of sent document types: ["offer", "rejection_letter"]';