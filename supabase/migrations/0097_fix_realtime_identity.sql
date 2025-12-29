-- Включаем полное отслеживание изменений для таблиц чата, 
-- чтобы Realtime всегда получал полные данные строк при обновлениях
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
