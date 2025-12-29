-- Миграция: Добавление avatar_url в результаты get_organization_candidates
-- Проблема: RPC функция get_organization_candidates не возвращает поле avatar_url, из-за чего на дашборде HR в списке кандидатов не отображаются фото.

DROP FUNCTION IF EXISTS get_organization_candidates(uuid);

CREATE OR REPLACE FUNCTION get_organization_candidates(p_organization_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  full_name text,
  phone text,
  category_id uuid,
  category_name_ru text,
  category_name_en text,
  category_name_kk text,
  experience text,
  education text,
  about text,
  avatar_url text, -- Добавлено поле
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
    c.id,
    c.user_id,
    c.created_at,
    c.updated_at,
    c.full_name,
    c.phone,
    c.category_id,
    pc.name_ru as category_name_ru,
    pc.name_en as category_name_en,
    pc.name_kk as category_name_kk,
    c.experience,
    c.education,
    c.about,
    c.avatar_url, -- Добавлено поле
    c.tests_completed,
    c.tests_last_updated_at,
    c.is_public,
    c.invited_by_hr_id,
    c.invited_by_organization_id,
    c.email,
    COALESCE(
      ARRAY_AGG(DISTINCT a.vacancy_id) FILTER (WHERE a.vacancy_id IS NOT NULL),
      ARRAY[]::uuid[]
    ) as vacancy_ids
  FROM candidates c
  LEFT JOIN professional_categories pc ON pc.id = c.category_id
  LEFT JOIN applications a ON a.candidate_id = c.id AND a.organization_id = p_organization_id
  WHERE c.invited_by_organization_id = p_organization_id
  OR EXISTS (
    SELECT 1 FROM applications app
    WHERE app.candidate_id = c.id
    AND app.organization_id = p_organization_id
  )
  GROUP BY c.id, pc.name_ru, pc.name_en, pc.name_kk
  ORDER BY c.created_at DESC;
$$;
