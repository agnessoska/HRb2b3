-- This policy causes a recursive error and prevents any SELECT queries
-- on the hr_specialists table, even for the user's own row.
-- We are dropping it to fix the immediate issue. The functionality of
-- viewing colleagues will be restored later with a correct, non-recursive policy.
DROP POLICY IF EXISTS "hr_can_view_colleagues" ON public.hr_specialists;
