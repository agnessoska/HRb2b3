CREATE OR REPLACE FUNCTION search_skills(
    search_query TEXT,
    skill_category TEXT DEFAULT NULL,
    result_limit INT DEFAULT 20
)
RETURNS TABLE (
    canonical_name TEXT,
    name TEXT,
    category TEXT
) AS $$
BEGIN
    IF search_query IS NULL OR search_query = '' THEN
        -- Если запрос пуст, возвращаем случайный набор навыков
        RETURN QUERY
        SELECT
            s.canonical_name,
            s.name,
            s.category
        FROM
            public.skills_dictionary s
        WHERE s.language = 'ru'
        ORDER BY
            random() -- Случайная сортировка
        LIMIT result_limit;
    ELSE
        -- Если есть запрос, выполняем поиск по вхождению
        RETURN QUERY
        SELECT
            s.canonical_name,
            s.name,
            s.category
        FROM
            public.skills_dictionary s
        WHERE
            s.language = 'ru' AND
            LOWER(s.name) LIKE '%' || LOWER(search_query) || '%' AND
            (skill_category IS NULL OR s.category = skill_category)
        GROUP BY
            s.canonical_name, s.name, s.category
        ORDER BY
            CASE
                WHEN LOWER(s.name) LIKE LOWER(search_query) || '%' THEN 0
                ELSE 1
            END,
            s.name
        LIMIT result_limit;
    END IF;
END;
$$ LANGUAGE plpgsql;
