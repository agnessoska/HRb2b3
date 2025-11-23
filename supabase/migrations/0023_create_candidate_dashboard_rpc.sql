CREATE OR REPLACE FUNCTION get_candidate_dashboard_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_candidate_id uuid;
    v_profile jsonb;
    v_tests jsonb;
    v_applications jsonb;
    v_messages jsonb;
BEGIN
    -- 1. Get candidate ID from user_id
    SELECT id INTO v_candidate_id FROM public.candidates WHERE user_id = p_user_id;

    IF v_candidate_id IS NULL THEN
        RETURN jsonb_build_object('error', 'Candidate not found');
    END IF;

    -- 2. Get candidate profile
    SELECT row_to_json(c) INTO v_profile
    FROM (
        SELECT id, full_name, is_public, tests_completed
        FROM public.candidates
        WHERE id = v_candidate_id
    ) c;

    -- 3. Get all tests and candidate's results for them
    SELECT jsonb_agg(t) INTO v_tests
    FROM (
        SELECT
            t.id,
            t.code,
            t.name_ru,
            t.name_en,
            t.name_kk,
            t.description_ru,
            t.description_en,
            t.description_kk,
            ctr.completed_at,
            (CASE
                WHEN ctr.id IS NOT NULL THEN TRUE
                ELSE FALSE
            END) as is_completed,
            (CASE
                WHEN ctr.completed_at IS NOT NULL AND ctr.completed_at < (now() - interval '2 months') THEN 'expired'
                WHEN ctr.completed_at IS NOT NULL AND ctr.completed_at < (now() - interval '1 month') THEN 'expiring'
                WHEN ctr.completed_at IS NOT NULL THEN 'actual'
                ELSE 'not_started'
            END) as status
        FROM public.tests t
        LEFT JOIN public.candidate_test_results ctr ON t.id = ctr.test_id AND ctr.candidate_id = v_candidate_id
        WHERE t.is_active = true
        ORDER BY t.sort_order
    ) t;

    -- 4. Get active applications
    SELECT jsonb_agg(a) INTO v_applications
    FROM (
        SELECT
            a.id,
            a.status,
            v.title as vacancy_title,
            o.name as organization_name
        FROM public.applications a
        JOIN public.vacancies v ON a.vacancy_id = v.id
        JOIN public.organizations o ON a.organization_id = o.id
        WHERE a.candidate_id = v_candidate_id AND a.status NOT IN ('hired', 'rejected')
        ORDER BY a.updated_at DESC
        LIMIT 5
    ) a;

    -- 5. Get recent chat messages
    SELECT jsonb_agg(m) INTO v_messages
    FROM (
        SELECT
            m.id,
            m.message_text,
            m.sender_type,
            hs.full_name as hr_specialist_name
        FROM public.chat_messages m
        JOIN public.chat_rooms cr ON m.chat_room_id = cr.id
        LEFT JOIN public.hr_specialists hs ON cr.hr_specialist_id = hs.id
        WHERE cr.candidate_id = v_candidate_id
        ORDER BY m.created_at DESC
        LIMIT 5
    ) m;

    -- 6. Combine all data
    RETURN jsonb_build_object(
        'profile', v_profile,
        'tests', v_tests,
        'applications', v_applications,
        'messages', v_messages
    );

END;
$$;