-- Устанавливаем REPLICA IDENTITY FULL для таблицы organizations
-- Это гарантирует, что Supabase Realtime будет получать полные данные при каждом обновлении,
-- что критично для корректной фильтрации обновлений на клиенте.

ALTER TABLE organizations REPLICA IDENTITY FULL;