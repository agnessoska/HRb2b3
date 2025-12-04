-- Разрешаем кандидатам видеть профили HR-специалистов, с которыми у них есть чат
CREATE POLICY "candidates_can_view_chat_hr" 
ON hr_specialists FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT hr_specialist_id 
    FROM chat_rooms 
    WHERE candidate_id IN (
      SELECT id FROM candidates WHERE user_id = auth.uid()
    )
  )
);