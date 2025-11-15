-- Allow HR specialists to view their own profile information.
-- This is necessary because the existing "hr_can_view_colleagues" policy
-- creates a circular dependency when a user tries to fetch their own organization_id.
CREATE POLICY "hr_can_view_own_hr_profile"
ON public.hr_specialists
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
