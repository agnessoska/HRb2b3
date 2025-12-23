-- Allow candidates to view the organization that invited them
CREATE POLICY "candidates_can_view_inviting_org"
ON organizations FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT invited_by_organization_id FROM candidates 
    WHERE user_id = auth.uid()
  )
  OR
  id IN (
    SELECT organization_id FROM applications 
    WHERE candidate_id IN (
        SELECT id FROM candidates WHERE user_id = auth.uid()
    )
  )
);