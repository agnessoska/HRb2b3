-- Функция для получения списка коллег со статистикой
CREATE OR REPLACE FUNCTION public.get_colleagues_with_stats(
    p_organization_id uuid
)
RETURNS TABLE (
    id uuid,
    full_name text,
    role text,
    is_active boolean,
    created_at timestamptz,
    candidates_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        h.id,
        h.full_name,
        h.role,
        h.is_active,
        h.created_at,
        (
            SELECT count(*)::integer
            FROM candidates c
            WHERE c.invited_by_hr_id = h.id
        ) as candidates_count
    FROM hr_specialists h
    WHERE h.organization_id = p_organization_id
    ORDER BY h.created_at ASC;
END;
$$;

-- Функция для получения кандидатов, приглашенных конкретным HR
CREATE OR REPLACE FUNCTION public.get_candidates_by_hr(
    p_hr_id uuid
)
RETURNS TABLE (
    id uuid,
    full_name text,
    category_name text,
    created_at timestamptz,
    tests_completed integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.full_name,
        pc.name_ru as category_name, -- Используем RU как дефолт, или можно возвращать JSON с переводами
        c.created_at,
        c.tests_completed
    FROM candidates c
    LEFT JOIN professional_categories pc ON c.category_id = pc.id
    WHERE c.invited_by_hr_id = p_hr_id
    ORDER BY c.created_at DESC;
END;
$$;