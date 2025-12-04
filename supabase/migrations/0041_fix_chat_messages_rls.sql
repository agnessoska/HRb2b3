-- Удаляем старые политики для сообщений
DROP POLICY IF EXISTS "chat_participants_can_view_messages" ON chat_messages;
DROP POLICY IF EXISTS "chat_participants_can_send_messages" ON chat_messages;
DROP POLICY IF EXISTS "chat_participants_can_update_read_status" ON chat_messages;
DROP POLICY IF EXISTS "chat_participants_can_mark_as_read" ON chat_messages;

-- Новые политики с правильной проверкой через user_id

-- Просмотр сообщений
CREATE POLICY "chat_participants_can_view_messages" 
ON chat_messages FOR SELECT 
TO authenticated 
USING (
  chat_room_id IN (
    SELECT id FROM chat_rooms 
    WHERE 
      hr_specialist_id IN (SELECT id FROM hr_specialists WHERE user_id = auth.uid())
      OR 
      candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid())
  )
);

-- Отправка сообщений
CREATE POLICY "chat_participants_can_send_messages" 
ON chat_messages FOR INSERT 
TO authenticated 
WITH CHECK (
  chat_room_id IN (
    SELECT id FROM chat_rooms 
    WHERE 
      hr_specialist_id IN (SELECT id FROM hr_specialists WHERE user_id = auth.uid())
      OR 
      candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid())
  )
  AND sender_id = auth.uid()
);

-- Обновление статуса прочтения
CREATE POLICY "chat_participants_can_update_read_status" 
ON chat_messages FOR UPDATE 
TO authenticated 
USING (
  chat_room_id IN (
    SELECT id FROM chat_rooms 
    WHERE 
      hr_specialist_id IN (SELECT id FROM hr_specialists WHERE user_id = auth.uid())
      OR 
      candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid())
  )
);