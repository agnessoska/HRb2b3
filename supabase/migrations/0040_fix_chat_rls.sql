-- Удаляем старые политики
DROP POLICY IF EXISTS "hr_can_view_own_chats" ON chat_rooms;
DROP POLICY IF EXISTS "hr_can_create_chats" ON chat_rooms;
DROP POLICY IF EXISTS "candidates_can_view_own_chats" ON chat_rooms;

-- Создаем новые политики с правильной проверкой через user_id

-- HR видит свои чаты (находим ID специалиста по auth.uid())
CREATE POLICY "hr_can_view_own_chats" 
ON chat_rooms FOR SELECT 
TO authenticated 
USING (
  hr_specialist_id IN (
    SELECT id FROM hr_specialists WHERE user_id = auth.uid()
  )
);

-- Кандидат видит свои чаты
CREATE POLICY "candidates_can_view_own_chats" 
ON chat_rooms FOR SELECT 
TO authenticated 
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- HR может создавать чаты для себя
CREATE POLICY "hr_can_create_chats" 
ON chat_rooms FOR INSERT 
TO authenticated 
WITH CHECK (
  hr_specialist_id IN (
    SELECT id FROM hr_specialists WHERE user_id = auth.uid()
  )
);