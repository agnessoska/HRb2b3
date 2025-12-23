-- Добавляем поле avatar_url в таблицу hr_specialists
ALTER TABLE hr_specialists
ADD COLUMN avatar_url text;

-- Добавляем поле avatar_url в таблицу candidates
ALTER TABLE candidates
ADD COLUMN avatar_url text;

-- Создаем bucket для аватаров, если он еще не существует
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Политики доступа для storage.objects (bucket 'avatars')

-- 1. Публичный доступ на чтение для всех аутентифицированных пользователей
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'avatars' );

-- 2. HR могут загружать свои аватарки
CREATE POLICY "HR can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (auth.uid()::text = (storage.foldername(name))[1])
);

-- 3. HR могут обновлять свои аватарки
CREATE POLICY "HR can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (auth.uid()::text = (storage.foldername(name))[1])
);

-- 4. HR могут удалять свои аватарки
CREATE POLICY "HR can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (auth.uid()::text = (storage.foldername(name))[1])
);

-- 5. Кандидаты могут загружать свои аватарки (политика идентична, так как используем auth.uid())
-- Мы используем структуру папок: /avatars/{user_id}/{filename}
-- Поэтому политики выше уже покрывают и кандидатов, и HR, так как обе роли имеют auth.uid()