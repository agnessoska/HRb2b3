-- Функция для получения общего количества непрочитанных сообщений пользователя
CREATE OR REPLACE FUNCTION public.get_total_unread_messages(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_total integer := 0;
BEGIN
  -- Получаем роль пользователя из его метаданных или через поиск в профилях
  -- Сначала ищем в hr_specialists
  IF EXISTS (SELECT 1 FROM hr_specialists WHERE id = p_user_id) THEN
    SELECT COALESCE(SUM(unread_count_hr), 0) INTO v_total
    FROM chat_rooms
    WHERE hr_specialist_id = p_user_id;
  -- Если не нашли, ищем в candidates
  ELSIF EXISTS (SELECT 1 FROM candidates WHERE id = p_user_id) THEN
    SELECT COALESCE(SUM(unread_count_candidate), 0) INTO v_total
    FROM chat_rooms
    WHERE candidate_id = p_user_id;
  END IF;

  RETURN v_total;
END;
$$;
