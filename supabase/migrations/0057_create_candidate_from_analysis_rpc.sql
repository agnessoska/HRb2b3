-- Делаем user_id необязательным и добавляем email
ALTER TABLE candidates 
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS email text;

-- Добавляем индекс для поиска по email
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- RPC функция для создания кандидата из анализа
CREATE OR REPLACE FUNCTION public.create_candidate_from_analysis(
  p_candidate_data jsonb,
  p_vacancy_id uuid,
  p_hr_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id uuid;
  v_candidate_id uuid;
  v_application_id uuid;
  v_token text;
  v_token_id uuid;
  v_skill text;
  v_email text;
BEGIN
  -- 1. Получаем ID организации
  SELECT organization_id INTO v_organization_id
  FROM hr_specialists
  WHERE user_id = p_hr_id;

  IF v_organization_id IS NULL THEN
    RAISE EXCEPTION 'HR specialist not found';
  END IF;

  v_email := p_candidate_data->>'email';

  -- 2. Ищем существующего кандидата по email (если email есть)
  IF v_email IS NOT NULL THEN
    SELECT id INTO v_candidate_id
    FROM candidates
    WHERE email = v_email
    LIMIT 1;
  END IF;

  -- 3. Если кандидат не найден, создаем нового (Теневой профиль)
  IF v_candidate_id IS NULL THEN
    INSERT INTO candidates (
      full_name,
      email,
      phone,
      experience,
      education,
      about,
      invited_by_hr_id,
      invited_by_organization_id,
      is_public
    )
    VALUES (
      p_candidate_data->>'name',
      v_email,
      p_candidate_data->>'phone',
      p_candidate_data->>'summary', -- Используем summary как experience/about для начала
      NULL, -- Education пока не парсим детально, можно добавить позже
      p_candidate_data->>'summary',
      p_hr_id,
      v_organization_id,
      false -- Теневой профиль не публичен
    )
    RETURNING id INTO v_candidate_id;
  END IF;

  -- 4. Добавляем навыки (если есть)
  -- Удаляем старые навыки, если это обновление? Нет, лучше добавляем новые.
  IF p_candidate_data ? 'skills' AND p_candidate_data->'skills' ? 'hard_skills_match' THEN
    FOR v_skill IN SELECT * FROM jsonb_array_elements_text(p_candidate_data->'skills'->'hard_skills_match')
    LOOP
      -- Вставляем навык, игнорируя дубликаты
      INSERT INTO candidate_skills (candidate_id, canonical_skill)
      VALUES (v_candidate_id, lower(v_skill))
      ON CONFLICT (candidate_id, canonical_skill) DO NOTHING;
    END LOOP;
  END IF;

  -- 5. Создаем заявку (Application)
  INSERT INTO applications (
    candidate_id,
    vacancy_id,
    organization_id,
    status,
    added_by_hr_id
  )
  VALUES (
    v_candidate_id,
    p_vacancy_id,
    v_organization_id,
    'invited',
    p_hr_id
  )
  ON CONFLICT (candidate_id, vacancy_id) DO NOTHING
  RETURNING id INTO v_application_id;

  -- Если заявка уже была, получаем её ID
  IF v_application_id IS NULL THEN
    SELECT id INTO v_application_id
    FROM applications
    WHERE candidate_id = v_candidate_id AND vacancy_id = p_vacancy_id;
  END IF;

  -- 6. Генерируем токен приглашения
  v_token := encode(extensions.gen_random_bytes(16), 'hex');
  
  INSERT INTO invitation_tokens (
    token,
    created_by_hr_id,
    organization_id,
    used_by_candidate_id, -- Привязываем токен сразу к этому кандидату!
    is_used
  )
  VALUES (
    v_token,
    p_hr_id,
    v_organization_id,
    v_candidate_id,
    false
  )
  RETURNING id INTO v_token_id;

  -- 7. Возвращаем результат
  RETURN jsonb_build_object(
    'candidate_id', v_candidate_id,
    'application_id', v_application_id,
    'invite_token', v_token
  );
END;
$$;