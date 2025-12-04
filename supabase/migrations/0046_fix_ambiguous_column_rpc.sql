-- Исправляем ошибку "column reference id is ambiguous" в функции get_my_chat_rooms
-- Добавляем явные алиасы таблиц во всех подзапросах и устанавливаем search_path

CREATE OR REPLACE FUNCTION get_my_chat_rooms()
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  last_message_at timestamptz,
  unread_count integer,
  other_user_name text,
  other_user_id uuid,
  other_user_category text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_is_hr boolean;
BEGIN
  -- Проверяем роль
  SELECT EXISTS (SELECT 1 FROM hr_specialists WHERE user_id = v_user_id) INTO v_is_hr;

  IF v_is_hr THEN
    RETURN QUERY
    SELECT 
      cr.id,
      cr.created_at,
      cr.last_message_at,
      cr.unread_count_hr as unread_count,
      c.full_name as other_user_name,
      c.id as other_user_id,
      pc.name_ru as other_user_category
    FROM chat_rooms cr
    JOIN candidates c ON c.id = cr.candidate_id
    LEFT JOIN professional_categories pc ON pc.id = c.category_id
    WHERE cr.hr_specialist_id IN (
      SELECT h.id FROM hr_specialists h WHERE h.user_id = v_user_id
    )
    ORDER BY cr.last_message_at DESC NULLS LAST;
  
  ELSE
    RETURN QUERY
    SELECT 
      cr.id,
      cr.created_at,
      cr.last_message_at,
      cr.unread_count_candidate as unread_count,
      hr.full_name as other_user_name,
      hr.id as other_user_id,
      NULL::text as other_user_category
    FROM chat_rooms cr
    JOIN hr_specialists hr ON hr.id = cr.hr_specialist_id
    WHERE cr.candidate_id IN (
      SELECT cand.id FROM candidates cand WHERE cand.user_id = v_user_id
    )
    ORDER BY cr.last_message_at DESC NULLS LAST;
  END IF;
END;
$$;