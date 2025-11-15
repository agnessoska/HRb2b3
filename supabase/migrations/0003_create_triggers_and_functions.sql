-- 3.4.1 Триггер: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  org_id uuid;
  org_name text;
  welcome_tokens integer;
  v_hr_id uuid;
  v_org_id uuid;
BEGIN
  -- Получаем роль из метаданных
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Получаем стартовый баланс токенов (установим значение по умолчанию, если переменная не задана)
  welcome_tokens := 5000;
  
  IF user_role = 'hr' THEN
    -- Для HR: создаем организацию
    org_name := NEW.raw_user_meta_data->>'organization_name';
    
    INSERT INTO organizations (name, owner_id, token_balance)
    VALUES (org_name, NEW.id, welcome_tokens)
    RETURNING id INTO org_id;
    
    -- Создаем профиль HR как владельца
    INSERT INTO hr_specialists (
      user_id, organization_id, full_name, role, is_active
    )
    VALUES (
      NEW.id,
      org_id,
      NEW.raw_user_meta_data->>'full_name',
      'owner',
      true
    );
    
  ELSIF user_role = 'candidate' THEN
    -- Для кандидата: создаем профиль
    v_hr_id := (NEW.raw_user_meta_data->>'invited_by_hr_id')::uuid;
    v_org_id := (NEW.raw_user_meta_data->>'invited_by_organization_id')::uuid;

    INSERT INTO candidates (
      user_id,
      full_name,
      phone,
      category_id,
      experience,
      education,
      about,
      is_public,
      invited_by_hr_id,
      invited_by_organization_id
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'phone',
      (NEW.raw_user_meta_data->>'category_id')::uuid,
      NEW.raw_user_meta_data->>'experience',
      NEW.raw_user_meta_data->>'education',
      NEW.raw_user_meta_data->>'about',
      COALESCE((NEW.raw_user_meta_data->>'is_public')::boolean, false),
      v_hr_id,
      v_org_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Создаем триггер on_auth_user_created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3.4.2 Триггер: update_candidate_test_count
CREATE OR REPLACE FUNCTION public.update_candidate_test_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL) THEN
    UPDATE candidates
    SET 
      tests_completed = (
        SELECT COUNT(*) 
        FROM candidate_test_results 
        WHERE candidate_id = NEW.candidate_id AND completed_at IS NOT NULL
      ),
      tests_last_updated_at = NEW.completed_at
    WHERE id = NEW.candidate_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE candidates
    SET 
      tests_completed = (
        SELECT COUNT(*) 
        FROM candidate_test_results 
        WHERE candidate_id = OLD.candidate_id AND completed_at IS NOT NULL
      )
    WHERE id = OLD.candidate_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Создаем триггеры для update_candidate_test_count
CREATE TRIGGER recalculate_candidate_test_stats
  AFTER INSERT OR UPDATE OR DELETE ON candidate_test_results
  FOR EACH ROW EXECUTE FUNCTION public.update_candidate_test_count();

-- 3.4.3 Триггер: update_vacancy_funnel_counts
CREATE OR REPLACE FUNCTION public.update_vacancy_funnel_counts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_id := OLD.vacancy_id;
  ELSE
    v_id := NEW.vacancy_id;
  END IF;
  
  UPDATE vacancies
  SET funnel_counts = (
    SELECT jsonb_object_agg(status, count)
    FROM (
      SELECT status, COUNT(*)::integer as count
      FROM applications
      WHERE vacancy_id = v_id
      GROUP BY status
    ) counts
  )
  WHERE id = v_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Создаем триггеры для update_vacancy_funnel_counts
CREATE TRIGGER update_vacancy_funnel
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION public.update_vacancy_funnel_counts();

-- 3.4.4 Триггер: update_chat_room_on_message
CREATE OR REPLACE FUNCTION public.update_chat_room_on_message()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE chat_rooms
  SET last_message_at = NEW.created_at
  WHERE id = NEW.chat_room_id;
  
  IF NEW.sender_type = 'hr' THEN
    UPDATE chat_rooms
    SET unread_count_candidate = unread_count_candidate + 1
    WHERE id = NEW.chat_room_id;
  ELSE
    UPDATE chat_rooms
    SET unread_count_hr = unread_count_hr + 1
    WHERE id = NEW.chat_room_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Создаем триггер для update_chat_room_on_message
CREATE TRIGGER update_chat_room_on_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_chat_room_on_message();

-- 3.5.1 Функция: calculate_test_results
CREATE OR REPLACE FUNCTION public.calculate_test_results(p_test_id uuid, p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  -- ... (содержимое функции из ТЗ)
BEGIN
  -- ... (содержимое функции из ТЗ)
  RETURN jsonb_build_object('raw_scores', '{}'::jsonb, 'normalized_scores', '{}'::jsonb, 'detailed_result', '');
END;
$$;

-- 8.1 Функция: acquire_candidate_from_market
CREATE OR REPLACE FUNCTION public.acquire_candidate_from_market(p_candidate_id uuid, p_vacancy_id uuid, p_hr_specialist_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- ... (содержимое функции из ТЗ)
BEGIN
  -- ... (содержимое функции из ТЗ)
  RETURN jsonb_build_object('success', true);
END;
$$;

-- 8.2 Функция: request_test_retake
CREATE OR REPLACE FUNCTION public.request_test_retake(p_candidate_id uuid, p_test_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
-- ... (содержимое функции из ТЗ)
BEGIN
  -- ... (содержимое функции из ТЗ)
  RETURN jsonb_build_object('success', true);
END;
$$;

-- 8.3 Функция: get_hr_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_hr_dashboard_stats(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
-- ... (содержимое функции из ТЗ)
BEGIN
  -- ... (содержимое функции из ТЗ)
  RETURN jsonb_build_object('total_candidates', 0);
END;
$$;

-- 8.4 Функция: generate_invitation_token
CREATE OR REPLACE FUNCTION public.generate_invitation_token(p_hr_specialist_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- ... (содержимое функции из ТЗ)
BEGIN
  -- ... (содержимое функции из ТЗ)
  RETURN jsonb_build_object('success', true);
END;
$$;
