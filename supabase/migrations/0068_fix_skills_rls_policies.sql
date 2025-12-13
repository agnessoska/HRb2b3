-- Миграция 0068: Исправление RLS политик для навыков
-- Проблема 1: candidate_skills - политика использует candidate_id = auth.uid(), 
-- но они разные (профиль vs пользователь)
-- Проблема 2: vacancy_skills - отсутствует WITH CHECK для INSERT/UPDATE

-- Удаляем старые политики для candidate_skills
DROP POLICY IF EXISTS "candidates_manage_own_skills" ON candidate_skills;

-- Создаем исправленные политики для candidate_skills
-- Политика для чтения своих навыков
CREATE POLICY "candidates_can_view_own_skills"
ON candidate_skills FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Политика для добавления своих навыков
CREATE POLICY "candidates_can_insert_own_skills"
ON candidate_skills FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Политика для обновления своих навыков
CREATE POLICY "candidates_can_update_own_skills"
ON candidate_skills FOR UPDATE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Политика для удаления своих навыков
CREATE POLICY "candidates_can_delete_own_skills"
ON candidate_skills FOR DELETE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Удаляем старую политику для vacancy_skills
DROP POLICY IF EXISTS "hr_can_manage_vacancy_skills" ON vacancy_skills;

-- Создаем исправленные политики для vacancy_skills с WITH CHECK
-- Политика для чтения навыков вакансий своей организации
CREATE POLICY "hr_can_view_vacancy_skills"
ON vacancy_skills FOR SELECT
TO authenticated
USING (
  vacancy_id IN (
    SELECT id FROM vacancies 
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
  )
);

-- Политика для добавления навыков к вакансиям своей организации
CREATE POLICY "hr_can_insert_vacancy_skills"
ON vacancy_skills FOR INSERT
TO authenticated
WITH CHECK (
  vacancy_id IN (
    SELECT id FROM vacancies 
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
  )
);

-- Политика для обновления навыков вакансий своей организации
CREATE POLICY "hr_can_update_vacancy_skills"
ON vacancy_skills FOR UPDATE
TO authenticated
USING (
  vacancy_id IN (
    SELECT id FROM vacancies 
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
  )
)
WITH CHECK (
  vacancy_id IN (
    SELECT id FROM vacancies 
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
  )
);

-- Политика для удаления навыков вакансий своей организации
CREATE POLICY "hr_can_delete_vacancy_skills"
ON vacancy_skills FOR DELETE
TO authenticated
USING (
  vacancy_id IN (
    SELECT id FROM vacancies 
    WHERE organization_id IN (
      SELECT organization_id FROM hr_specialists WHERE user_id = auth.uid()
    )
  )
);