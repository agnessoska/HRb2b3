CREATE OR REPLACE FUNCTION get_organization_candidates(p_organization_id uuid)
RETURNS SETOF candidates
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.*
  FROM candidates c
  WHERE c.invited_by_organization_id = p_organization_id
  OR EXISTS (
    SELECT 1 FROM applications a
    WHERE a.candidate_id = c.id
    AND a.organization_id = p_organization_id
  )
  ORDER BY c.created_at DESC;
$$;