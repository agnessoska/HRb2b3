-- Исправляем политики RLS для чата, чтобы Realtime работал корректно.
-- Добавляем политики UPDATE, без которых события обновления не приходят на фронтенд.

-- Разрешаем HR обновлять (видеть обновления) своих комнат
CREATE POLICY "hr_can_update_own_chats"
ON public.chat_rooms FOR UPDATE
TO authenticated
USING (hr_specialist_id IN (SELECT id FROM hr_specialists WHERE user_id = auth.uid()));

-- Разрешаем кандидатам обновлять (видеть обновления) своих комнат
CREATE POLICY "candidates_can_update_own_chats"
ON public.chat_rooms FOR UPDATE
TO authenticated
USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- Дополнительно: упрощаем SELECT политики для ускорения Realtime (опционально, но полезно)
-- Мы не будем удалять старые, просто добавим UPDATE.
