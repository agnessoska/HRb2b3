CREATE OR REPLACE FUNCTION search_skills(
    search_query TEXT,
    skill_category TEXT DEFAULT NULL,
    result_limit INT DEFAULT 10
)
RETURNS TABLE (
    canonical_name TEXT,
    name TEXT,
    category TEXT
) AS $$
BEGIN
    -- Используем LOWER() для регистронезависимого поиска
    search_query := LOWER(search_query);

    RETURN QUERY
    SELECT
        s.canonical_name,
        s.name,
        s.category
    FROM
        public.skills_dictionary s
    WHERE
        -- Применяем фильтр по языку 'ru', чтобы избежать дубликатов
        s.language = 'ru' AND
        -- Поиск по вхождению в название навыка
        (search_query IS NULL OR LOWER(s.name) LIKE '%' || search_query || '%') AND
        -- Фильтр по категории, если она указана
        (skill_category IS NULL OR s.category = skill_category)
    GROUP BY
        s.canonical_name, s.name, s.category
    ORDER BY
        -- Приоритет для тех, кто начинается с поискового запроса
        CASE
            WHEN LOWER(s.name) LIKE search_query || '%' THEN 0
            ELSE 1
        END,
        -- Сортировка по алфавиту
        s.name
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
