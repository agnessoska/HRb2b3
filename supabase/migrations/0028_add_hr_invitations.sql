-- Создаем таблицу для приглашений HR
CREATE TABLE IF NOT EXISTS public.hr_invitation_tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    token text NOT NULL UNIQUE,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email text NOT NULL,
    created_by uuid NOT NULL REFERENCES public.hr_specialists(id),
    created_at timestamptz DEFAULT now() NOT NULL,
    expires_at timestamptz NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    used_at timestamptz,
    used_by uuid REFERENCES public.hr_specialists(id)
);

-- Включаем RLS
ALTER TABLE public.hr_invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Политики доступа (RLS)

-- Владельцы и участники организации могут видеть токены своей организации
CREATE POLICY "hr_can_view_own_org_invitations"
ON public.hr_invitation_tokens FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.hr_specialists 
    WHERE user_id = auth.uid()
  )
);

-- Только владельцы могут создавать приглашения (опционально, можно расширить на всех HR)
CREATE POLICY "hr_can_create_invitations"
ON public.hr_invitation_tokens FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.hr_specialists 
    WHERE user_id = auth.uid()
  )
);

-- Публичный доступ для валидации токена (только чтение по точному совпадению токена)
-- Используем security definer функцию для валидации, чтобы не открывать таблицу публично
-- Поэтому политика public здесь не нужна, если мы используем RPC с security definer

-- Функция для генерации токена приглашения
CREATE OR REPLACE FUNCTION public.generate_hr_invitation_token(
    p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_hr_id uuid;
    v_org_id uuid;
    v_token text;
    v_expires_at timestamptz;
BEGIN
    -- Получаем ID текущего HR
    SELECT id, organization_id INTO v_hr_id, v_org_id
    FROM public.hr_specialists
    WHERE user_id = auth.uid();

    IF v_hr_id IS NULL OR v_org_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'HR profile not found');
    END IF;

    -- Проверяем, не приглашен ли уже этот email (активное приглашение)
    IF EXISTS (
        SELECT 1 FROM public.hr_invitation_tokens
        WHERE email = p_email 
          AND organization_id = v_org_id 
          AND is_used = false 
          AND expires_at > now()
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Active invitation already exists for this email');
    END IF;

    -- Генерируем токен
    v_token := encode(extensions.gen_random_bytes(32), 'hex');
    v_expires_at := now() + interval '7 days';

    -- Создаем запись
    INSERT INTO public.hr_invitation_tokens (
        token, organization_id, email, created_by, expires_at
    ) VALUES (
        v_token, v_org_id, p_email, v_hr_id, v_expires_at
    );

    RETURN jsonb_build_object(
        'success', true,
        'token', v_token,
        'expires_at', v_expires_at
    );
END;
$$;

-- Функция для валидации токена (вызывается с фронтенда при открытии ссылки)
CREATE OR REPLACE FUNCTION public.validate_hr_invitation_token(
    p_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite record;
    v_org_name text;
BEGIN
    -- Ищем токен
    SELECT * INTO v_invite
    FROM public.hr_invitation_tokens
    WHERE token = p_token;

    -- Проверки
    IF v_invite IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token not found');
    END IF;

    IF v_invite.is_used THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token already used');
    END IF;

    IF v_invite.expires_at < now() THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token expired');
    END IF;

    -- Получаем название организации
    SELECT name INTO v_org_name
    FROM public.organizations
    WHERE id = v_invite.organization_id;

    RETURN jsonb_build_object(
        'valid', true,
        'email', v_invite.email,
        'organization_name', v_org_name
    );
END;
$$;

-- Обновленная функция handle_new_user с поддержкой приглашений
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
  -- Получаем роль из метаданных
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Получаем стартовый баланс токенов (установим значение по умолчанию, если переменная не задана)
  welcome_tokens := 5000;
  
  IF user_role = 'hr' THEN
    -- Проверяем наличие токена приглашения
    invite_token := NEW.raw_user_meta_data->>'invitation_token';
    
    IF invite_token IS NOT NULL THEN
        -- Пытаемся найти валидное приглашение
        SELECT * INTO v_invite_record
        FROM public.hr_invitation_tokens
        WHERE token = invite_token AND is_used = false AND expires_at > now();
        
        IF v_invite_record IS NOT NULL THEN
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
            
            RETURN NEW; -- Завершаем выполнение, организация не создается
        END IF;
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