-- Добавляем функцию для получения статистики расходов команды
CREATE OR REPLACE FUNCTION public.get_team_spending_stats(
    p_organization_id uuid
)
RETURNS TABLE (
    id uuid,
    full_name text,
    ai_tokens bigint,
    invite_tokens bigint,
    market_tokens bigint,
    total_spent bigint
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
        -- AI Tokens
        COALESCE((
            SELECT SUM(aol.total_tokens)
            FROM ai_operations_log aol
            WHERE aol.hr_specialist_id = h.id
        ), 0)::bigint as ai_tokens,
        -- Invite Tokens (500 per token)
        COALESCE((
            SELECT COUNT(*) * 500
            FROM invitation_tokens it
            WHERE it.created_by_hr_id = h.id
        ), 0)::bigint as invite_tokens,
        -- Market Tokens (1000 per acquisition)
        -- Считаем, что покупка была, если HR добавил кандидата в applications,
        -- но кандидат изначально не был приглашен этим HR
        COALESCE((
            SELECT COUNT(*) * 1000
            FROM applications a
            JOIN candidates c ON c.id = a.candidate_id
            WHERE a.added_by_hr_id = h.id
              AND (c.invited_by_hr_id IS NULL OR c.invited_by_hr_id != h.id)
        ), 0)::bigint as market_tokens,
        -- Total
        (
            COALESCE((
                SELECT SUM(aol.total_tokens)
                FROM ai_operations_log aol
                WHERE aol.hr_specialist_id = h.id
            ), 0) +
            COALESCE((
                SELECT COUNT(*) * 500
                FROM invitation_tokens it
                WHERE it.created_by_hr_id = h.id
            ), 0) +
            COALESCE((
                SELECT COUNT(*) * 1000
                FROM applications a
                JOIN candidates c ON c.id = a.candidate_id
                WHERE a.added_by_hr_id = h.id
                  AND (c.invited_by_hr_id IS NULL OR c.invited_by_hr_id != h.id)
            ), 0)
        )::bigint as total_spent
    FROM hr_specialists h
    WHERE h.organization_id = p_organization_id
    ORDER BY total_spent DESC;
END;
$$;