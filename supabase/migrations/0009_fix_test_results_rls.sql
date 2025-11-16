-- Drop the existing incorrect policy
DROP POLICY IF EXISTS "candidates_can_create_own_results" ON public.candidate_test_results;

-- Recreate the policy with the correct logic
CREATE POLICY "candidates_can_create_own_results"
ON public.candidate_test_results
FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM public.candidates WHERE user_id = auth.uid()
  )
);
