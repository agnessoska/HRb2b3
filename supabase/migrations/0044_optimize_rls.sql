-- Оптимизируем политику доступа HR к кандидатам, чтобы избежать рекурсии.
-- Используем проверку роли из JWT, чтобы исключить выполнение подзапросов для кандидатов.

DROP POLICY IF EXISTS "hr_can_view_organization_candidates" ON candidates;

CREATE POLICY "hr_can_view_organization_candidates" 
ON candidates FOR SELECT 
TO authenticated 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'hr'
  AND (
    invited_by_organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    ) 
    OR 
    id IN (
      SELECT candidate_id FROM applications 
      WHERE organization_id IN (
        SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
      )
    )
  )
);