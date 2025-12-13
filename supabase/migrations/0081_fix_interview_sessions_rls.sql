-- Fix RLS policies for interview_sessions to allow team members to view all organization interviews
-- Issue: Only creator can view/edit interviews, team members get 406 error

-- Drop old restrictive policy
DROP POLICY IF EXISTS "hr_can_view_own_interviews" ON public.interview_sessions;

-- Create new policy: HR can view ALL interviews of their organization
CREATE POLICY "hr_can_view_organization_interviews"
ON public.interview_sessions FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.hr_specialists WHERE user_id = auth.uid()
  )
);

-- Update UPDATE policy to allow organization members (keep restriction for delete)
DROP POLICY IF EXISTS "hr_can_update_own_interviews" ON public.interview_sessions;

CREATE POLICY "hr_can_update_organization_interviews"
ON public.interview_sessions FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.hr_specialists WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.hr_specialists WHERE user_id = auth.uid()
  )
);

-- Keep delete policy restrictive (only creator can delete)
-- This is intentional for audit purposes