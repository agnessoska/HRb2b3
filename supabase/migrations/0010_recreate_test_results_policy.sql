-- Drop the policy completely to ensure a clean state
DROP POLICY IF EXISTS "candidates_can_create_own_results" ON public.candidate_test_results;

-- Recreate the policy with the correct CHECK condition
CREATE POLICY "candidates_can_create_own_results"
ON public.candidate_test_results
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT user_id FROM public.candidates WHERE id = candidate_id) = auth.uid()
);

-- Also, let's fix the SELECT policy to use the same correct logic
DROP POLICY IF EXISTS "candidates_can_view_own_results" ON public.candidate_test_results;

CREATE POLICY "candidates_can_view_own_results"
ON public.candidate_test_results
FOR SELECT
TO authenticated
USING (
  (SELECT user_id FROM public.candidates WHERE id = candidate_id) = auth.uid()
);
