-- Включаем Realtime для таблицы organizations
-- Это необходимо для того, чтобы клиенты могли получать обновления баланса в реальном времени

BEGIN;
  -- Добавляем таблицу в публикацию supabase_realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE organizations;
COMMIT;