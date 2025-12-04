-- Функция для безопасного получения ID кандидата без вызова рекурсии RLS
CREATE OR REPLACE FUNCTION get_my_candidate_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.candidates WHERE user_id = auth.uid()
$$;

-- Обновляем политику для hr_specialists, чтобы использовать функцию
DROP POLICY IF EXISTS "candidates_can_view_chat_hr" ON hr_specialists;

CREATE POLICY "candidates_can_view_chat_hr" 
ON hr_specialists FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT hr_specialist_id 
    FROM chat_rooms 
    WHERE candidate_id = get_my_candidate_id()
  )
);