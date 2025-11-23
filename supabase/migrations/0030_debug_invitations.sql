-- Создаем таблицу логов
CREATE TABLE IF NOT EXISTS public.debug_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    message text,
    data jsonb,
    created_at timestamptz DEFAULT now()
);

-- Разрешаем чтение логов всем (временно, для отладки)
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_can_view_debug_logs" ON public.debug_logs FOR SELECT USING (true);

-- Обновляем функцию handle_new_user с логированием
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
  
  -- Для приглашений
  invite_token text;
  v_invite_record record;
BEGIN
  -- Логируем начало
  INSERT INTO public.debug_logs (message, data) 
  VALUES ('handle_new_user started', to_jsonb(NEW));

  -- Получаем роль из метаданных
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Получаем стартовый баланс токенов (установим значение по умолчанию, если переменная не задана)
  welcome_tokens := 5000;
  
  IF user_role = 'hr' THEN
    -- Проверяем наличие токена приглашения
    invite_token := NEW.raw_user_meta_data->>'invitation_token';
    
    INSERT INTO public.debug_logs (message, data) 
    VALUES ('Checking invitation token', jsonb_build_object('token', invite_token));
    
    IF invite_token IS NOT NULL THEN
        -- Пытаемся найти валидное приглашение
        SELECT * INTO v_invite_record
        FROM public.hr_invitation_tokens
        WHERE token = invite_token AND is_used = false AND expires_at > now();
        
        IF FOUND THEN
            INSERT INTO public.debug_logs (message, data) 
            VALUES ('Invitation found', to_jsonb(v_invite_record));
            
            -- ПРИГЛАШЕНИЕ НАЙДЕНО: Добавляем в существующую организацию
            
            -- Создаем профиль HR в существующей организации
            INSERT INTO hr_specialists (
              id, user_id, organization_id, full_name, role, is_active
            )
            VALUES (
              NEW.id, -- Используем ID из auth.users
              NEW.id,
              v_invite_record.organization_id,
              NEW.raw_user_meta_data->>'full_name',
              'member', -- Роль обычного участника, не владельца
              true
            );
            
            -- Помечаем токен как использованный
            UPDATE public.hr_invitation_tokens
            SET is_used = true,
                used_at = now(),
                used_by = NEW.id -- Теперь ссылаемся на ID профиля HR (который равен auth.uid)
            WHERE id = v_invite_record.id;
            
            INSERT INTO public.debug_logs (message) VALUES ('User added to existing org');
            
            RETURN NEW; -- Завершаем выполнение, организация не создается
        ELSE
            INSERT INTO public.debug_logs (message) VALUES ('Invitation NOT found or invalid');
        END IF;
    ELSE
        INSERT INTO public.debug_logs (message) VALUES ('No invitation token provided');
    END IF;
  
    -- СТАНДАРТНАЯ РЕГИСТРАЦИЯ (если токена нет или он невалиден)
    -- Создаем новую организацию
    org_name := NEW.raw_user_meta_data->>'organization_name';
    
    -- Если имя организации не указано (а должно быть при обычной регистрации), используем заглушку
    IF org_name IS NULL THEN
        org_name := 'My Organization';
    END IF;
    
    INSERT INTO organizations (name, owner_id, token_balance)
    VALUES (org_name, NEW.id, welcome_tokens)
    RETURNING id INTO org_id;
    
    -- Создаем профиль HR как владельца
    INSERT INTO hr_specialists (
      id, user_id, organization_id, full_name, role, is_active
    )
    VALUES (
      NEW.id, -- Важно: явно задаем ID равным auth.uid
      NEW.id,
      org_id,
      NEW.raw_user_meta_data->>'full_name',
      'owner',
      true
    );
    
    INSERT INTO public.debug_logs (message, data) 
    VALUES ('Created new organization', jsonb_build_object('org_id', org_id));
    
  ELSIF user_role = 'candidate' THEN
    -- Для кандидата: создаем профиль (код без изменений)
    v_hr_id := (NEW.raw_user_meta_data->>'invited_by_hr_id')::uuid;
    v_org_id := (NEW.raw_user_meta_data->>'invited_by_organization_id')::uuid;

    INSERT INTO candidates (
      id, -- Важно: явно задаем ID равным auth.uid
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