-- First, create a helper function that runs with elevated privileges
-- to safely retrieve the current user's organization ID without causing RLS recursion.
-- SECURITY DEFINER is safe here because the function only ever exposes the organization_id
-- of the currently authenticated user (auth.uid()).
CREATE OR REPLACE FUNCTION public.get_current_hr_organization_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
-- Set a secure search path to prevent hijacking.
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.hr_specialists
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Now, create a new, non-recursive policy for viewing colleagues
-- that uses the helper function.
CREATE POLICY "hr_can_view_colleagues"
ON public.hr_specialists
FOR SELECT
TO authenticated
USING (organization_id = public.get_current_hr_organization_id());
