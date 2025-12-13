-- Удаляем старую функцию
DROP FUNCTION IF EXISTS get_organization_candidates(uuid);

-- Создаем новую RPC функцию для возврата vacancy_ids для каждого кандидата
CREATE OR REPLACE FUNCTION get_organization_candidates(p_organization_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  full_name text,
  phone text,
  category_id uuid,
  experience text,
  education text,
  about text,
  tests_completed integer,
  tests_last_updated_at timestamptz,
  is_public boolean,
  invited_by_hr_id uuid,
  invited_by_organization_id uuid,
  email text,
  vacancy_ids uuid[]
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.*,
    COALESCE(
      ARRAY_AGG(DISTINCT a.vacancy_id) FILTER (WHERE a.vacancy_id IS NOT NULL),
      ARRAY[]::uuid[]
    ) as vacancy_ids
  FROM candidates c
  LEFT JOIN applications a ON a.candidate_id = c.id AND a.organization_id = p_organization_id
  WHERE c.invited_by_organization_id = p_organization_id
  OR EXISTS (
    SELECT 1 FROM applications app
    WHERE app.candidate_id = c.id
    AND app.organization_id = p_organization_id
  )
  GROUP BY c.id
  ORDER BY c.created_at DESC;
$$;