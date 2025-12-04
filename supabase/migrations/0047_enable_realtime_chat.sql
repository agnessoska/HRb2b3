-- Включаем Realtime для таблиц чата
-- Это необходимо для того, чтобы клиенты могли подписываться на изменения (INSERT/UPDATE)

BEGIN;
  -- Проверяем, существует ли публикация, и создаем её, если нет (обычно она есть по умолчанию)
  -- Но alter publication работает только если она есть.
  -- Supabase создает supabase_realtime по умолчанию.

  -- Добавляем таблицы в публикацию
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
COMMIT;