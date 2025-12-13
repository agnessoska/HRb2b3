-- Миграция 0070: Исправление сохранения email кандидатов
-- Проблема: Триггер handle_new_user не копирует email из auth.users в таблицу candidates
-- Результат: Поле email в candidates остается NULL, отображается UUID вместо email

-- 1. Обновляем email для существующих кандидатов
UPDATE candidates c
SET email = au.email
FROM auth.users au
WHERE c.user_id = au.id AND c.email IS NULL;

-- 2. Обновляем триггер для копирования email при регистрации
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
  
  invite_token text;
  v_invite_record record;

  v_invitation_token text;
  v_candidate_id uuid;
BEGIN
  user_role := NEW.raw_user_meta_data->>'role';
  welcome_tokens := 5000;
  
  IF user_role = 'hr' THEN
    invite_token := NEW.raw_user_meta_data->>'invitation_token';
    
    IF invite_token IS NOT NULL THEN
        SELECT * INTO v_invite_record
        FROM public.hr_invitation_tokens
        WHERE token = invite_token AND is_used = false AND expires_at > now();
        
        IF FOUND THEN
            INSERT INTO hr_specialists (
              id, user_id, organization_id, full_name, role, is_active
            )
            VALUES (
              NEW.id,
              NEW.id,
              v_invite_record.organization_id,
              NEW.raw_user_meta_data->>'full_name',
              'member',
              true
            );
            
            UPDATE public.hr_invitation_tokens
            SET is_used = true,
                used_at = now(),
                used_by = NEW.id
            WHERE id = v_invite_record.id;
            
            RETURN NEW;
        END IF;
    END IF;
  
    org_name := NEW.raw_user_meta_data->>'organization_name';
    
    IF org_name IS NULL THEN
        org_name := 'My Organization';
    END IF;
    
    INSERT INTO organizations (name, owner_id, token_balance)
    VALUES (org_name, NEW.id, welcome_tokens)
    RETURNING id INTO org_id;
    
    INSERT INTO hr_specialists (
      id, user_id, organization_id, full_name, role, is_active
    )
    VALUES (
      NEW.id,
      NEW.id,
      org_id,
      NEW.raw_user_meta_data->>'full_name',
      'owner',
      true
    );
    
  ELSIF user_role = 'candidate' THEN
    v_invitation_token := NEW.raw_user_meta_data->>'invitation_token';

    IF v_invitation_token IS NOT NULL THEN
      SELECT used_by_candidate_id INTO v_candidate_id
      FROM invitation_tokens
      WHERE token = v_invitation_token;
    END IF;

    IF v_candidate_id IS NOT NULL THEN
      -- ОБНОВЛЯЕМ существующего кандидата (Link: Shadow -> Real)
      UPDATE candidates
      SET 
        user_id = NEW.id,
        email = NEW.email, -- ИСПРАВЛЕНИЕ: Добавляем email
        updated_at = now()
      WHERE id = v_candidate_id;
      
      UPDATE invitation_tokens
      SET is_used = true, used_at = now()
      WHERE token = v_invitation_token;
      
    ELSE
      -- СОЗДАЕМ нового кандидата (стандартная регистрация)
      v_hr_id := (NEW.raw_user_meta_data->>'invited_by_hr_id')::uuid;
      v_org_id := (NEW.raw_user_meta_data->>'invited_by_organization_id')::uuid;

      INSERT INTO candidates (
        id,
        user_id,
        email, -- ИСПРАВЛЕНИЕ: Добавляем email при создании
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
        NEW.email, -- ИСПРАВЛЕНИЕ: Копируем email из auth.users
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
  END IF;
  
  RETURN NEW;
END;
$$;